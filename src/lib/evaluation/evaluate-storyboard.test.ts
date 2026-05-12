import { describe, expect, it } from "vitest";

import { calculateContinuityScore } from "@/lib/evaluation/evaluate-storyboard";

describe("continuity score calculation", () => {
  it("returns 100 for perfect aligned inputs", () => {
    expect(
      calculateContinuityScore({
        sourceAlignment: 100,
        characterConsistency: 100,
        worldbuildingConsistency: 100,
        toneFit: 100,
        styleMatch: 100,
        sceneClarity: 100,
        hallucinationRisk: 0,
      }),
    ).toBe(100);
  });

  it("drops below 50 when consistency and risk are poor", () => {
    expect(
      calculateContinuityScore({
        sourceAlignment: 40,
        characterConsistency: 25,
        worldbuildingConsistency: 30,
        toneFit: 45,
        styleMatch: 50,
        sceneClarity: 40,
        hallucinationRisk: 85,
      }),
    ).toBeLessThan(50);
  });
});