import { type StoryboardResponse } from "@/lib/schemas/story";

function citationsFor(ids: string[]) {
  return ids.length > 0 ? ` Sources: ${ids.join(", ")}.` : "";
}

export function exportStoryboardToMarkdown(response: StoryboardResponse) {
  const { story, storyboard, evaluation, retrievedNotes } = response;

  return [
    `# StoryBoard AI: ${story.title}`,
    "",
    `Request: ${response.request}`,
    `Continuity score: ${evaluation.continuityScore}/100`,
    `Hallucination risk: ${evaluation.hallucinationRisk.score}/100 (${evaluation.hallucinationRisk.level})`,
    "",
    `## Scene goal`,
    `${storyboard.sections.sceneGoal}${citationsFor(storyboard.citations.sceneGoal)}`,
    "",
    `## Retrieved source context`,
    ...storyboard.sections.retrievedSourceContext.map((item, index) => {
      const note = retrievedNotes[index];
      return `- ${item}${note ? ` [${note.id}]` : ""}`;
    }),
    "",
    `## Opening situation`,
    `${storyboard.sections.openingSituation}${citationsFor(storyboard.citations.openingSituation)}`,
    "",
    `## Character motivation`,
    `${storyboard.sections.characterMotivation}${citationsFor(storyboard.citations.characterMotivation)}`,
    "",
    `## Key beats`,
    ...storyboard.sections.keyBeats.map((beat, index) => `### Beat ${index + 1}\n${beat}`),
    "",
    `## Conflict/tension`,
    `${storyboard.sections.conflictTension}${citationsFor(storyboard.citations.conflictTension)}`,
    "",
    `## Internal thought direction`,
    `${storyboard.sections.internalThoughtDirection}${citationsFor(storyboard.citations.internalThoughtDirection)}`,
    "",
    `## Continuity notes`,
    ...storyboard.sections.continuityNotes.map((note) => `- ${note}`),
    "",
    `## Ending hook`,
    `${storyboard.sections.endingHook}${citationsFor(storyboard.citations.endingHook)}`,
    "",
    `## Evaluation`,
    `- Source alignment: ${evaluation.sourceAlignment}/100`,
    `- Character consistency: ${evaluation.characterConsistency}/100`,
    `- Worldbuilding consistency: ${evaluation.worldbuildingConsistency}/100`,
    `- Tone fit: ${evaluation.toneFit}/100`,
    `- Style match: ${evaluation.styleMatch}/100`,
    `- Scene clarity: ${evaluation.sceneClarity}/100`,
    `- Hallucination risk: ${evaluation.hallucinationRisk.score}/100`,
    ...evaluation.summary.map((item) => `- ${item}`),
    "",
  ].join("\n");
}