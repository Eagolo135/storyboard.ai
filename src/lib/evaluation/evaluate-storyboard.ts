import {
  type StoryEvaluation,
  type RetrievedStoryNote,
  type StoryboardOutput,
} from "@/lib/schemas/story";
import { assessHallucinationRisk } from "@/lib/evaluation/hallucination-risk";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countCitedSections(storyboard: StoryboardOutput) {
  return Object.values(storyboard.citations).filter((citations) => citations.length > 0)
    .length;
}

function collectAllText(storyboard: StoryboardOutput) {
  return [
    storyboard.sections.sceneGoal,
    storyboard.sections.retrievedSourceContext.join(" "),
    storyboard.sections.openingSituation,
    storyboard.sections.characterMotivation,
    storyboard.sections.keyBeats.join(" "),
    storyboard.sections.conflictTension,
    storyboard.sections.internalThoughtDirection,
    storyboard.sections.continuityNotes.join(" "),
    storyboard.sections.endingHook,
  ].join(" ");
}

export function calculateContinuityScore(scores: {
  sourceAlignment: number;
  characterConsistency: number;
  worldbuildingConsistency: number;
  toneFit: number;
  styleMatch: number;
  sceneClarity: number;
  hallucinationRisk: number;
}) {
  return clampScore(
    (scores.sourceAlignment +
      scores.characterConsistency +
      scores.worldbuildingConsistency +
      scores.toneFit +
      scores.styleMatch +
      scores.sceneClarity +
      (100 - scores.hallucinationRisk)) /
      7,
  );
}

export function evaluateStoryboard(
  storyboard: StoryboardOutput,
  retrievedNotes: RetrievedStoryNote[],
): StoryEvaluation {
  const allText = collectAllText(storyboard).toLowerCase();
  const hallucinationRisk = assessHallucinationRisk(storyboard, retrievedNotes);
  const citedSections = countCitedSections(storyboard);
  const sourceAlignment = clampScore(
    (citedSections / Object.keys(storyboard.citations).length) * 70 +
      (new Set(Object.values(storyboard.citations).flat()).size / retrievedNotes.length) * 30,
  );

  const characterConsistency = clampScore(
    100 -
      hallucinationRisk.unsupportedEntities.length * 15 -
      hallucinationRisk.contradictionWarnings.length * 20,
  );

  const worldbuildingConsistency = clampScore(
    100 -
      hallucinationRisk.contradictionWarnings.length * 18 -
      Math.max(0, hallucinationRisk.unsupportedEntities.length - 1) * 10,
  );

  const toneSignals = ["rain", "glass", "steam", "close", "pressure", "quiet"];
  const toneFit = clampScore(
    58 + toneSignals.filter((signal) => allText.includes(signal)).length * 7,
  );

  const styleSignals = ["sensory", "intimate", "restrained", "viewpoint"];
  const styleMatch = clampScore(
    55 + styleSignals.filter((signal) => allText.includes(signal)).length * 8,
  );

  const nonEmptySectionCount = Object.values(storyboard.sections).filter((section) => {
    return Array.isArray(section) ? section.length > 0 : section.trim().length > 0;
  }).length;
  const sceneClarity = clampScore(
    45 + nonEmptySectionCount * 5 + storyboard.sections.keyBeats.length * 3,
  );

  const continuityScore = calculateContinuityScore({
    sourceAlignment,
    characterConsistency,
    worldbuildingConsistency,
    toneFit,
    styleMatch,
    sceneClarity,
    hallucinationRisk: hallucinationRisk.score,
  });

  const summary = [
    sourceAlignment >= 80
      ? "Storyboard stays tightly anchored to retrieved source notes."
      : "Some storyboard sections should cite retrieved notes more directly.",
    hallucinationRisk.level === "low"
      ? "Hallucination risk stays low because entities and constraints remain source-backed."
      : "Review unsupported entities and continuity warnings before using this draft.",
  ];

  return {
    sourceAlignment,
    characterConsistency,
    worldbuildingConsistency,
    toneFit,
    styleMatch,
    sceneClarity,
    hallucinationRisk,
    continuityScore,
    summary,
  };
}