import { generateStoryboardWithAi } from "@/lib/ai/generate-storyboard";
import { getStoryKnowledgeBase } from "@/lib/data/repository";
import { evaluateStoryboard } from "@/lib/evaluation/evaluate-storyboard";
import { exportStoryboardToMarkdown } from "@/lib/export/to-markdown";
import { retrieveSourceContext } from "@/lib/retrieval/retrieve-source-context";
import {
  storyboardRequestSchema,
  type StoryboardResponse,
  type StoryMetadata,
} from "@/lib/schemas/story";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";
import {
  ensureEmbeddingsForStoryChunks,
  listSourceDocumentChunksForStory,
} from "@/lib/source-chunks/service";
import { getStoryForOwner } from "@/lib/stories/service";
import { generateStoryboard } from "@/lib/storyboard/generate-storyboard";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildStoryMetadataFromRecord(story: {
  id: string;
  title: string;
  summary: string;
}): StoryMetadata {
  return {
    id: story.id,
    title: story.title,
    genre: ["User-owned story"],
    premise:
      story.summary ||
      "A user-owned story workspace grounded in uploaded or pasted source material.",
    tone: "Grounded, continuity-aware planning",
    styleGuide: [
      "Use only retrieved story-owned evidence.",
      "Prefer concrete continuity details over generic abstraction.",
    ],
  };
}

export async function createStoryboardResponse(
  rawRequest: string,
  storyId?: string,
  viewerId?: string,
): Promise<StoryboardResponse> {
  const { request, storyId: parsedStoryId } = storyboardRequestSchema.parse({
    request: rawRequest,
    storyId,
  });

  if (viewerId && parsedStoryId && isUuid(parsedStoryId)) {
    const storyResult = await getStoryForOwner(viewerId, parsedStoryId);

    if (!storyResult.ok) {
      throw new RangeError(storyResult.error);
    }

    const chunkResult = await listSourceDocumentChunksForStory(viewerId, parsedStoryId);

    if (!chunkResult.ok) {
      throw new Error(chunkResult.error);
    }

    const story = buildStoryMetadataFromRecord(storyResult.data);
    const embeddedChunksResult = await ensureEmbeddingsForStoryChunks(viewerId, chunkResult.data);
    const retrievalResult = await retrieveSourceContext(
      request,
      embeddedChunksResult.ok ? embeddedChunksResult.data : chunkResult.data,
      5,
    );
    const retrievalMetadata = embeddedChunksResult.ok && embeddedChunksResult.warning
      ? {
          ...retrievalResult.metadata,
          warning: embeddedChunksResult.warning,
        }
      : retrievalResult.metadata;
    const retrievedNotes = retrievalResult.retrievedNotes;
    const fallbackStoryboard = generateStoryboard(story, request, retrievedNotes);
    const generationResult = await generateStoryboardWithAi({
      story,
      request,
      retrievedNotes,
      fallbackStoryboard,
    });
    const storyboard = generationResult.storyboard;
    const evaluationResult = await evaluateStoryboard(story, storyboard, retrievedNotes);

    const response: StoryboardResponse = {
      story,
      request,
      retrievedNotes,
      retrieval: retrievalMetadata,
      storyboard,
      generation: generationResult.generation,
      evaluation: evaluationResult.evaluation,
      evaluationMeta: evaluationResult.metadata,
      markdown: "",
    };

    response.markdown = exportStoryboardToMarkdown(response);
    return response;
  }

  const knowledgeBase = getStoryKnowledgeBase(parsedStoryId);
  const retrievedNotes = retrieveStoryContext(request, knowledgeBase, 5);
  const fallbackStoryboard = generateStoryboard(
    knowledgeBase.story,
    request,
    retrievedNotes,
  );
  const generationResult = await generateStoryboardWithAi({
    story: knowledgeBase.story,
    request,
    retrievedNotes,
    fallbackStoryboard,
  });
  const storyboard = generationResult.storyboard;
  const evaluationResult = await evaluateStoryboard(
    knowledgeBase.story,
    storyboard,
    retrievedNotes,
  );

  const response: StoryboardResponse = {
    story: knowledgeBase.story,
    request,
    retrievedNotes,
    retrieval: {
      mode: "lexical-fallback",
      provider: "Local retrieval",
      model: "lexical-ranking-v1",
      candidateCount: knowledgeBase.notes.length,
    },
    storyboard,
    generation: generationResult.generation,
    evaluation: evaluationResult.evaluation,
    evaluationMeta: evaluationResult.metadata,
    markdown: "",
  };

  response.markdown = exportStoryboardToMarkdown(response);
  return response;
}