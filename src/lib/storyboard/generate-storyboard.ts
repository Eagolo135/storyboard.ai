import {
  type RetrievedStoryNote,
  type StoryMetadata,
  type StoryboardOutput,
} from "@/lib/schemas/story";

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function firstOfCategory(
  notes: RetrievedStoryNote[],
  category: RetrievedStoryNote["category"],
) {
  return notes.find((note) => note.category === category);
}

function mostRelevantCharacter(notes: RetrievedStoryNote[]) {
  return dedupe(notes.flatMap((note) => note.characters))[0] ?? "the protagonist";
}

export function generateStoryboard(
  story: StoryMetadata,
  request: string,
  retrievedNotes: RetrievedStoryNote[],
): StoryboardOutput {
  if (retrievedNotes.length === 0) {
    return {
      request,
      citations: {
        sceneGoal: [],
        retrievedSourceContext: [],
        openingSituation: [],
        characterMotivation: [],
        keyBeats: [],
        conflictTension: [],
        internalThoughtDirection: [],
        continuityNotes: [],
        endingHook: [],
      },
      sections: {
        sceneGoal: "No storyboard can be generated until at least one source note is retrieved.",
        retrievedSourceContext: [],
        openingSituation: "Add a more specific request so the scene can be anchored in prior story material.",
        characterMotivation: "Character intent is unclear without supporting notes.",
        keyBeats: ["Gather source notes before outlining the next scene."],
        conflictTension: "Conflict cannot be grounded yet.",
        internalThoughtDirection: "Style guidance is unavailable without retrieved notes.",
        continuityNotes: ["Retrieve at least one note before evaluating continuity."],
        endingHook: "End on the missing question the next retrieval should answer.",
      },
    };
  }

  const protagonist = mostRelevantCharacter(retrievedNotes);
  const plotNote = firstOfCategory(retrievedNotes, "plot") ?? retrievedNotes[0];
  const previousChapterNote =
    firstOfCategory(retrievedNotes, "previous-chapter") ?? plotNote;
  const settingNote = firstOfCategory(retrievedNotes, "setting") ?? plotNote;
  const styleNote = firstOfCategory(retrievedNotes, "style");
  const characterNote =
    retrievedNotes.find((note) => note.characters.includes(protagonist)) ??
    firstOfCategory(retrievedNotes, "character") ??
    plotNote;
  const loreNote = firstOfCategory(retrievedNotes, "lore") ?? plotNote;

  const continuityNotes = dedupe(
    retrievedNotes.flatMap((note) => note.continuityConstraints).slice(0, 5),
  );

  return {
    request,
    citations: {
      sceneGoal: [plotNote.id],
      retrievedSourceContext: retrievedNotes.map((note) => note.id),
      openingSituation: [previousChapterNote.id, settingNote.id],
      characterMotivation: [characterNote.id],
      keyBeats: [previousChapterNote.id, plotNote.id, loreNote.id],
      conflictTension: [plotNote.id, loreNote.id],
      internalThoughtDirection: styleNote ? [styleNote.id, characterNote.id] : [characterNote.id],
      continuityNotes: continuityNotes.length > 0 ? continuityNotes.map((_, index) => retrievedNotes[index]?.id ?? plotNote.id) : [plotNote.id],
      endingHook: [plotNote.id, previousChapterNote.id],
    },
    sections: {
      sceneGoal: `${request.trim()} The scene should force ${protagonist} into a decision that reveals pressure already stored in the retrieved notes instead of inventing a new crisis.`,
      retrievedSourceContext: retrievedNotes.map((note) => `${note.title}: ${note.summary}`),
      openingSituation: `${previousChapterNote.summary} Open inside ${settingNote.locations[0] ?? "Orendale"}, where the environment itself makes honest conversation difficult and keeps the aftermath of chapter seven active on the page.`,
      characterMotivation: `${protagonist} enters the scene wanting something immediate and practical, but ${characterNote.summary.toLowerCase()} That motivation should stay intimate rather than heroic-posture broad.`,
      keyBeats: [
        `Re-establish the aftermath: ${previousChapterNote.summary}`,
        `Put the core decision on the table: ${plotNote.summary}`,
        `Let the setting intensify the exchange: ${settingNote.summary}`,
        `Press the hidden cost beneath the argument: ${loreNote.summary}`,
      ],
      conflictTension: `${plotNote.summary} Counter that pressure with ${loreNote.summary.toLowerCase()} The tension should come from timing, secrecy, and incompatible duties rather than surprise combat.`,
      internalThoughtDirection: styleNote
        ? `${styleNote.summary} Use interior thought to register what ${protagonist} notices in the body before naming what it means.`
        : `Stay close to ${protagonist}'s physical observations and withheld conclusions.`,
      continuityNotes,
      endingHook: `End with ${protagonist} facing a narrower but sharper choice than the one they entered with, ideally after a detail from ${plotNote.title.toLowerCase()} changes what trust can mean in the next scene.`,
    },
  };
}