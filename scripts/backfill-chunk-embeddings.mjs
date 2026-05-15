import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath) {
  const buffer = readFileSync(filePath);
  const content =
    (buffer[0] === 0xff && buffer[1] === 0xfe) ||
    (buffer[0] === 0xfe && buffer[1] === 0xff) ||
    buffer.includes(0)
      ? buffer.toString("utf16le")
      : buffer.toString("utf8");

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1).trim());

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to backfill chunk embeddings.`);
  }

  return value;
}

function trimBaseUrl(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function chunkEmbeddingInput(chunk) {
  return [chunk.heading ?? "", chunk.content].filter(Boolean).join("\n\n");
}

async function requestEmbeddings({ baseUrl, apiKey, model, input }) {
  const response = await fetch(`${trimBaseUrl(baseUrl)}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload.data)) {
    throw new Error("Embedding response did not include a data array.");
  }

  return payload.data
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((item) => item.embedding);
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const openAiApiKey = getRequiredEnv("OPENAI_API_KEY");
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";
  const batchSize = Number.parseInt(process.env.CHUNK_EMBEDDING_BACKFILL_BATCH_SIZE ?? "20", 10);
  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: chunks, error } = await client
    .from("source_document_chunks")
    .select("id, owner_clerk_id, heading, content")
    .is("embedding", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const pendingChunks = chunks ?? [];

  if (pendingChunks.length === 0) {
    console.log("No source document chunks need embedding backfill.");
    return;
  }

  let updatedCount = 0;

  for (let index = 0; index < pendingChunks.length; index += batchSize) {
    const batch = pendingChunks.slice(index, index + batchSize);
    const embeddedAt = new Date().toISOString();
    const embeddings = await requestEmbeddings({
      baseUrl: openAiBaseUrl,
      apiKey: openAiApiKey,
      model: embeddingModel,
      input: batch.map((chunk) => chunkEmbeddingInput(chunk)),
    });

    for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
      const chunk = batch[batchIndex];
      const embedding = embeddings[batchIndex];

      if (!Array.isArray(embedding) || embedding.length === 0) {
        continue;
      }

      const { error: updateError } = await client
        .from("source_document_chunks")
        .update({
          embedding,
          embedding_model: embeddingModel,
          embedded_at: embeddedAt,
          updated_at: embeddedAt,
        })
        .eq("owner_clerk_id", chunk.owner_clerk_id)
        .eq("id", chunk.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      updatedCount += 1;
    }

    console.log(`Backfilled ${updatedCount} of ${pendingChunks.length} chunks.`);
  }

  console.log(`Embedding backfill finished. Updated ${updatedCount} chunks with ${embeddingModel}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Embedding backfill failed.");
  process.exitCode = 1;
});