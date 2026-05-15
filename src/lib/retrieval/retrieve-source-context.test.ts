import { describe, expect, it } from "vitest";

import { retrieveSourceContext } from "@/lib/retrieval/retrieve-source-context";
import type { SourceDocumentChunk } from "@/lib/source-chunks/schema";

const chunks: SourceDocumentChunk[] = [
  {
    id: "2a835cf0-1fb4-43ce-a88e-ddc0f6b80b0a",
    sourceDocumentId: "4735a18d-b27f-4267-9b25-b34416ad90a2",
    sourceDocumentTitle: "Chapter Eight Draft",
    storyId: "be4a53c8-1b49-4fdc-95af-e225e1e9a1a2",
    ownerId: "user_123",
    chunkIndex: 0,
    heading: "Chapter Eight Draft",
    content:
      "Mara corners Ilyan inside the Floodgate Engine Hall after decoding the founder ledger and realizes the gauges prove he expected the collapse.",
    tokenCount: 22,
    characterCount: 131,
    embedding: null,
    embeddingModel: null,
    embeddedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "39dcad37-60fc-4ef1-898e-7f8f4ec9fdd0",
    sourceDocumentId: "4735a18d-b27f-4267-9b25-b34416ad90a2",
    sourceDocumentTitle: "Style Notes",
    storyId: "be4a53c8-1b49-4fdc-95af-e225e1e9a1a2",
    ownerId: "user_123",
    chunkIndex: 1,
    heading: "Style Notes",
    content:
      "Keep the prose in close third, emphasize pressure and wet metal, and avoid heroic speeches.",
    tokenCount: 16,
    characterCount: 95,
    embedding: null,
    embeddingModel: null,
    embeddedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("retrieveSourceContext", () => {
  it("ranks matching source chunks ahead of weaker matches", async () => {
    const retrieval = await retrieveSourceContext(
      "Draft a confrontation where Mara corners Ilyan in the Floodgate Engine Hall.",
      chunks,
      2,
    );

    expect(retrieval.metadata.mode).toBe("lexical-fallback");
    expect(retrieval.retrievedNotes[0]?.title).toContain("Chapter Eight Draft");
    expect(retrieval.retrievedNotes[0]?.score).toBeGreaterThan(
      retrieval.retrievedNotes[1]?.score ?? 0,
    );
  });
});