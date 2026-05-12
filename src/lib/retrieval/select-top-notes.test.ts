import { describe, expect, it } from "vitest";

import { selectTopNotes } from "@/lib/retrieval/select-top-notes";
import { getFixtureNote } from "@/test/fixtures/story-fixtures";

describe("top note selection", () => {
  it("sorts by score descending and keeps the requested limit", () => {
    const notes = [
      { ...getFixtureNote({ id: "a", title: "A" }), score: 15, reasons: [], breakdown: { lexicalOverlap: 0, tagAlignment: 0, characterMatch: 0, locationMatch: 0, categoryAlignment: 0, chapterRelevance: 0, priorityBoost: 0, total: 15 } },
      { ...getFixtureNote({ id: "b", title: "B" }), score: 35, reasons: [], breakdown: { lexicalOverlap: 0, tagAlignment: 0, characterMatch: 0, locationMatch: 0, categoryAlignment: 0, chapterRelevance: 0, priorityBoost: 0, total: 35 } },
      { ...getFixtureNote({ id: "c", title: "C" }), score: 25, reasons: [], breakdown: { lexicalOverlap: 0, tagAlignment: 0, characterMatch: 0, locationMatch: 0, categoryAlignment: 0, chapterRelevance: 0, priorityBoost: 0, total: 25 } },
    ];

    const result = selectTopNotes(notes, 2);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("b");
    expect(result[1]?.id).toBe("c");
  });
});