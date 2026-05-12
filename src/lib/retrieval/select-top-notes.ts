import { type RetrievedStoryNote } from "@/lib/schemas/story";

export function selectTopNotes(
  scoredNotes: RetrievedStoryNote[],
  limit = 5,
) {
  const seenTitles = new Set<string>();

  return [...scoredNotes]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      return left.title.localeCompare(right.title);
    })
    .filter((note) => {
      const dedupeKey = `${note.category}:${note.title.toLowerCase()}`;

      if (seenTitles.has(dedupeKey)) {
        return false;
      }

      seenTitles.add(dedupeKey);
      return true;
    })
    .slice(0, limit);
}