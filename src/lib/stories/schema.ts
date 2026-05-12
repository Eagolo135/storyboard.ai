import { z } from "zod";

export const storyRecordSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createStoryInputSchema = z.object({
  title: z.string().trim().min(1, "Story title is required.").max(120),
  summary: z.string().trim().max(500).default(""),
});

export type StoryRecord = z.infer<typeof storyRecordSchema>;
export type CreateStoryInput = z.infer<typeof createStoryInputSchema>;
