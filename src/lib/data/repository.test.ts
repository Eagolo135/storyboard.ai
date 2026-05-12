import { describe, expect, it } from "vitest";

import {
  DEFAULT_STORY_ID,
  getStoryKnowledgeBase,
  getStoryPromptSuggestions,
  hasStoryKnowledgeBase,
  listStoryKnowledgeBaseSummaries,
} from "@/lib/data/repository";

describe("story knowledge base repository", () => {
  it("lists multiple curated story kits", () => {
    const stories = listStoryKnowledgeBaseSummaries();

    expect(stories).toHaveLength(3);
    expect(stories.map((story) => story.id)).toEqual(
      expect.arrayContaining([DEFAULT_STORY_ID, "hollow-choir", "ninth-ember"]),
    );
  });

  it("resolves a selected story knowledge base", () => {
    const knowledgeBase = getStoryKnowledgeBase("hollow-choir");

    expect(knowledgeBase.story.title).toBe("The Hollow Choir");
    expect(knowledgeBase.notes.length).toBeGreaterThan(0);
  });

  it("returns prompt suggestions for each story kit", () => {
    expect(getStoryPromptSuggestions("ninth-ember")).toHaveLength(3);
    expect(hasStoryKnowledgeBase("missing-story")).toBe(false);
  });
});