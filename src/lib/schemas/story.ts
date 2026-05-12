import { z } from "zod";

export const storyNoteCategorySchema = z.enum([
  "character",
  "lore",
  "plot",
  "setting",
  "style",
  "previous-chapter",
]);

export const storyMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  genre: z.array(z.string().min(1)).min(1),
  premise: z.string().min(20),
  tone: z.string().min(3),
  styleGuide: z.array(z.string().min(3)).min(1),
});

export const storyNoteSchema = z.object({
  id: z.string().min(1),
  category: storyNoteCategorySchema,
  title: z.string().min(1),
  summary: z.string().min(10),
  content: z.string().min(20),
  tags: z.array(z.string().min(1)).default([]),
  characters: z.array(z.string().min(1)).default([]),
  locations: z.array(z.string().min(1)).default([]),
  chapterRefs: z.array(z.number().int().positive()).default([]),
  priority: z.number().int().min(1).max(5),
  evidencePhrases: z.array(z.string().min(1)).default([]),
  continuityConstraints: z.array(z.string().min(1)).default([]),
});

export const storyKnowledgeBaseSchema = z.object({
  story: storyMetadataSchema,
  notes: z.array(storyNoteSchema).min(1),
});

export const sceneRequestSchema = z.object({
  request: z.string().trim().min(1, "Scene or chapter request is required."),
});

export const storyboardRequestSchema = sceneRequestSchema.extend({
  storyId: z.string().trim().min(1).optional(),
});

export const retrievalScoreBreakdownSchema = z.object({
  lexicalOverlap: z.number().nonnegative(),
  tagAlignment: z.number().nonnegative(),
  characterMatch: z.number().nonnegative(),
  locationMatch: z.number().nonnegative(),
  categoryAlignment: z.number().nonnegative(),
  chapterRelevance: z.number().nonnegative(),
  priorityBoost: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export type StoryMetadata = z.infer<typeof storyMetadataSchema>;
export type StoryNote = z.infer<typeof storyNoteSchema>;
export type StoryKnowledgeBase = z.infer<typeof storyKnowledgeBaseSchema>;
export type SceneRequest = z.infer<typeof sceneRequestSchema>;
export type StoryboardRequest = z.infer<typeof storyboardRequestSchema>;
export type RetrievalScoreBreakdown = z.infer<
  typeof retrievalScoreBreakdownSchema
>;

export type RetrievedStoryNote = StoryNote & {
  score: number;
  reasons: string[];
  breakdown: RetrievalScoreBreakdown;
};

export type StoryboardSections = {
  sceneGoal: string;
  retrievedSourceContext: string[];
  openingSituation: string;
  characterMotivation: string;
  keyBeats: string[];
  conflictTension: string;
  internalThoughtDirection: string;
  continuityNotes: string[];
  endingHook: string;
};

export type StoryboardOutput = {
  request: string;
  sections: StoryboardSections;
  citations: Record<keyof StoryboardSections, string[]>;
};

export type HallucinationAssessment = {
  score: number;
  level: "low" | "medium" | "high";
  unsupportedEntities: string[];
  contradictionWarnings: string[];
  genericProseWarnings: string[];
};

export type StoryEvaluation = {
  sourceAlignment: number;
  characterConsistency: number;
  worldbuildingConsistency: number;
  toneFit: number;
  styleMatch: number;
  sceneClarity: number;
  hallucinationRisk: HallucinationAssessment;
  continuityScore: number;
  summary: string[];
};

export type StoryboardResponse = {
  story: StoryMetadata;
  request: string;
  retrievedNotes: RetrievedStoryNote[];
  storyboard: StoryboardOutput;
  evaluation: StoryEvaluation;
  markdown: string;
};