import { afterEach, describe, expect, it, vi } from "vitest";

import { getStoryKnowledgeBase } from "@/lib/data/repository";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";
import { generateStoryboard } from "@/lib/storyboard/generate-storyboard";

import { evaluateStoryboardWithAi } from "./evaluate-storyboard";

describe("evaluateStoryboardWithAi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns structured evaluation scores from the provider", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_EVALUATION_MODEL", "gpt-4.1-mini");
    vi.stubEnv("OPENAI_BASE_URL", "https://api.openai.com/v1");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  sourceAlignment: 88,
                  characterConsistency: 84,
                  worldbuildingConsistency: 83,
                  toneFit: 82,
                  styleMatch: 79,
                  sceneClarity: 85,
                  summary: [
                    "The storyboard stays mostly grounded in the retrieved evidence.",
                    "The sibling conflict remains plausible and continuity-aware.",
                  ],
                }),
              },
            },
          ],
        }),
      }),
    );

    const knowledgeBase = getStoryKnowledgeBase("glass-archive");
    const request = "Plan a floodgate confrontation that keeps sibling trust under pressure.";
    const retrievedNotes = retrieveStoryContext(request, knowledgeBase, 5);
    const storyboard = generateStoryboard(knowledgeBase.story, request, retrievedNotes);

    const evaluation = await evaluateStoryboardWithAi({
      story: knowledgeBase.story,
      storyboard,
      retrievedNotes,
      heuristicEvaluation: {
        sourceAlignment: 80,
        characterConsistency: 80,
        worldbuildingConsistency: 80,
        toneFit: 80,
        styleMatch: 80,
        sceneClarity: 80,
        hallucinationRisk: {
          score: 10,
          level: "low",
          unsupportedEntities: [],
          contradictionWarnings: [],
          genericProseWarnings: [],
        },
        continuityScore: 80,
        summary: ["placeholder", "placeholder"],
      },
    });

    expect(evaluation.sourceAlignment).toBe(88);
    expect(evaluation.summary).toHaveLength(2);
  });
});