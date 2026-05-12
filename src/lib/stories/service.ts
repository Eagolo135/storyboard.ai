import {
  createStoryInputSchema,
  type CreateStoryInput,
} from "@/lib/stories/schema";
import { getStoryRepository } from "@/lib/stories/repository";

export async function listStoriesForOwner(ownerId: string) {
  return getStoryRepository().listStoriesForOwner(ownerId);
}

export async function getStoryForOwner(ownerId: string, storyId: string) {
  return getStoryRepository().getStoryForOwner(ownerId, storyId);
}

export async function createStoryForOwner(
  ownerId: string,
  input: CreateStoryInput,
) {
  const parsedInput = createStoryInputSchema.parse(input);

  return getStoryRepository().createStoryForOwner(ownerId, parsedInput);
}
