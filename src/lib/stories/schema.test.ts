import { describe, expect, it } from "vitest";

import { createStoryInputSchema } from "@/lib/stories/schema";

describe("story schema", () => {
  it("accepts a valid story title", () => {
    expect(
      createStoryInputSchema.parse({
        title: "Ashes of Orendale",
        summary: "A floodgate mystery.",
      }).title,
    ).toBe("Ashes of Orendale");
  });

  it("rejects an empty title", () => {
    expect(() =>
      createStoryInputSchema.parse({
        title: "   ",
        summary: "",
      }),
    ).toThrow();
  });
});
