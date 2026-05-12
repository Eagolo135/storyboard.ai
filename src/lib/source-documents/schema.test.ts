import { describe, expect, it } from "vitest";

import { createPastedSourceDocumentInputSchema } from "@/lib/source-documents/schema";

describe("source document schema", () => {
  it("accepts a valid pasted source document", () => {
    expect(
      createPastedSourceDocumentInputSchema.parse({
        storyId: "9d4b15ad-0697-4383-b5de-dcefc576cde2",
        title: "Chapter one draft",
        rawText:
          "Mara crossed the archive bridge with rain in her collar and the founder ledger wrapped in waxed cloth.",
      }).title,
    ).toBe("Chapter one draft");
  });

  it("rejects source text that is too short", () => {
    expect(() =>
      createPastedSourceDocumentInputSchema.parse({
        storyId: "9d4b15ad-0697-4383-b5de-dcefc576cde2",
        title: "Too short",
        rawText: "Not enough text.",
      }),
    ).toThrow();
  });
});