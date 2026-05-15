import { createEmbeddings } from "@/lib/ai/openai-client";
import { getAiEmbeddingConfig, isAiEmbeddingConfigured } from "@/lib/platform/env";
import { tokenize } from "@/lib/retrieval/scoring";
import type {
  RetrievedStoryNote,
  RetrievalMetadata,
  RetrievalScoreBreakdown,
  StoryNote,
} from "@/lib/schemas/story";
import type { SourceDocumentChunk } from "@/lib/source-chunks/schema";

const LOCATION_HINTS = [
  "archive",
  "bridge",
  "cathedral",
  "dock",
  "engine hall",
  "gate",
  "hall",
  "platform",
  "river",
  "square",
  "station",
  "tower",
  "vault",
];

const CATEGORY_HINTS: Record<StoryNote["category"], string[]> = {
  character: ["character", "relationship", "motivation", "trust", "betrayal"],
  lore: ["law", "lore", "ritual", "history", "rule", "system"],
  plot: ["chapter", "choice", "decision", "plan", "scene", "turn"],
  setting: ["bridge", "cathedral", "engine hall", "gate", "room", "tower"],
  style: ["close third", "imagery", "prose", "style", "tone", "voice"],
  "previous-chapter": ["after", "aftermath", "continue", "following", "previous"],
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function extractChapterNumbers(value: string) {
  return Array.from(value.toLowerCase().matchAll(/chapter\s*(\d+)/g), (match) =>
    Number(match[1]),
  );
}

function extractTitleCasePhrases(value: string) {
  return Array.from(
    new Set(
      Array.from(value.matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g), (match) =>
        match[0].trim(),
      ),
    ),
  );
}

