import { describe, expect, it } from "vitest";

import { createStoryboardResponse } from "@/lib/orchestration/create-storyboard-response";

describe("markdown export formatting", () => {
  it("formats headings and key beats for markdown export", async () => {
    const response = await createStoryboardResponse(
      "Draft chapter 8 confrontation where Mara corners Ilyan in the Floodgate Engine Hall.",
    );

    expect(response.markdown).toContain("# StoryBoard AI:");
    expect(response.markdown).toContain("## Scene goal");
    expect(response.markdown).toContain("### Beat 1");
    expect(response.markdown).toContain("Source alignment:");
    expect(response.markdown).toContain("Generation mode:");
  });
});