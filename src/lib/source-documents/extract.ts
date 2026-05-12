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
    const rawText = result.value.trim();

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
  const rawText = result.text.trim();

  await parser.destroy();

  if (!rawText) {
    throw new Error("The uploaded PDF file did not contain extractable text.");
  }

  return {
    sourceType,
    rawText,
  };
}