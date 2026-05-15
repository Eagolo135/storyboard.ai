import { describe, expect, it } from "vitest";

import { chunkSourceDocument } from "@/lib/source-chunks/chunk";

describe("chunkSourceDocument", () => {
  it("splits source text into ordered chunks", () => {
    const chunks = chunkSourceDocument({
      sourceDocumentId: "9d4b15ad-0697-4383-b5de-dcefc576cde2",
      storyId: "be4a53c8-1b49-4fdc-95af-e225e1e9a1a2",
      title: "Chapter eight draft",
      rawText: `${"Mara crossed the engine hall with the founder ledger hidden under her coat. ".repeat(14)}\n\n${"Ilyan waited near the floodgate braces and kept watching the pressure gauges instead of her face. ".repeat(12)}`,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.heading).toBe("Chapter eight draft");
    expect(chunks[0]?.chunkIndex).toBe(0);
    expect(chunks[1]?.chunkIndex).toBe(1);
  });
});