import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { createStoryboardResponse } from "@/lib/orchestration/create-storyboard-response";

vi.mock("@/lib/stories/service", () => ({
  getStoryForOwner: vi.fn(),
}));

vi.mock("@/lib/source-chunks/service", () => ({
  ensureEmbeddingsForStoryChunks: vi.fn(),
  listSourceDocumentChunksForStory: vi.fn(),
}));

const { getStoryForOwner } = await import("@/lib/stories/service");
const { ensureEmbeddingsForStoryChunks, listSourceDocumentChunksForStory } = await import(
  "@/lib/source-chunks/service"
);

describe("empty request validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ensureEmbeddingsForStoryChunks).mockImplementation(
      async (_viewerId, chunks) => ({
        ok: true,
        data: chunks,
      }),
    );
  });

  it("rejects whitespace-only requests", async () => {
    await expect(createStoryboardResponse("   ")).rejects.toThrow(ZodError);
  });

  it("creates a storyboard for a selected story kit", async () => {
    const response = await createStoryboardResponse(
      "Plan a confrontation at the west choir gate where Sera decides whether Brother Anik gets through.",
      "hollow-choir",
    );

    expect(response.story.id).toBe("hollow-choir");
    expect(response.retrievedNotes.length).toBeGreaterThan(0);
    expect(response.generation.mode).toBe("deterministic-fallback");
  });

  it("rejects unknown story kits", async () => {
    await expect(
      createStoryboardResponse("Draft the next scene", "missing-story"),
    ).rejects.toThrow(RangeError);
  });

  it("uses story-owned source chunks for authenticated story workspaces", async () => {
    vi.mocked(getStoryForOwner).mockResolvedValue({
      ok: true,
      data: {
        id: "9d4b15ad-0697-4383-b5de-dcefc576cde2",
        ownerId: "user_123",
        title: "The Glass Archive",
        summary: "A flooded city archive under civic pressure.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    vi.mocked(listSourceDocumentChunksForStory).mockResolvedValue({
      ok: true,
      data: [
        {
          id: "2a835cf0-1fb4-43ce-a88e-ddc0f6b80b0a",
          sourceDocumentId: "4735a18d-b27f-4267-9b25-b34416ad90a2",
          sourceDocumentTitle: "Chapter Eight Draft",
          storyId: "9d4b15ad-0697-4383-b5de-dcefc576cde2",
          ownerId: "user_123",
          chunkIndex: 0,
          heading: "Chapter Eight Draft",
          content:
            "Mara corners Ilyan inside the Floodgate Engine Hall and forces him to admit the ledger was falsified.",
          tokenCount: 17,
          characterCount: 104,
          embedding: null,
          embeddingModel: null,
          embeddedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const response = await createStoryboardResponse(
      "Plan a confrontation where Mara corners Ilyan in the Floodgate Engine Hall.",
      "9d4b15ad-0697-4383-b5de-dcefc576cde2",
      "user_123",
    );

    expect(response.story.id).toBe("9d4b15ad-0697-4383-b5de-dcefc576cde2");
    expect(response.retrievedNotes[0]?.title).toContain("Chapter Eight Draft");
    expect(response.retrieval.mode).toBe("lexical-fallback");
  });
});