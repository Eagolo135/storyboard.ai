import { describe, expect, it } from "vitest";

import { storyNoteSchema } from "@/lib/schemas/story";
import { getFixtureNote } from "@/test/fixtures/story-fixtures";

describe("story note schema", () => {
  it("validates a correct story note", () => {
    expect(() => storyNoteSchema.parse(getFixtureNote())).not.toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() =>
      storyNoteSchema.parse({
        ...getFixtureNote(),
        title: "",
      }),
    ).toThrow();
  });
});