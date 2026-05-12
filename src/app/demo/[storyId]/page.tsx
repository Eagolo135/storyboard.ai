import { notFound } from "next/navigation";

import styles from "@/components/dashboard.module.css";
import { DemoStoryLibrary } from "@/components/demo-story-library";
import { StoryboardWorkspace } from "@/components/storyboard-workspace";
import {
  getStoryKnowledgeBase,
  getStoryPromptSuggestions,
  hasStoryKnowledgeBase,
  listStoryKnowledgeBaseSummaries,
} from "@/lib/data/repository";

export default async function DemoStoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;

  if (!hasStoryKnowledgeBase(storyId)) {
    notFound();
  }

  const knowledgeBase = getStoryKnowledgeBase(storyId);
  const sampleRequests = getStoryPromptSuggestions(storyId);

  return (
    <>
      <main className={styles.pageShell}>
        <DemoStoryLibrary
          activeStoryId={storyId}
          stories={listStoryKnowledgeBaseSummaries()}
        />
      </main>
      <StoryboardWorkspace
        knowledgeBase={knowledgeBase}
        sampleRequests={sampleRequests}
        storyId={storyId}
      />
    </>
  );
}