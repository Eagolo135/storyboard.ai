import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import {
  type CreateSourceDocumentRecordInput,
  type SourceDocumentRecord,
  sourceDocumentRecordSchema,
} from "@/lib/source-documents/schema";

export type SourceDocumentRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface SourceDocumentRepository {
  listSourceDocumentsForOwner(
    ownerId: string,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord[]>>;
  listSourceDocumentsForStory(
    ownerId: string,
    storyId: string,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord[]>>;
  createSourceDocumentForOwner(
    ownerId: string,
    input: CreateSourceDocumentRecordInput,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord>>;
  updateSourceDocumentProcessingStatusForOwner(
    ownerId: string,
    sourceDocumentId: string,
    processingStatus: SourceDocumentRecord["processingStatus"],
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord>>;
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

function mapSourceDocumentRow(row: Record<string, unknown>): SourceDocumentRecord {
  return sourceDocumentRecordSchema.parse({
    id: row.id,
    storyId: row.story_id,
    ownerId: row.owner_clerk_id,
    sourceType: row.source_type,
    fileName: row.file_name ?? null,
    storagePath: row.storage_path ?? null,
    rawText: row.raw_text ?? null,
    processingStatus: row.processing_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

class SupabaseSourceDocumentRepository implements SourceDocumentRepository {
  async listSourceDocumentsForOwner(
    ownerId: string,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord[]>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("source_documents")
        .select(
          "id, story_id, owner_clerk_id, source_type, file_name, storage_path, raw_text, processing_status, created_at, updated_at",
        )
        .eq("owner_clerk_id", ownerId)
        .order("updated_at", { ascending: false });

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => mapSourceDocumentRow(row)),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to list source documents.",
      };
    }
  }

  async listSourceDocumentsForStory(
    ownerId: string,
    storyId: string,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord[]>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("source_documents")
        .select(
          "id, story_id, owner_clerk_id, source_type, file_name, storage_path, raw_text, processing_status, created_at, updated_at",
        )
        .eq("owner_clerk_id", ownerId)
        .eq("story_id", storyId)
        .order("updated_at", { ascending: false });

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => mapSourceDocumentRow(row)),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to list story sources.",
      };
    }
  }

  async createSourceDocumentForOwner(
    ownerId: string,
    input: CreateSourceDocumentRecordInput,
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("source_documents")
        .insert({
          owner_clerk_id: ownerId,
          story_id: input.storyId,
          source_type: input.sourceType,
          file_name: input.title,
          storage_path: input.storagePath,
          raw_text: input.rawText,
          processing_status: input.processingStatus,
        })
        .select(
          "id, story_id, owner_clerk_id, source_type, file_name, storage_path, raw_text, processing_status, created_at, updated_at",
        )
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: mapSourceDocumentRow(data),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to create source document.",
      };
    }
  }

  async updateSourceDocumentProcessingStatusForOwner(
    ownerId: string,
    sourceDocumentId: string,
    processingStatus: SourceDocumentRecord["processingStatus"],
  ): Promise<SourceDocumentRepositoryResult<SourceDocumentRecord>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("source_documents")
        .update({
          processing_status: processingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("owner_clerk_id", ownerId)
        .eq("id", sourceDocumentId)
        .select(
          "id, story_id, owner_clerk_id, source_type, file_name, storage_path, raw_text, processing_status, created_at, updated_at",
        )
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: mapSourceDocumentRow(data),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to update source document status.",
      };
    }
  }
}

class UnconfiguredSourceDocumentRepository implements SourceDocumentRepository {
  async listSourceDocumentsForOwner(): Promise<
    SourceDocumentRepositoryResult<SourceDocumentRecord[]>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before listing source documents.",
    };
  }

  async listSourceDocumentsForStory(): Promise<
    SourceDocumentRepositoryResult<SourceDocumentRecord[]>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before listing source documents.",
    };
  }

  async createSourceDocumentForOwner(): Promise<
    SourceDocumentRepositoryResult<SourceDocumentRecord>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before creating source documents.",
    };
  }

  async updateSourceDocumentProcessingStatusForOwner(): Promise<
    SourceDocumentRepositoryResult<SourceDocumentRecord>
  > {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before updating source documents.",
    };
  }
}

export function getSourceDocumentRepository(): SourceDocumentRepository {
  if (!isSupabaseConfigured()) {
    return new UnconfiguredSourceDocumentRepository();
  }

  return new SupabaseSourceDocumentRepository();
}