function classifyChunk(request: string, chunk: SourceDocumentChunk): StoryNote["category"] {
  const text = `${request} ${chunk.sourceDocumentTitle ?? ""} ${chunk.heading ?? ""} ${chunk.content}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_HINTS) as Array<
    [StoryNote["category"], string[]]
  >) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "plot";
}

function buildLocationList(text: string) {
  const lowered = text.toLowerCase();
  return LOCATION_HINTS.filter((hint) => lowered.includes(hint)).map((hint) => {
    return hint.replace(/\b\w/g, (letter) => letter.toUpperCase());
  });
}

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function buildLexicalBreakdown(request: string, chunk: SourceDocumentChunk) {
  const requestTokens = new Set(tokenize(request));
  const chunkTokens = new Set(
    tokenize(`${chunk.sourceDocumentTitle ?? ""} ${chunk.heading ?? ""} ${chunk.content}`),
  );
  const titleTokens = new Set(tokenize(`${chunk.sourceDocumentTitle ?? ""} ${chunk.heading ?? ""}`));
  const queryEntities = extractTitleCasePhrases(request).map((entity) => entity.toLowerCase());
  const chunkEntities = extractTitleCasePhrases(chunk.content).map((entity) => entity.toLowerCase());
  const requestChapters = extractChapterNumbers(request);
  const chunkChapters = extractChapterNumbers(
    `${chunk.sourceDocumentTitle ?? ""} ${chunk.heading ?? ""} ${chunk.content}`,
  );

  const lexicalOverlap = Array.from(requestTokens).filter((token) => chunkTokens.has(token)).length * 5.5;
  const tagAlignment = Array.from(requestTokens).filter((token) => titleTokens.has(token)).length * 6;
  const characterMatch = queryEntities.filter((entity) => chunkEntities.includes(entity)).length * 9;
  const locationMatch = buildLocationList(chunk.content).length * 2;
  const categoryAlignment = CATEGORY_HINTS[classifyChunk(request, chunk)].some((keyword) =>
    request.toLowerCase().includes(keyword),
  )
    ? 8
    : 0;
  const chapterRelevance =
    requestChapters.length > 0 && chunkChapters.some((chapter) => requestChapters.includes(chapter))
      ? 8
      : 0;
  const priorityBoost = Math.max(1, 5 - Math.min(chunk.chunkIndex, 4));

  return {
    lexicalOverlap,
    tagAlignment,
    characterMatch,
    locationMatch,
    categoryAlignment,
    chapterRelevance,
    priorityBoost,
  };
}

function buildBreakdown(
  request: string,
  chunk: SourceDocumentChunk,
  semanticSimilarity: number,
): RetrievalScoreBreakdown {
  const lexical = buildLexicalBreakdown(request, chunk);
  const total =
    lexical.lexicalOverlap +
    lexical.tagAlignment +
    lexical.characterMatch +
    lexical.locationMatch +
    lexical.categoryAlignment +
    lexical.chapterRelevance +
    lexical.priorityBoost +
    semanticSimilarity;

  return {
    lexicalOverlap: round(lexical.lexicalOverlap),
    tagAlignment: round(lexical.tagAlignment),
    characterMatch: round(lexical.characterMatch),
    locationMatch: round(lexical.locationMatch),
    categoryAlignment: round(lexical.categoryAlignment),
    chapterRelevance: round(lexical.chapterRelevance),
    priorityBoost: round(lexical.priorityBoost),
    semanticSimilarity: round(semanticSimilarity),
    total: round(total),
  };
}

function buildReasons(request: string, chunk: SourceDocumentChunk, breakdown: RetrievalScoreBreakdown) {
  const reasons: string[] = [];

  if (breakdown.semanticSimilarity > 0) {
    reasons.push("Embedding similarity indicates this chunk is semantically close to the request.");
  }

  if (breakdown.tagAlignment > 0) {
    reasons.push(`Title alignment with ${chunk.sourceDocumentTitle ?? "the source document"}.`);
  }

  if (breakdown.lexicalOverlap > 0) {
    reasons.push("Chunk text overlaps with the request language.");
  }

  if (breakdown.chapterRelevance > 0) {
    reasons.push("Chunk references the requested chapter progression.");
  }

  if (breakdown.characterMatch > 0) {
    reasons.push("Named entities in the request also appear in this chunk.");
  }

  if (reasons.length === 0) {
    reasons.push(`Retrieved from ${chunk.sourceDocumentTitle ?? "story source"} as one of the strongest available matches.`);
  }

  return reasons.slice(0, 3);
}

function createRetrievedNote(
  request: string,
  chunk: SourceDocumentChunk,
  semanticSimilarity = 0,
): RetrievedStoryNote {
  const breakdown = buildBreakdown(request, chunk, semanticSimilarity);
  const locations = buildLocationList(chunk.content);
  const entities = extractTitleCasePhrases(chunk.content);
  const content = chunk.content.replace(/\s+/g, " ").trim();
  const title = chunk.heading ?? chunk.sourceDocumentTitle ?? `Source chunk ${chunk.chunkIndex + 1}`;

  return {
    id: chunk.id,
    category: classifyChunk(request, chunk),
    title,
    summary: truncate(content, 220),
    content,
    tags: tokenize(`${chunk.sourceDocumentTitle ?? ""} ${chunk.heading ?? ""}`).slice(0, 6),
    characters: entities.slice(0, 4),
    locations: locations.slice(0, 3),
    chapterRefs: extractChapterNumbers(`${chunk.heading ?? ""} ${chunk.content}`),
    priority: Math.max(1, 5 - Math.min(chunk.chunkIndex, 4)),
    evidencePhrases: [truncate(content, 140)],
    continuityConstraints: [],
    score: breakdown.total,
    reasons: buildReasons(request, chunk, breakdown),
    breakdown,
  };
}

function lexicalFallback(
  request: string,
  chunks: SourceDocumentChunk[],
  limit: number,
  warning?: string,
) {
  return {
    retrievedNotes: chunks
      .map((chunk) => createRetrievedNote(request, chunk))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
    metadata: {
      mode: "lexical-fallback",
      provider: "Local retrieval",
      model: "lexical-ranking-v1",
      candidateCount: chunks.length,
      warning,
    } satisfies RetrievalMetadata,
  };
}

export async function retrieveSourceContext(
  request: string,
  chunks: SourceDocumentChunk[],
  limit = 5,
): Promise<{ retrievedNotes: RetrievedStoryNote[]; metadata: RetrievalMetadata }> {
  const embeddedChunks = chunks.filter((chunk) => chunk.embedding && chunk.embedding.length > 0);

  if (!isAiEmbeddingConfigured() || embeddedChunks.length === 0) {
    return lexicalFallback(
      request,
      chunks,
      limit,
      isAiEmbeddingConfigured() && chunks.length > 0 && embeddedChunks.length === 0
        ? "Chunks exist but no embeddings were available, so retrieval stayed lexical."
        : undefined,
    );
  }

  try {
    const [queryEmbedding] = await createEmbeddings([request]);
    const config = getAiEmbeddingConfig();

    if (!queryEmbedding) {
      return lexicalFallback(
        request,
        chunks,
        limit,
        "The embedding provider returned no query vector, so retrieval stayed lexical.",
      );
    }

    const retrievedNotes = chunks
      .map((chunk) => {
        const similarity = chunk.embedding ? Math.max(0, cosineSimilarity(queryEmbedding, chunk.embedding)) : 0;
        return createRetrievedNote(request, chunk, similarity * 35);
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    return {
      retrievedNotes,
      metadata: {
        mode: "semantic-hybrid",
        provider: config.providerLabel,
        model: config.model,
        candidateCount: chunks.length,
      },
    };
  } catch (error) {
    return lexicalFallback(
      request,
      chunks,
      limit,
      error instanceof Error
        ? `${error.message} Retrieval stayed lexical instead.`
        : "Embedding retrieval failed, so retrieval stayed lexical instead.",
    );
  }
}