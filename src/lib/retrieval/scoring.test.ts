import { describe, expect, it } from "vitest";

import { getFixtureKnowledgeBase } from "@/test/fixtures/story-fixtures";
import { extractRetrievalSignals, scoreStoryNote } from "@/lib/retrieval/scoring";

describe("retrieval scoring", () => {
  it("scores chapter-aligned floodgate notes above unrelated vault notes", () => {
    const knowledgeBase = getFixtureKnowledgeBase();
    const request =
      "Draft chapter 8 confrontation where Mara corners Ilyan in the Floodgate Engine Hall.";
    const signals = extractRetrievalSignals(request, knowledgeBase);
    const floodgateNote = knowledgeBase.notes.find((note) => note.id === "plot-floodgate-choice");
    const vaultNote = knowledgeBase.notes.find((note) => note.id === "setting-vault");

    expect(floodgateNote).toBeDefined();
    expect(vaultNote).toBeDefined();

    const floodgateScore = scoreStoryNote(floodgateNote!, signals);
    const vaultScore = scoreStoryNote(vaultNote!, signals);

    expect(floodgateScore.total).toBeGreaterThan(vaultScore.total);
    expect(floodgateScore.characterMatch).toBeGreaterThan(0);
  });
});