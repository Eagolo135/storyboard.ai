import { z } from "zod";

export const sourceDocumentTypeSchema = z.enum(["pdf", "docx", "pasted-text"]);

export const sourceDocumentProcessingStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "chunked",
  "embedded",
  "failed",
]);

export const sourceDocumentRecordSchema = z.object({
  id: z.string().uuid(),
  storyId: z.string().uuid(),
  ownerId: z.string().min(1),
  sourceType: sourceDocumentTypeSchema,
  fileName: z.string().nullable(),
  storagePath: z.string().nullable(),
  rawText: z.string().nullable(),
  processingStatus: sourceDocumentProcessingStatusSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createPastedSourceDocumentInputSchema = z.object({
  storyId: z.string().uuid("Select a valid story before saving source text."),
  title: z.string().trim().min(1, "A source title is required.").max(160),
  rawText: z
    .string()
    .trim()
    .min(40, "Paste at least 40 characters of source text.")
    .max(50000, "Pasted source text is too large for this first sprint."),
});

export const createSourceDocumentRecordInputSchema = z.object({
  storyId: z.string().uuid("Select a valid story before saving source text."),
  sourceType: sourceDocumentTypeSchema,
  title: z.string().trim().min(1, "A source title is required.").max(160),
  storagePath: z.string().trim().min(1).nullable(),
  rawText: z.string().trim().min(1).nullable(),
  processingStatus: sourceDocumentProcessingStatusSchema,
});

export type SourceDocumentType = z.infer<typeof sourceDocumentTypeSchema>;
export type SourceDocumentProcessingStatus = z.infer<
  typeof sourceDocumentProcessingStatusSchema
>;
export type SourceDocumentRecord = z.infer<typeof sourceDocumentRecordSchema>;
export type CreatePastedSourceDocumentInput = z.infer<
  typeof createPastedSourceDocumentInputSchema
>;
export type CreateSourceDocumentRecordInput = z.infer<
  typeof createSourceDocumentRecordInputSchema
>;