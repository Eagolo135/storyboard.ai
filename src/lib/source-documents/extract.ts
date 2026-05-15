import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { type SourceDocumentType } from "@/lib/source-documents/schema";

type UploadSourceType = Exclude<SourceDocumentType, "pasted-text">;

export function getUploadSourceTypeFromFileName(
  fileName: string,
): UploadSourceType | null {
  const normalizedFileName = fileName.trim().toLowerCase();

  if (normalizedFileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalizedFileName.endsWith(".docx")) {
    return "docx";
  }

  return null;
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function isPageMarkerLine(line: string) {
  return /^(?:--\s*)?\d+\s+of\s+\d+(?:\s*--)?$/i.test(line.trim());
}

function isSystemLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    return false;
  }

  if (/^[>\[]/.test(trimmed)) {
    return true;
  }

  if (/^(?:name|race|species|rank|class|level|titles|traits|skills|stat points available|details|processing complete)\s*:/i.test(trimmed)) {
    return true;
  }

  return false;
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > 90) {
    return false;
  }

  if (/^(chapter|prologue|epilogue|part)\b/i.test(trimmed)) {
    return true;
  }

  if (/^\d+[.):-]?\s+[A-Z]/.test(trimmed)) {
    return true;
  }

  if (
    /^[A-Z0-9][A-Za-z0-9'’():-]*(?:\s+[A-Z0-9][A-Za-z0-9'’():-]*)*$/u.test(trimmed) &&
    !/[.!?]$/.test(trimmed)
  ) {
    return true;
  }

  return false;
}

function isChapterBoundaryLine(line: string) {
  const trimmed = line.trim();

  return /^(chapter|prologue|epilogue|part)\b/i.test(trimmed) || /^\d+[.):-]?\s+[A-Z]/.test(trimmed);
}

function isFrontMatterBlock(block: string) {
  const trimmed = block.trim();

  if (!trimmed || trimmed.length > 120) {
    return false;
  }

  if (isSystemLine(trimmed) || /[.!?]$/.test(trimmed)) {
    return false;
  }

  return trimmed.split(/\s+/u).length <= 12;
}

function stripLeadingFrontMatterBlocks(blocks: string[]) {
  const firstChapterIndex = blocks.findIndex((block) => isChapterBoundaryLine(block));

  if (firstChapterIndex <= 0 || firstChapterIndex > 6) {
    return blocks;
  }

  const frontMatter = blocks.slice(0, firstChapterIndex);

  if (frontMatter.every((block) => isFrontMatterBlock(block))) {
    return blocks.slice(firstChapterIndex);
  }

  return blocks;
}

function appendWrappedLine(paragraph: string, line: string) {
  const trimmed = line.trim();

  if (!paragraph) {
    return trimmed;
  }

  if (paragraph.endsWith("-")) {
    return `${paragraph.slice(0, -1)}${trimmed}`;
  }

  return `${paragraph} ${trimmed}`;
}

export function normalizeExtractedSourceText(
  rawText: string,
  sourceType: UploadSourceType,
) {
  const normalized = normalizeLineEndings(rawText)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => !isPageMarkerLine(line));

  if (sourceType === "docx") {
    return normalized
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const blocks: string[] = [];
  let paragraph = "";

  function flushParagraph() {
    if (paragraph.trim()) {
      blocks.push(paragraph.trim());
      paragraph = "";
    }
  }

  for (const line of normalized) {
    if (!line) {
      flushParagraph();
      continue;
    }

    if (isSystemLine(line)) {
      flushParagraph();
      blocks.push(line);
      continue;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      blocks.push(line);
      continue;
    }

    paragraph = appendWrappedLine(paragraph, line);
  }

  flushParagraph();

  return stripLeadingFrontMatterBlocks(blocks)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractSourceTextFromUpload(
  fileName: string,
  buffer: Buffer,
): Promise<{ sourceType: UploadSourceType; rawText: string }> {
  const sourceType = getUploadSourceTypeFromFileName(fileName);

  if (!sourceType) {
    throw new Error("Only PDF and DOCX uploads are supported in this sprint.");
  }

  if (sourceType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = normalizeExtractedSourceText(result.value, sourceType);

    if (!rawText) {
      throw new Error("The uploaded DOCX file did not contain extractable text.");
    }

    return {
      sourceType,
      rawText,
    };
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const rawText = normalizeExtractedSourceText(result.text, sourceType);

  await parser.destroy();

  if (!rawText) {
    throw new Error("The uploaded PDF file did not contain extractable text.");
  }

  return {
    sourceType,
    rawText,
  };
}