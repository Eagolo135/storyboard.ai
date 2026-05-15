import { afterEach, describe, expect, it, vi } from "vitest";

import { getStoryKnowledgeBase } from "@/lib/data/repository";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";
import { generateStoryboard } from "@/lib/storyboard/generate-storyboard";

import { generateStoryboardWithAi } from "./generate-storyboard";

describe("generateStoryboardWithAi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to the deterministic storyboard when AI env is missing", async () => {
    const knowledgeBase = getStoryKnowledgeBase("glass-archive");
    const request = "Plan a floodgate confrontation that keeps sibling trust under pressure.";
    const retrievedNotes = retrieveStoryContext(request, knowledgeBase, 5);
    const fallbackStoryboard = generateStoryboard(knowledgeBase.story, request, retrievedNotes);

    const result = await generateStoryboardWithAi({
      story: knowledgeBase.story,
      request,
      retrievedNotes,
      fallbackStoryboard,
    });

    expect(result.generation.mode).toBe("deterministic-fallback");
    expect(result.storyboard).toEqual(fallbackStoryboard);
  });

  it("uses the AI provider response when configured", async () => {
    vi.stubEnv("STORYBOARD_AI_API_KEY", "test-key");
    vi.stubEnv("STORYBOARD_AI_MODEL", "test-model");
    vi.stubEnv("STORYBOARD_AI_BASE_URL", "https://example.com/v1");
    vi.stubEnv("STORYBOARD_AI_PROVIDER_LABEL", "Test provider");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  sceneGoal: "Use the ledger confrontation to force a choice.",
                  retrievedSourceContext: ["Ledger fraud", "Floodgate pressure"],
                  openingSituation: "Open in the engine hall with rain still in their clothes.",
                  characterMotivation: "Mara wants the truth before the engines fail.",
                  keyBeats: [
                    "Re-establish the breach aftermath.",
                    "Force Ilyan to explain the false report.",
                    "End on a sharper trust bargain.",
                  ],
                  conflictTension: "Timing and duty matter more than force.",
                  internalThoughtDirection: "Stay close to Mara's sensory read of the hall.",
                  continuityNotes: ["Do not resolve the sibling conflict cleanly."],
                  endingHook: "Close on a narrower but sharper choice.",
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
    const fallbackStoryboard = generateStoryboard(knowledgeBase.story, request, retrievedNotes);

    const result = await generateStoryboardWithAi({
      story: knowledgeBase.story,
      request,
      retrievedNotes,
      fallbackStoryboard,
    });

    expect(result.generation.mode).toBe("ai-provider");
    expect(result.generation.provider).toBe("Test provider");
    expect(result.storyboard.sections.sceneGoal).toContain("choice");
    expect(result.storyboard.citations).toEqual(fallbackStoryboard.citations);
  });
});