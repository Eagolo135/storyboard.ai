import {
  createSourceDocumentChunkInputSchema,
  type CreateSourceDocumentChunkInput,
} from "@/lib/source-chunks/schema";

const TARGET_CHUNK_LENGTH = 900;
const MIN_CHUNK_LENGTH = 260;

function normalizeWhitespace(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\t/g, " ").trim();
}

function splitIntoSentences(value: string) {
  return value
    .match(/[^.!?\n]+(?:[.!?]+|$)/g)
    ?.map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean) ?? [value.trim()];
}

function splitLongParagraph(paragraph: string) {
  if (paragraph.length <= TARGET_CHUNK_LENGTH) {
    return [paragraph.trim()];
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of splitIntoSentences(paragraph)) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length > TARGET_CHUNK_LENGTH && current.length >= MIN_CHUNK_LENGTH) {
      chunks.push(current.trim());
      current = sentence;
      continue;
    }

    current = candidate;
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function splitIntoSections(rawText: string) {
  return normalizeWhitespace(rawText)
    .split(/\n\s*\n+/)
    .flatMap((paragraph) => splitLongParagraph(paragraph))
    .map((section) => section.trim())
    .filter(Boolean);
}

function countTokens(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function buildHeading(title: string, chunkIndex: number) {
  return chunkIndex === 0 ? title.trim() : `${title.trim()} (${chunkIndex + 1})`;
}

export function chunkSourceDocument(params: {
  sourceDocumentId: string;
  storyId: string;
  title: string;
  rawText: string;
}): CreateSourceDocumentChunkInput[] {
  const sections = splitIntoSections(params.rawText);

  return sections.map((content, chunkIndex) => {
    return createSourceDocumentChunkInputSchema.parse({
      sourceDocumentId: params.sourceDocumentId,
      storyId: params.storyId,
      chunkIndex,
      heading: buildHeading(params.title, chunkIndex),
      content,
      tokenCount: countTokens(content),
      characterCount: content.length,
    });
  });
}