import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { createStoryboardResponse } from "@/lib/orchestration/create-storyboard-response";

describe("empty request validation", () => {
  it("rejects whitespace-only requests", () => {
    expect(() => createStoryboardResponse("   ")).toThrow(ZodError);
  });

  it("creates a storyboard for a selected story kit", () => {
    const response = createStoryboardResponse(
      "Plan a confrontation at the west choir gate where Sera decides whether Brother Anik gets through.",
      "hollow-choir",
    );

    expect(response.story.id).toBe("hollow-choir");
    expect(response.retrievedNotes.length).toBeGreaterThan(0);
  });

  it("rejects unknown story kits", () => {
    expect(() => createStoryboardResponse("Draft the next scene", "missing-story")).toThrow(
      RangeError,
    );
  });
});