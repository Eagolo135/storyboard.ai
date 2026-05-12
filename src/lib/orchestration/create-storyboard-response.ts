import { getStoryKnowledgeBase } from "@/lib/data/repository";
import { evaluateStoryboard } from "@/lib/evaluation/evaluate-storyboard";
import { exportStoryboardToMarkdown } from "@/lib/export/to-markdown";
import {
  storyboardRequestSchema,
  type StoryboardResponse,
} from "@/lib/schemas/story";
import { retrieveStoryContext } from "@/lib/retrieval/retrieve-story-context";
import { generateStoryboard } from "@/lib/storyboard/generate-storyboard";

export function createStoryboardResponse(
  rawRequest: string,
  storyId?: string,
): StoryboardResponse {
  const { request, storyId: parsedStoryId } = storyboardRequestSchema.parse({
    request: rawRequest,
    storyId,
  });
  const knowledgeBase = getStoryKnowledgeBase(parsedStoryId);
  const retrievedNotes = retrieveStoryContext(request, knowledgeBase, 5);
  const storyboard = generateStoryboard(knowledgeBase.story, request, retrievedNotes);
  const evaluation = evaluateStoryboard(storyboard, retrievedNotes);

  const response: StoryboardResponse = {
    story: knowledgeBase.story,
    request,
    retrievedNotes,
    storyboard,
    evaluation,
    markdown: "",
  };

  response.markdown = exportStoryboardToMarkdown(response);
  return response;
}