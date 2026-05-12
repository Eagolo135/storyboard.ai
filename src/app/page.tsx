import Link from "next/link";

import { DemoStoryLibrary } from "@/components/demo-story-library";
import { StoryboardWorkspace } from "@/components/storyboard-workspace";
import dashboardStyles from "@/components/dashboard.module.css";
import {
  DEFAULT_STORY_ID,
  getStoryKnowledgeBase,
  getStoryPromptSuggestions,
  listStoryKnowledgeBaseSummaries,
} from "@/lib/data/repository";

export default function Home() {
  const knowledgeBase = getStoryKnowledgeBase(DEFAULT_STORY_ID);
  const sampleRequests = getStoryPromptSuggestions(DEFAULT_STORY_ID);
  const storySummaries = listStoryKnowledgeBaseSummaries();

  return (
    <>
      <main className={dashboardStyles.pageShell}>
        <section className={dashboardStyles.setupCard}>
          <p className={dashboardStyles.eyebrow}>Platform transition</p>
          <h2>StoryBoard AI is growing into an authenticated workspace</h2>
          <p>
            The original single-story MVP is still available below as a live demo. The
            new dashboard foundation for per-user stories is available at /dashboard.
          </p>
          <Link className={dashboardStyles.secondaryLink} href="/dashboard">
            Open dashboard foundation
          </Link>
        </section>

        <DemoStoryLibrary activeStoryId={DEFAULT_STORY_ID} stories={storySummaries} />
      </main>
      <StoryboardWorkspace
        knowledgeBase={knowledgeBase}
        sampleRequests={sampleRequests}
        storyId={DEFAULT_STORY_ID}
      />
    </>
  );
}
