import {
  type RetrievalScoreBreakdown,
  type RetrievedStoryNote,
  type StoryKnowledgeBase,
  type StoryNote,
} from "@/lib/schemas/story";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "be",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "scene",
  "storyboard",
  "that",
  "the",
  "this",
  "to",
  "with",
]);

const CATEGORY_KEYWORDS: Record<StoryNote["category"], string[]> = {
  character: ["character", "motivation", "arc", "relationship", "mara", "ilyan"],
  lore: ["lore", "rule", "history", "moonwell", "accord", "memorywater"],
  plot: ["scene", "chapter", "beat", "decision", "turn", "reveal", "conflict"],
  setting: ["setting", "location", "vault", "hall", "bridge", "storm"],
  style: ["style", "tone", "voice", "prose", "close third"],
  "previous-chapter": ["continue", "after", "previous", "last chapter", "aftermath"],
};

export type RetrievalSignals = {
  tokens: string[];
  characters: string[];
  locations: string[];
  categories: StoryNote["category"][];
  chapterNumbers: number[];
  continuationIntent: boolean;
};

function entityMentioned(request: string, entity: string) {
  const requestTokens = new Set(tokenize(request));
  const entityTokens = tokenize(entity);

  return (
    entityTokens.every((token) => requestTokens.has(token)) ||
    entityTokens.some((token) => token.length > 3 && requestTokens.has(token))
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function intersectionSize(left: Iterable<string>, right: Iterable<string>) {
  const rightSet = new Set(right);
  let matches = 0;

  for (const value of left) {
    if (rightSet.has(value)) {
      matches += 1;
    }
  }

  return matches;
}

export function extractRetrievalSignals(
  request: string,
  knowledgeBase: StoryKnowledgeBase,
): RetrievalSignals {
  const lowered = request.toLowerCase();
  const tokens = tokenize(request);
  const chapterNumbers = Array.from(
    lowered.matchAll(/chapter\s*(\d+)/g),
    (match) => Number(match[1]),
  );

  const characters = knowledgeBase.notes
    .flatMap((note) => note.characters)
    .filter((character, index, allCharacters) => {
      return allCharacters.indexOf(character) === index;
    })
    .filter((character) => entityMentioned(request, character));

  const locations = knowledgeBase.notes
    .flatMap((note) => note.locations)
    .filter((location, index, allLocations) => {
      return allLocations.indexOf(location) === index;
    })
    .filter((location) => entityMentioned(request, location));

  const categories = (Object.entries(CATEGORY_KEYWORDS) as Array<
    [StoryNote["category"], string[]]
  >)
    .filter(([, keywords]) => keywords.some((keyword) => lowered.includes(keyword)))
    .map(([category]) => category);

  return {
    tokens,
    characters,
    locations,
    categories,
    chapterNumbers,
    continuationIntent:
      chapterNumbers.length > 0 ||
      /continue|after|follow-up|next|aftermath/.test(lowered),
  };
}

function buildNoteTokenSet(note: StoryNote) {
  return new Set(tokenize(`${note.title} ${note.summary} ${note.content} ${note.tags.join(" ")}`));
}

export function scoreStoryNote(
  note: StoryNote,
  signals: RetrievalSignals,
): RetrievalScoreBreakdown {
  const queryTokenSet = new Set(signals.tokens);
  const noteTokenSet = buildNoteTokenSet(note);
  const lexicalOverlap = Math.min(
    34,
    intersectionSize(queryTokenSet, noteTokenSet) * 4.25,
  );

  const tagAlignment = Math.min(
    16,
    intersectionSize(queryTokenSet, note.tags.map((tag) => normalizeText(tag))) * 4,
  );

  const characterMatch = Math.min(
    16,
    intersectionSize(
      signals.characters.map((value) => value.toLowerCase()),
      note.characters.map((value) => value.toLowerCase()),
    ) * 8,
  );

  const locationMatch = Math.min(
    12,
    intersectionSize(
      signals.locations.map((value) => value.toLowerCase()),
      note.locations.map((value) => value.toLowerCase()),
    ) * 6,
  );

  const categoryAlignment = signals.categories.includes(note.category) ? 10 : 0;

  const chapterRelevance = signals.chapterNumbers.length
    ? note.chapterRefs.some((chapterRef) => signals.chapterNumbers.includes(chapterRef))
      ? 8
      : Math.max(0, 8 - Math.min(...note.chapterRefs.map((chapterRef) => {
          return Math.min(
            ...signals.chapterNumbers.map((requestChapter) =>
              Math.abs(chapterRef - requestChapter),
            ),
          );
        })))
    : signals.continuationIntent && note.category === "previous-chapter"
      ? 7
      : 0;

  const priorityBoost = note.priority * 1.6;

  const total =
    lexicalOverlap +
    tagAlignment +
    characterMatch +
    locationMatch +
    categoryAlignment +
    chapterRelevance +
    priorityBoost;

  return {
    lexicalOverlap: round(lexicalOverlap),
    tagAlignment: round(tagAlignment),
    characterMatch: round(characterMatch),
    locationMatch: round(locationMatch),
    categoryAlignment: round(categoryAlignment),
    chapterRelevance: round(chapterRelevance),
    priorityBoost: round(priorityBoost),
    semanticSimilarity: 0,
    total: round(total),
  };
}

export function buildRetrievalReasons(
  note: StoryNote,
  signals: RetrievalSignals,
  breakdown: RetrievalScoreBreakdown,
) {
  const reasons: string[] = [];

  if (breakdown.characterMatch > 0) {
    reasons.push(`Matches requested character focus: ${note.characters.join(", ")}.`);
  }

  if (breakdown.locationMatch > 0) {
    reasons.push(`Anchors the scene in ${note.locations.join(", ")}.`);
  }

  if (breakdown.chapterRelevance > 0) {
    reasons.push(`Relevant to the requested chapter progression.`);
  }

  if (breakdown.categoryAlignment > 0) {
    reasons.push(`Category fit: ${note.category.replace("-", " ")}.`);
  }

  if (breakdown.lexicalOverlap > 0 && note.evidencePhrases.length > 0) {
    reasons.push(`Contains direct evidence such as "${note.evidencePhrases[0]}".`);
  }

  if (signals.continuationIntent && note.category === "previous-chapter") {
    reasons.push(`Carries forward the immediate chapter-to-chapter continuity.`);
  }

  return reasons.slice(0, 3);
}

export function createScoredStoryNote(
  note: StoryNote,
  signals: RetrievalSignals,
): RetrievedStoryNote {
  const breakdown = scoreStoryNote(note, signals);

  return {
    ...note,
    score: breakdown.total,
    breakdown,
    reasons: buildRetrievalReasons(note, signals, breakdown),
  };
}