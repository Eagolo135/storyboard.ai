import Link from "next/link";

import { CreateStoryForm } from "@/components/create-story-form";
import { DemoStoryLibrary } from "@/components/demo-story-library";
import styles from "@/components/dashboard.module.css";
import { PasteSourceForm } from "@/components/paste-source-form";
import { SignOutButton } from "@/components/sign-out-button";
import { listStoryKnowledgeBaseSummaries } from "@/lib/data/repository";
import { listSourceDocumentsForOwner } from "@/lib/source-documents/service";
import { listStoriesForOwner } from "@/lib/stories/service";

type SignedInDashboardProps = {
  userId: string;
};

export async function SignedInDashboard({ userId }: SignedInDashboardProps) {
  const storiesResult = await listStoriesForOwner(userId);
  const sourceDocumentsResult = await listSourceDocumentsForOwner(userId);
  const demoStorySummaries = listStoryKnowledgeBaseSummaries();

  return (
    <main className={styles.pageShell}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Authenticated workspace</p>
        <div className={styles.heroGrid}>
          <div>
            <h1>Your story library</h1>
            <p className={styles.lede}>
              This is where your worlds live once you sign in. Create a new story,
              return to existing projects, and keep each source archive attached to the
              story it belongs to.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="#create-story">
                Create a new story
              </Link>
              <SignOutButton className={styles.secondaryLink} />
            </div>
          </div>
          <div className={styles.statusCard}>
            <h3>Current foundation status</h3>
            <p className={styles.mutedText}>
              Authentication, story ownership, and the first source-ingestion slice are in place.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Scoring and AI evaluation sandbox</h2>
            <p>
              Open a curated demo workspace to inspect retrieval scores, continuity evaluation,
              hallucination risk, model mode, and feedback generated from a storyboard request.
            </p>
          </div>
          <Link
            className={styles.secondaryLink}
            href={`/demo/${demoStorySummaries[0]?.id ?? "glass-archive"}`}
          >
            Open evaluation demo
          </Link>
        </div>
        <DemoStoryLibrary activeStoryId="" stories={demoStorySummaries} />
      </section>

      <section className={styles.grid}>
        <div className={styles.panel} id="create-story">
          <div className={styles.sectionHeader}>
            <h2>Create new story</h2>
            <p>Start a workspace that will later hold uploaded drafts and retrieval context.</p>
          </div>
          <CreateStoryForm />
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Story library</h2>
            <p>Every story below belongs to the signed-in account.</p>
          </div>

          {storiesResult.ok ? (
            storiesResult.data.length > 0 ? (
              <div className={styles.storyGrid}>
                {storiesResult.data.map((story) => (
                  <article className={styles.storyCard} key={story.id}>
                    <div className={styles.storyCardHeader}>
                      <h3>{story.title}</h3>
                      <Link className={styles.secondaryLink} href={`/dashboard/stories/${story.id}`}>
                        Open sources
                      </Link>
                    </div>
                    <p>{story.summary || "No summary yet."}</p>
                    <p className={styles.metaRow}>
                      Updated {new Date(story.updatedAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.mutedText}>
                No stories yet. Create one to start building your authenticated workspace.
              </p>
            )
          ) : (
            <p className={styles.errorMessage}>{storiesResult.error}</p>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Source intake</h2>
            <p>Attach pasted text to a story so ingestion can move toward real retrieval.</p>
          </div>

          {storiesResult.ok ? (
            storiesResult.data.length > 0 ? (
              <PasteSourceForm stories={storiesResult.data} />
            ) : (
              <p className={styles.mutedText}>
                Create a story before adding source material.
              </p>
            )
          ) : (
            <p className={styles.errorMessage}>{storiesResult.error}</p>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Recent sources</h2>
            <p>Stored source documents will become the basis for later chunking and retrieval.</p>
          </div>

          {sourceDocumentsResult.ok ? (
            sourceDocumentsResult.data.length > 0 ? (
              <div className={styles.storyGrid}>
                {sourceDocumentsResult.data.map((document) => {
                  const storyTitle =
                    storiesResult.ok
                      ? storiesResult.data.find((story) => story.id === document.storyId)
                          ?.title ?? "Unknown story"
                      : "Unknown story";

                  return (
                    <article className={styles.storyCard} key={document.id}>
                      <h3>{document.fileName ?? "Untitled source"}</h3>
                      <p>{storyTitle}</p>
                      <p className={styles.metaRow}>
                        {document.sourceType} • {document.processingStatus} • Updated{" "}
                        {new Date(document.updatedAt).toLocaleString()}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.mutedText}>
                No source material yet. Paste chapter text, notes, or lore to start the
                ingestion path.
              </p>
            )
          ) : (
            <p className={styles.errorMessage}>{sourceDocumentsResult.error}</p>
          )}
        </div>
      </section>
    </main>
  );
}