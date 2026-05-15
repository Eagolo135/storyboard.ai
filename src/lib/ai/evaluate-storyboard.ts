import { z } from "zod";

import { getEvaluationProviderConfig, requestStructuredJson } from "@/lib/ai/openai-client";
import type {
  RetrievedStoryNote,
  StoryEvaluation,
  StoryMetadata,
  StoryboardOutput,
} from "@/lib/schemas/story";

const aiEvaluationSchema = z.object({
  sourceAlignment: z.number().min(0).max(100),
  characterConsistency: z.number().min(0).max(100),
  worldbuildingConsistency: z.number().min(0).max(100),
  toneFit: z.number().min(0).max(100),
  styleMatch: z.number().min(0).max(100),
  sceneClarity: z.number().min(0).max(100),
  summary: z.array(z.string().min(1)).min(2).max(6),
});

function buildSystemPrompt() {
  return [
    "You are StoryBoard AI's grounded evaluation reviewer.",
    "Score only against the retrieved source evidence and the supplied storyboard.",
    "Return strict JSON only.",
    "Do not invent missing evidence.",
    "Penalize unsupported claims, continuity drift, and tone mismatch.",
  ].join(" ");
}

function buildUserPrompt(
  story: StoryMetadata,
  storyboard: StoryboardOutput,
  retrievedNotes: RetrievedStoryNote[],
  heuristicEvaluation: StoryEvaluation,
) {
  return JSON.stringify(
    {
      task: "Evaluate a grounded storyboard using the retrieved source context.",
      returnShape: {
        sourceAlignment: "0-100 number",
        characterConsistency: "0-100 number",
        worldbuildingConsistency: "0-100 number",
        toneFit: "0-100 number",
        styleMatch: "0-100 number",
        sceneClarity: "0-100 number",
        summary: ["string", "string"],
      },
      story,
      storyboard,
      heuristicEvaluation,
      retrievedNotes: retrievedNotes.map((note) => ({
        id: note.id,
        title: note.title,
        summary: note.summary,
        content: note.content,
        characters: note.characters,
        locations: note.locations,
        continuityConstraints: note.continuityConstraints,
      })),
    },
    null,
    2,
  );
}

export async function evaluateStoryboardWithAi(input: {
  story: StoryMetadata;
  storyboard: StoryboardOutput;
  retrievedNotes: RetrievedStoryNote[];
  heuristicEvaluation: StoryEvaluation;
}) {
  return requestStructuredJson({
    config: getEvaluationProviderConfig(),
    schema: aiEvaluationSchema,
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(
      input.story,
      input.storyboard,
      input.retrievedNotes,
      input.heuristicEvaluation,
    ),
    temperature: 0.1,
  });
}