import {
  createSourceDocumentRecordInputSchema,
  createPastedSourceDocumentInputSchema,
  type CreatePastedSourceDocumentInput,
} from "@/lib/source-documents/schema";
import { getUploadSourceTypeFromFileName } from "@/lib/source-documents/extract";
import { getSourceDocumentRepository } from "@/lib/source-documents/repository";
import { createChunksForSourceDocument } from "@/lib/source-chunks/service";
import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import { createClient } from "@supabase/supabase-js";

const SOURCE_DOCUMENTS_BUCKET = "source-documents";
const MAX_SOURCE_UPLOAD_BYTES = 10 * 1024 * 1024;

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

async function removeSourceDocumentStorageObjects(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  const storageClient = createSupabaseAdminClient();
  await storageClient.storage.from(SOURCE_DOCUMENTS_BUCKET).remove(storagePaths);
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

  if (file.size > MAX_SOURCE_UPLOAD_BYTES) {
    return {
      ok: false as const,
      error: "Source uploads must be 10 MB or smaller.",
    };
  }

  const storageClient = createSupabaseAdminClient();
  const repository = getSourceDocumentRepository();
  const normalizedStoryId = storyId.trim();
  const fileName = file.name.trim();
  const sourceType = getUploadSourceTypeFromFileName(fileName);

  if (!sourceType) {
    return {
      ok: false as const,
      error: "Only PDF and DOCX uploads are supported in this sprint.",
    };
  }

  const storyDocuments = await repository.listSourceDocumentsForStory(
    ownerId,
    normalizedStoryId,
  );

  if (!storyDocuments.ok) {
    return storyDocuments;
  }

  const matchingDocuments = storyDocuments.data.filter(
    (document) => document.fileName === fileName && document.sourceType === sourceType,
  );
  const [existingDocument, ...staleDocuments] = matchingDocuments;

  const deleteResult = await repository.deleteSourceDocumentsForOwner(
    ownerId,
    staleDocuments.map((document) => document.id),
  );

  if (!deleteResult.ok) {
    return deleteResult;
  }

  await removeSourceDocumentStorageObjects(
    staleDocuments
      .map((document) => document.storagePath)
      .filter((storagePath): storagePath is string => Boolean(storagePath)),
  );

  const storagePath = `${ownerId}/${normalizedStoryId}/${crypto.randomUUID()}-${fileName.replace(/\s+/g, "-")}`;
  let uploadedStoragePath: string | null = null;

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

    uploadedStoragePath = storagePath;

    const parsedInput = createSourceDocumentRecordInputSchema.parse({
      storyId: normalizedStoryId,
      sourceType: extracted.sourceType,
      title: fileName,
      storagePath,
      rawText: extracted.rawText,
      processingStatus: "uploaded",
    });

    const result = existingDocument
      ? await repository.updateSourceDocumentForOwner(ownerId, existingDocument.id, parsedInput)
      : await repository.createSourceDocumentForOwner(ownerId, parsedInput);

    if (!result.ok) {
      await removeSourceDocumentStorageObjects([storagePath]);
      return result;
    }

    uploadedStoragePath = null;

    if (existingDocument?.storagePath && existingDocument.storagePath !== storagePath) {
      await removeSourceDocumentStorageObjects([existingDocument.storagePath]);
    }

    const chunked = await finalizeChunkingForSourceDocument(ownerId, result.data.id);

    if (!chunked.ok) {
      return chunked;
    }

    return chunked;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to upload and extract source.";

    if (uploadedStoragePath) {
      await removeSourceDocumentStorageObjects([uploadedStoragePath]);
    }

    if (existingDocument) {
      return {
        ok: false as const,
        error: errorMessage,
      };
    }

    const parsedInput = createSourceDocumentRecordInputSchema.parse({
      storyId: normalizedStoryId,
      sourceType,
      title: fileName || "Uploaded source",
      storagePath: null,
      rawText: null,
      processingStatus: "failed",
    });

    const result = await repository.createSourceDocumentForOwner(ownerId, parsedInput);

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