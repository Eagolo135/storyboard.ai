import { createEmbeddings } from "@/lib/ai/openai-client";
import {
  getAiEmbeddingConfig,
  isAiEmbeddingConfigured,
} from "@/lib/platform/env";
import { chunkSourceDocument } from "@/lib/source-chunks/chunk";
import { getSourceDocumentChunkRepository } from "@/lib/source-chunks/repository";
import type {
  CreateSourceDocumentChunkInput,
  SourceDocumentChunk,
  SourceDocumentChunkEmbeddingUpdate,
} from "@/lib/source-chunks/schema";
import type { SourceDocumentRecord } from "@/lib/source-documents/schema";

export async function listSourceDocumentChunksForStory(ownerId: string, storyId: string) {
  return getSourceDocumentChunkRepository().listSourceDocumentChunksForStory(ownerId, storyId);
}

function embeddingInputForChunk(chunk: { heading: string | null; content: string }) {
  return [chunk.heading ?? "", chunk.content].filter(Boolean).join("\n\n");
}

async function addEmbeddingsToChunkInputs(chunks: CreateSourceDocumentChunkInput[]) {
  if (!isAiEmbeddingConfigured()) {
    return chunks;
  }

  try {
    const config = getAiEmbeddingConfig();
    const embeddings = await createEmbeddings(chunks.map((chunk) => embeddingInputForChunk(chunk)));
    const embeddedAt = new Date().toISOString();

    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index] ?? null,
      embeddingModel: embeddings[index] ? config.model : null,
      embeddedAt: embeddings[index] ? embeddedAt : null,
    }));
  } catch {
    return chunks.map((chunk) => ({
      ...chunk,
      embedding: null,
      embeddingModel: null,
      embeddedAt: null,
    }));
  }
}

function chunkHasEmbedding(chunk: SourceDocumentChunk) {
  return Boolean(chunk.embedding && chunk.embedding.length > 0);
}

export async function ensureEmbeddingsForStoryChunks(
  ownerId: string,
  chunks: SourceDocumentChunk[],
) {
  if (!isAiEmbeddingConfigured()) {
    return {
      ok: true as const,
      data: chunks,
      warning: undefined,
    };
  }

  const missing = chunks.filter((chunk) => !chunkHasEmbedding(chunk));

  if (missing.length === 0) {
    return {
      ok: true as const,
      data: chunks,
      warning: undefined,
    };
  }

  try {
    const config = getAiEmbeddingConfig();
    const embeddings = await createEmbeddings(missing.map((chunk) => embeddingInputForChunk(chunk)));
    const embeddedAt = new Date().toISOString();
    const updates: SourceDocumentChunkEmbeddingUpdate[] = missing
      .map((chunk, index) => {
        const embedding = embeddings[index];

        if (!embedding) {
          return null;
        }

        return {
          id: chunk.id,
          embedding,
          embeddingModel: config.model,
          embeddedAt,
        } satisfies SourceDocumentChunkEmbeddingUpdate;
      })
      .filter((value): value is SourceDocumentChunkEmbeddingUpdate => value !== null);

    if (updates.length === 0) {
      return {
        ok: true as const,
        data: chunks,
        warning: "Embedding backfill returned no vectors, so retrieval stayed lexical.",
      };
    }

    const updateResult = await getSourceDocumentChunkRepository().updateEmbeddingsForChunks(
      ownerId,
      updates,
    );

    if (!updateResult.ok) {
      return updateResult;
    }

    const updatedById = new Map(updateResult.data.map((chunk) => [chunk.id, chunk]));

    return {
      ok: true as const,
      data: chunks.map((chunk) => updatedById.get(chunk.id) ?? chunk),
      warning: undefined,
    };
  } catch (error) {
    return {
      ok: true as const,
      data: chunks,
      warning:
        error instanceof Error
          ? `${error.message} Retrieval stayed lexical because embeddings could not be generated.`
          : "Retrieval stayed lexical because embeddings could not be generated.",
    };
  }
}

export async function createChunksForSourceDocument(
  ownerId: string,
  document: SourceDocumentRecord,
) {
  if (!document.rawText) {
    return {
      ok: false as const,
      error: "No extracted text is available for this source document.",
    };
  }

  const chunks = chunkSourceDocument({
    sourceDocumentId: document.id,
    storyId: document.storyId,
    title: document.fileName ?? "Source document",
    rawText: document.rawText,
  });
  const chunksWithEmbeddings = await addEmbeddingsToChunkInputs(chunks);

  return getSourceDocumentChunkRepository().replaceSourceDocumentChunksForDocument(
    ownerId,
    document.id,
    document.storyId,
    chunksWithEmbeddings,
  );
}