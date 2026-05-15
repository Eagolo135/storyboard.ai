import {
  createSourceDocumentRecordInputSchema,
  createPastedSourceDocumentInputSchema,
  type CreatePastedSourceDocumentInput,
} from "@/lib/source-documents/schema";
import { getSourceDocumentRepository } from "@/lib/source-documents/repository";
import { createChunksForSourceDocument } from "@/lib/source-chunks/service";
import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import { createClient } from "@supabase/supabase-js";

const SOURCE_DOCUMENTS_BUCKET = "source-documents";

export async function listSourceDocumentsForOwner(ownerId: string) {
  return getSourceDocumentRepository().listSourceDocumentsForOwner(ownerId);
}

export async function listSourceDocumentsForStory(ownerId: string, storyId: string) {
  return getSourceDocumentRepository().listSourceDocumentsForStory(ownerId, storyId);
}

async function finalizeChunkingForSourceDocument(ownerId: string, sourceDocumentId: string) {
  const repository = getSourceDocumentRepository();
  const storyDocuments = await repository.listSourceDocumentsForOwner(ownerId);

  if (!storyDocuments.ok) {
    return storyDocuments;
  }

  const document = storyDocuments.data.find((item) => item.id === sourceDocumentId);

  if (!document) {
    return {
      ok: false as const,
      error: "The saved source document could not be loaded for chunking.",
    };
  }

  const chunkResult = await createChunksForSourceDocument(ownerId, document);

  if (!chunkResult.ok) {
    await repository.updateSourceDocumentProcessingStatusForOwner(
      ownerId,
      sourceDocumentId,
      "failed",
    );

    return {
      ok: false as const,
      error: chunkResult.error,
    };
  }

  return repository.updateSourceDocumentProcessingStatusForOwner(
    ownerId,
    sourceDocumentId,
    chunkResult.data.every((chunk) => chunk.embedding && chunk.embedding.length > 0)
      ? "embedded"
      : "chunked",
  );
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

export async function createPastedSourceDocumentForOwner(
  ownerId: string,
  input: CreatePastedSourceDocumentInput,
) {
  const parsedInput = createPastedSourceDocumentInputSchema.parse(input);

  const result = await getSourceDocumentRepository().createSourceDocumentForOwner(ownerId, {
    storyId: parsedInput.storyId,
    sourceType: "pasted-text",
    title: parsedInput.title,
    storagePath: null,
    rawText: parsedInput.rawText,
    processingStatus: "uploaded",
  });

  if (!result.ok) {
    return result;
  }

  const chunked = await finalizeChunkingForSourceDocument(ownerId, result.data.id);

  if (!chunked.ok) {
    return chunked;
  }

  return chunked;
}

export async function createUploadedSourceDocumentForOwner(
  ownerId: string,
  storyId: string,
  file: File,
) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false as const,
      error:
        "Supabase is not configured yet. Add the required environment variables before uploading source documents.",
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false as const,
      error: "Choose a PDF or DOCX file before uploading.",
    };
  }

  const storageClient = createSupabaseAdminClient();
  const normalizedStoryId = storyId.trim();
  const fileName = file.name.trim();
  const storagePath = `${ownerId}/${normalizedStoryId}/${crypto.randomUUID()}-${fileName.replace(/\s+/g, "-")}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { extractSourceTextFromUpload } = await import(
      "@/lib/source-documents/extract"
    );
    const extracted = await extractSourceTextFromUpload(fileName, buffer);

    const { error: uploadError } = await storageClient.storage
      .from(SOURCE_DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false as const,
        error: uploadError.message,
      };
    }

    const parsedInput = createSourceDocumentRecordInputSchema.parse({
      storyId: normalizedStoryId,
      sourceType: extracted.sourceType,
      title: fileName,
      storagePath,
      rawText: extracted.rawText,
      processingStatus: "uploaded",
    });

    const result = await getSourceDocumentRepository().createSourceDocumentForOwner(
      ownerId,
      parsedInput,
    );

    if (!result.ok) {
      return result;
    }

    const chunked = await finalizeChunkingForSourceDocument(ownerId, result.data.id);

    if (!chunked.ok) {
      return chunked;
    }

    return chunked;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to upload and extract source.";

    const parsedInput = createSourceDocumentRecordInputSchema.parse({
      storyId: normalizedStoryId,
      sourceType: fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
      title: fileName || "Uploaded source",
      storagePath: null,
      rawText: null,
      processingStatus: "failed",
    });

    const result = await getSourceDocumentRepository().createSourceDocumentForOwner(
      ownerId,
      parsedInput,
    );

    if (!result.ok) {
      return {
        ok: false as const,
        error: errorMessage,
      };
    }

    return {
      ok: false as const,
      error: errorMessage,
    };
  }
}