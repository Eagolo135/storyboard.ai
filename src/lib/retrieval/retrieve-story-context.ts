import {
  type RetrievedStoryNote,
  type StoryKnowledgeBase,
} from "@/lib/schemas/story";
import {
  createScoredStoryNote,
  extractRetrievalSignals,
} from "@/lib/retrieval/scoring";
import { selectTopNotes } from "@/lib/retrieval/select-top-notes";

export function retrieveStoryContext(
  request: string,
  knowledgeBase: StoryKnowledgeBase,
  limit = 5,
): RetrievedStoryNote[] {
  const signals = extractRetrievalSignals(request, knowledgeBase);

  return selectTopNotes(
    knowledgeBase.notes.map((note) => createScoredStoryNote(note, signals)),
    limit,
  );
}