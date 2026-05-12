import {
  createSourceDocumentRecordInputSchema,
  createPastedSourceDocumentInputSchema,
  type CreatePastedSourceDocumentInput,
} from "@/lib/source-documents/schema";
import { getSourceDocumentRepository } from "@/lib/source-documents/repository";
import { getSupabaseAdminConfig, isSupabaseConfigured } from "@/lib/platform/env";
import { createClient } from "@supabase/supabase-js";

const SOURCE_DOCUMENTS_BUCKET = "source-documents";

export async function listSourceDocumentsForOwner(ownerId: string) {
  return getSourceDocumentRepository().listSourceDocumentsForOwner(ownerId);
}

export async function listSourceDocumentsForStory(ownerId: string, storyId: string) {
  return getSourceDocumentRepository().listSourceDocumentsForStory(ownerId, storyId);
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

  return getSourceDocumentRepository().createSourceDocumentForOwner(ownerId, {
    storyId: parsedInput.storyId,
    sourceType: "pasted-text",
    title: parsedInput.title,
    storagePath: null,
    rawText: parsedInput.rawText,
    processingStatus: "uploaded",
  });
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

    return getSourceDocumentRepository().createSourceDocumentForOwner(ownerId, parsedInput);
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