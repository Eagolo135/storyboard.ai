import { z } from "zod";

import { getGenerationProviderConfig, requestStructuredJson } from "@/lib/ai/openai-client";
import { isAiConfigured } from "@/lib/platform/env";
import type {
  RetrievedStoryNote,
  StoryMetadata,
  StoryboardGenerationMetadata,
  StoryboardOutput,
  StoryboardSections,
} from "@/lib/schemas/story";

const aiStoryboardSectionsSchema = z.object({
  sceneGoal: z.string().min(1),
  retrievedSourceContext: z.array(z.string().min(1)).min(1),
  openingSituation: z.string().min(1),
  characterMotivation: z.string().min(1),
  keyBeats: z.array(z.string().min(1)).min(3),
  conflictTension: z.string().min(1),
  internalThoughtDirection: z.string().min(1),
  continuityNotes: z.array(z.string().min(1)).min(1),
  endingHook: z.string().min(1),
});

type GenerateStoryboardWithAiInput = {
  story: StoryMetadata;
  request: string;
  retrievedNotes: RetrievedStoryNote[];
  fallbackStoryboard: StoryboardOutput;
};

type GenerateStoryboardWithAiResult = {
  storyboard: StoryboardOutput;
  generation: StoryboardGenerationMetadata;
};

function buildSystemPrompt() {
  return [
    "You are StoryBoard AI, a grounded storyboarding assistant.",
    "Return strict JSON only.",
    "Use only the provided retrieved notes.",
    "Do not invent new lore, characters, places, or facts.",
    "Keep the output concrete, continuity-aware, and usable for long-form fiction planning.",
  ].join(" ");
}

function buildUserPrompt(
  story: StoryMetadata,
  request: string,
  retrievedNotes: RetrievedStoryNote[],
) {
  return JSON.stringify(
    {
      task: "Generate a structured storyboard from grounded story notes.",
      returnShape: {
        sceneGoal: "string",
        retrievedSourceContext: ["string"],
        openingSituation: "string",
        characterMotivation: "string",
        keyBeats: ["string", "string", "string"],
        conflictTension: "string",
        internalThoughtDirection: "string",
        continuityNotes: ["string"],
        endingHook: "string",
      },
      story,
      request,
      retrievedNotes: retrievedNotes.map((note) => ({
        id: note.id,
        category: note.category,
        title: note.title,
        summary: note.summary,
        content: note.content,
        tags: note.tags,
        characters: note.characters,
        locations: note.locations,
        continuityConstraints: note.continuityConstraints,
        reasons: note.reasons,
      })),
    },
    null,
    2,
  );
}

async function requestStoryboardSections(
  input: GenerateStoryboardWithAiInput,
): Promise<StoryboardSections> {
  return requestStructuredJson({
    config: getGenerationProviderConfig(),
    schema: aiStoryboardSectionsSchema,
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(input.story, input.request, input.retrievedNotes),
    temperature: 0.2,
  });
}

export async function generateStoryboardWithAi(
  input: GenerateStoryboardWithAiInput,
): Promise<GenerateStoryboardWithAiResult> {
  if (!isAiConfigured()) {
    return {
      storyboard: input.fallbackStoryboard,
      generation: {
        mode: "deterministic-fallback",
        provider: "local prototype",
        model: "deterministic-storyboard-generator",
        warning:
          "Live AI provider is not configured, so StoryBoard AI used the local deterministic generator.",
      },
    };
  }

  const config = getGenerationProviderConfig();

  try {
    const sections = await requestStoryboardSections(input);

    return {
      storyboard: {
        ...input.fallbackStoryboard,
        sections,
      },
      generation: {
        mode: "ai-provider",
        provider: config.providerLabel,
        model: config.model,
      },
    };
  } catch (error) {
    return {
      storyboard: input.fallbackStoryboard,
      generation: {
        mode: "deterministic-fallback",
        provider: config.providerLabel,
        model: config.model,
        warning:
          error instanceof Error
            ? `${error.message} Falling back to the deterministic generator.`
            : "AI provider request failed. Falling back to the deterministic generator.",
      },
    };
  }
}