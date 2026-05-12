import { describe, expect, it } from "vitest";

import { assessHallucinationRisk } from "@/lib/evaluation/hallucination-risk";
import { getFixtureKnowledgeBase, getFixtureStoryboard } from "@/test/fixtures/story-fixtures";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";

describe("hallucination risk logic", () => {
  it("flags unsupported entities and generic filler", () => {
    const knowledgeBase = getFixtureKnowledgeBase();
    const retrievedNotes = retrieveStoryContext(
      "Chapter 8 floodgate scene for Mara and Ilyan.",
      knowledgeBase,
      5,
    );
    const storyboard = getFixtureStoryboard({
      sections: {
        ...getFixtureStoryboard().sections,
        endingHook: "Somehow Queen Elara appears in the engine hall.",
      },
    });

    const result = assessHallucinationRisk(storyboard, retrievedNotes);

    expect(result.unsupportedEntities).toContain("Queen Elara");
    expect(result.genericProseWarnings.length).toBeGreaterThan(0);
  });
});