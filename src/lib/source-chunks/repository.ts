import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import {
  type CreateSourceDocumentChunkInput,
  type SourceDocumentChunkEmbeddingUpdate,
  type SourceDocumentChunk,
  sourceDocumentChunkSchema,
} from "@/lib/source-chunks/schema";

const SOURCE_DOCUMENT_CHUNK_INSERT_BATCH_SIZE = 50;

export type SourceDocumentChunkRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface SourceDocumentChunkRepository {
  listSourceDocumentChunksForStory(
    ownerId: string,
    storyId: string,
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>>;
  replaceSourceDocumentChunksForDocument(
    ownerId: string,
    sourceDocumentId: string,
    storyId: string,
    chunks: CreateSourceDocumentChunkInput[],
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>>;
  updateEmbeddingsForChunks(
    ownerId: string,
    updates: SourceDocumentChunkEmbeddingUpdate[],
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>>;
}

function createSupabaseAdminClient() {
  const config = getSupabaseAdminConfig();

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapSourceDocumentChunkRow(row: Record<string, unknown>): SourceDocumentChunk {
  const sourceDocument =
    typeof row.source_documents === "object" && row.source_documents !== null
      ? (row.source_documents as Record<string, unknown>)
      : null;

  return sourceDocumentChunkSchema.parse({
    id: row.id,
    sourceDocumentId: row.source_document_id,
    sourceDocumentTitle: sourceDocument?.file_name ?? null,
    storyId: row.story_id,
    ownerId: row.owner_clerk_id,
    chunkIndex: row.chunk_index,
    heading: row.heading ?? null,
    content: row.content,
    tokenCount: row.token_count,
    characterCount: row.character_count,
    embedding: Array.isArray(row.embedding) ? row.embedding : null,
    embeddingModel: row.embedding_model ?? null,
    embeddedAt: row.embedded_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

class SupabaseSourceDocumentChunkRepository implements SourceDocumentChunkRepository {
  async listSourceDocumentChunksForStory(
    ownerId: string,
    storyId: string,
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("source_document_chunks")
        .select(
          "id, source_document_id, story_id, owner_clerk_id, chunk_index, heading, content, token_count, character_count, embedding, embedding_model, embedded_at, created_at, updated_at, source_documents(file_name)",
        )
        .eq("owner_clerk_id", ownerId)
        .eq("story_id", storyId)
        .order("created_at", { ascending: true })
        .order("chunk_index", { ascending: true });

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => mapSourceDocumentChunkRow(row)),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to list source document chunks.",
      };
    }
  }

  async replaceSourceDocumentChunksForDocument(
    ownerId: string,
    sourceDocumentId: string,
    storyId: string,
    chunks: CreateSourceDocumentChunkInput[],
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>> {
    try {
      const client = createSupabaseAdminClient();
      const { error: deleteError } = await client
        .from("source_document_chunks")
        .delete()
        .eq("owner_clerk_id", ownerId)
        .eq("source_document_id", sourceDocumentId);

      if (deleteError) {
        return { ok: false, error: deleteError.message };
      }

      if (chunks.length === 0) {
        return { ok: true, data: [] };
      }

      const inserted: SourceDocumentChunk[] = [];

      for (
        let startIndex = 0;
        startIndex < chunks.length;
        startIndex += SOURCE_DOCUMENT_CHUNK_INSERT_BATCH_SIZE
      ) {
        const batch = chunks.slice(
          startIndex,
          startIndex + SOURCE_DOCUMENT_CHUNK_INSERT_BATCH_SIZE,
        );
        const { data, error } = await client
          .from("source_document_chunks")
          .insert(
            batch.map((chunk) => ({
              owner_clerk_id: ownerId,
              source_document_id: sourceDocumentId,
              story_id: storyId,
              chunk_index: chunk.chunkIndex,
              heading: chunk.heading,
              content: chunk.content,
              token_count: chunk.tokenCount,
              character_count: chunk.characterCount,
              embedding: chunk.embedding,
              embedding_model: chunk.embeddingModel,
              embedded_at: chunk.embeddedAt,
            })),
          )
          .select(
            "id, source_document_id, story_id, owner_clerk_id, chunk_index, heading, content, token_count, character_count, embedding, embedding_model, embedded_at, created_at, updated_at, source_documents(file_name)",
          );

        if (error) {
          return { ok: false, error: error.message };
        }

        inserted.push(...(data ?? []).map((row) => mapSourceDocumentChunkRow(row)));
      }

      return {
        ok: true,
        data: inserted,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to replace source document chunks.",
      };
    }
  }

  async updateEmbeddingsForChunks(
    ownerId: string,
    updates: SourceDocumentChunkEmbeddingUpdate[],
  ): Promise<SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>> {
    try {
      const client = createSupabaseAdminClient();
      const results = await Promise.all(
        updates.map(async (update) => {
          const { data, error } = await client
            .from("source_document_chunks")
            .update({
              embedding: update.embedding,
              embedding_model: update.embeddingModel,
              embedded_at: update.embeddedAt,
              updated_at: new Date().toISOString(),
            })
            .eq("owner_clerk_id", ownerId)
            .eq("id", update.id)
            .select(
              "id, source_document_id, story_id, owner_clerk_id, chunk_index, heading, content, token_count, character_count, embedding, embedding_model, embedded_at, created_at, updated_at, source_documents(file_name)",
            )
            .single();

          if (error) {
            throw new Error(error.message);
          }

          return mapSourceDocumentChunkRow(data);
        }),
      );

      return {
        ok: true,
        data: results,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to update source chunk embeddings.",
      };
    }
  }
}

class UnconfiguredSourceDocumentChunkRepository implements SourceDocumentChunkRepository {
  async listSourceDocumentChunksForStory(): Promise<
    SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before listing source document chunks.",
    };
  }

  async replaceSourceDocumentChunksForDocument(): Promise<
    SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before creating source document chunks.",
    };
  }

  async updateEmbeddingsForChunks(): Promise<
    SourceDocumentChunkRepositoryResult<SourceDocumentChunk[]>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before updating source chunk embeddings.",
    };
  }
}

export function getSourceDocumentChunkRepository(): SourceDocumentChunkRepository {
  if (!isSupabaseConfigured()) {
    return new UnconfiguredSourceDocumentChunkRepository();
  }

  return new SupabaseSourceDocumentChunkRepository();
}