import { z } from "zod";

export const sourceDocumentChunkSchema = z.object({
  id: z.string().uuid(),
  sourceDocumentId: z.string().uuid(),
  sourceDocumentTitle: z.string().nullable(),
  storyId: z.string().uuid(),
  ownerId: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  heading: z.string().nullable(),
  content: z.string().min(1),
  tokenCount: z.number().int().nonnegative(),
  characterCount: z.number().int().positive(),
  embedding: z.array(z.number()).nullable(),
  embeddingModel: z.string().nullable(),
  embeddedAt: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createSourceDocumentChunkInputSchema = z.object({
  sourceDocumentId: z.string().uuid(),
  storyId: z.string().uuid(),
  chunkIndex: z.number().int().nonnegative(),
  heading: z.string().trim().max(160).nullable(),
  content: z.string().trim().min(1).max(5000),
  tokenCount: z.number().int().nonnegative(),
  characterCount: z.number().int().positive(),
  embedding: z.array(z.number()).nullable().default(null),
  embeddingModel: z.string().trim().min(1).nullable().default(null),
  embeddedAt: z.string().trim().min(1).nullable().default(null),
});

export type SourceDocumentChunk = z.infer<typeof sourceDocumentChunkSchema>;
export type CreateSourceDocumentChunkInput = z.infer<
  typeof createSourceDocumentChunkInputSchema
>;

export type SourceDocumentChunkEmbeddingUpdate = {
  id: string;
  embedding: number[];
  embeddingModel: string;
  embeddedAt: string;
};