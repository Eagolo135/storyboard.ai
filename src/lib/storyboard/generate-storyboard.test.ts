import { describe, expect, it } from "vitest";

import { getFixtureKnowledgeBase } from "@/test/fixtures/story-fixtures";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";
import { generateStoryboard } from "@/lib/storyboard/generate-storyboard";

describe("storyboard generation", () => {
  it("builds required storyboard sections from retrieved notes", () => {
    const knowledgeBase = getFixtureKnowledgeBase();
    const request =
      "Draft chapter 8 confrontation where Mara corners Ilyan in the Floodgate Engine Hall.";
    const retrievedNotes = retrieveStoryContext(request, knowledgeBase, 5);
    const storyboard = generateStoryboard(knowledgeBase.story, request, retrievedNotes);

    expect(storyboard.sections.sceneGoal).toContain("Mara");
    expect(storyboard.sections.keyBeats.length).toBeGreaterThanOrEqual(4);
    expect(storyboard.sections.retrievedSourceContext.length).toBe(retrievedNotes.length);
  });
});