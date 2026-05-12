import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import {
  type CreateStoryInput,
  type StoryRecord,
  storyRecordSchema,
} from "@/lib/stories/schema";

export type StoryRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface StoryRepository {
  listStoriesForOwner(ownerId: string): Promise<StoryRepositoryResult<StoryRecord[]>>;
  getStoryForOwner(
    ownerId: string,
    storyId: string,
  ): Promise<StoryRepositoryResult<StoryRecord>>;
  createStoryForOwner(
    ownerId: string,
    input: CreateStoryInput,
  ): Promise<StoryRepositoryResult<StoryRecord>>;
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

function mapStoryRow(row: Record<string, unknown>): StoryRecord {
  return storyRecordSchema.parse({
    id: row.id,
    ownerId: row.owner_clerk_id,
    title: row.title,
    summary: row.summary ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

class SupabaseStoryRepository implements StoryRepository {
  async listStoriesForOwner(
    ownerId: string,
  ): Promise<StoryRepositoryResult<StoryRecord[]>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("stories")
        .select("id, owner_clerk_id, title, summary, created_at, updated_at")
        .eq("owner_clerk_id", ownerId)
        .order("updated_at", { ascending: false });

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => mapStoryRow(row)),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to list stories.",
      };
    }
  }

  async getStoryForOwner(
    ownerId: string,
    storyId: string,
  ): Promise<StoryRepositoryResult<StoryRecord>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("stories")
        .select("id, owner_clerk_id, title, summary, created_at, updated_at")
        .eq("owner_clerk_id", ownerId)
        .eq("id", storyId)
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: mapStoryRow(data),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to load story.",
      };
    }
  }

  async createStoryForOwner(
    ownerId: string,
    input: CreateStoryInput,
  ): Promise<StoryRepositoryResult<StoryRecord>> {
    try {
      const client = createSupabaseAdminClient();
      const { data, error } = await client
        .from("stories")
        .insert({
          owner_clerk_id: ownerId,
          title: input.title,
          summary: input.summary,
        })
        .select("id, owner_clerk_id, title, summary, created_at, updated_at")
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      return {
        ok: true,
        data: mapStoryRow(data),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create story.",
      };
    }
  }
}

class UnconfiguredStoryRepository implements StoryRepository {
  async listStoriesForOwner(): Promise<StoryRepositoryResult<StoryRecord[]>> {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before listing stories.",
    };
  }

  async getStoryForOwner(): Promise<StoryRepositoryResult<StoryRecord>> {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before loading stories.",
    };
  }

  async createStoryForOwner(): Promise<StoryRepositoryResult<StoryRecord>> {
    return {
      ok: false,
      error:
        "Supabase is not configured yet. Add the required environment variables before creating stories.",
    };
  }
}

export function getStoryRepository(): StoryRepository {
  if (!isSupabaseConfigured()) {
    return new UnconfiguredStoryRepository();
  }

  return new SupabaseStoryRepository();
}
