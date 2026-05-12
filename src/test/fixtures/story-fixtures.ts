import { DEFAULT_STORY_ID, getStoryKnowledgeBase } from "@/lib/data/repository";
import type { StoryNote, StoryboardOutput } from "@/lib/schemas/story";

export function getFixtureKnowledgeBase() {
  return getStoryKnowledgeBase(DEFAULT_STORY_ID);
}

export function getFixtureNote(overrides: Partial<StoryNote> = {}): StoryNote {
  const baseNote = getStoryKnowledgeBase(DEFAULT_STORY_ID).notes[0];
  return {
    ...baseNote,
    ...overrides,
  };
}

export function getFixtureStoryboard(overrides: Partial<StoryboardOutput> = {}): StoryboardOutput {
  return {
    request: "Draft chapter 8 storyboard",
    citations: {
      sceneGoal: ["char-mara-vey"],
      retrievedSourceContext: ["char-mara-vey"],
      openingSituation: ["prev-ledger-heist"],
      characterMotivation: ["char-mara-vey"],
      keyBeats: ["plot-floodgate-choice"],
      conflictTension: ["plot-floodgate-choice"],
      internalThoughtDirection: ["style-close-third"],
      continuityNotes: ["plot-floodgate-choice"],
      endingHook: ["plot-floodgate-choice"],
    },
    sections: {
      sceneGoal: "Ground the chapter eight confrontation in existing trust fractures.",
      retrievedSourceContext: ["Mara cannot rewrite memorywater."],
      openingSituation: "Mara arrives soaked and angry.",
      characterMotivation: "She wants the truth before the engines fail.",
      keyBeats: ["Beat one", "Beat two", "Beat three", "Beat four"],
      conflictTension: "Trust collides with survival timing.",
      internalThoughtDirection: "Stay close to Mara's sensory intake.",
      continuityNotes: ["Do not make Mara capable of rewriting memorywater."],
      endingHook: "End on a narrowed, sharper choice.",
    },
    ...overrides,
  };
}