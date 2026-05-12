import {
  type HallucinationAssessment,
  type RetrievedStoryNote,
  type StoryboardOutput,
} from "@/lib/schemas/story";

const ALLOWED_PROPER_NOUNS = new Set([
  "Scene",
  "Goal",
  "Retrieved",
  "Source",
  "Context",
  "Opening",
  "Situation",
  "Character",
  "Motivation",
  "Key",
  "Beats",
  "Conflict",
  "Tension",
  "Internal",
  "Thought",
  "Continuity",
  "Notes",
  "Ending",
  "Hook",
]);

const IGNORED_TITLE_CASE_WORDS = new Set([
  "Beat",
  "Do",
  "Draft",
  "End",
  "Ground",
  "Keep",
  "Open",
  "She",
  "Stay",
  "The",
  "Trust",
  "Use",
]);

function collectText(storyboard: StoryboardOutput) {
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

function extractProperNouns(text: string) {
  return Array.from(
    new Set(
      Array.from(text.matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g), (match) => {
        const phrase = match[0].trim();
        const parts = phrase.split(/\s+/);

        if (parts.length > 2) {
          return [phrase, parts.slice(-2).join(" ")];
        }

        return [phrase];
      }).flat(),
    ),
  );
}

function buildSupportedEntitySet(retrievedNotes: RetrievedStoryNote[]) {
  return new Set(
    retrievedNotes.flatMap((note) => {
      return [...note.characters, ...note.locations].flatMap((entity) => {
        const parts = entity.split(" ");
        return [entity, parts[0] ?? entity];
      });
    }),
  );
}

function detectConstraintContradictions(
  text: string,
  retrievedNotes: RetrievedStoryNote[],
) {
  const lowered = text.toLowerCase();
  const warnings: string[] = [];

  const constraints = retrievedNotes.flatMap((note) => note.continuityConstraints);

  for (const constraint of constraints) {
    const normalized = constraint.toLowerCase();

    if (normalized.includes("cannot rewrite memorywater") && lowered.includes("rewrite memorywater")) {
      warnings.push("The storyboard suggests memorywater can be rewritten, which conflicts with Mara's limitation.");
    }

    if (normalized.includes("upper sky bridges are locked") && lowered.includes("upper sky bridges stayed open")) {
      warnings.push("The storyboard treats storm-locked sky bridges as open routes.");
    }

    if (
      normalized.includes("trust and timing") &&
      lowered.includes("sudden sword fight")
    ) {
      warnings.push("The storyboard swaps the intended trust-driven confrontation for random violence.");
    }
  }

  return warnings;
}

export function assessHallucinationRisk(
  storyboard: StoryboardOutput,
  retrievedNotes: RetrievedStoryNote[],
): HallucinationAssessment {
  const text = collectText(storyboard);
  const supportedEntities = buildSupportedEntitySet(retrievedNotes);
  const unsupportedEntities = Array.from(
    new Set(
      extractProperNouns(text).filter((entity) => {
        return (
          !ALLOWED_PROPER_NOUNS.has(entity) &&
          !IGNORED_TITLE_CASE_WORDS.has(entity) &&
          !supportedEntities.has(entity)
        );
      }),
    ),
  );

  const contradictionWarnings = detectConstraintContradictions(text, retrievedNotes);
  const genericProseWarnings = Array.from(
    new Set(
      Array.from(text.matchAll(/\b(somehow|something|someone|somewhere|maybe|kind of|sort of)\b/gi), (match) => {
        return `Generic phrasing detected: "${match[0]}".`;
      }),
    ),
  );

  const score = Math.min(
    100,
    unsupportedEntities.length * 18 +
      contradictionWarnings.length * 22 +
      genericProseWarnings.length * 10,
  );

  return {
    score,
    level: score >= 60 ? "high" : score >= 25 ? "medium" : "low",
    unsupportedEntities,
    contradictionWarnings,
    genericProseWarnings,
  };
}