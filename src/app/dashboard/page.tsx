import Link from "next/link";

import { CreateStoryForm } from "@/components/create-story-form";
import { PasteSourceForm } from "@/components/paste-source-form";
import styles from "@/components/dashboard.module.css";
import { getViewer } from "@/lib/auth/viewer";
import { getMissingPlatformRequirements } from "@/lib/platform/env";
import { listSourceDocumentsForOwner } from "@/lib/source-documents/service";
import { listStoriesForOwner } from "@/lib/stories/service";

export default async function DashboardPage() {
  const viewer = await getViewer();

  if (viewer.status === "not-configured") {
    const missing = getMissingPlatformRequirements();

    return (
      <main className={styles.pageShell}>
        <section className={styles.setupCard}>
          <p className={styles.eyebrow}>Sprint 007 in progress</p>
          <h2>Source intake is ready to activate</h2>
          <p>
            The dashboard now includes story creation and the first source-intake slice,
            but live auth and persistence still need provider credentials before this
            environment can sign users in or save data.
          </p>
          <ul className={styles.setupList}>
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  if (viewer.status === "signed-out") {
    return (
      <main className={styles.pageShell}>
        <section className={styles.signedOutCard}>
          <p className={styles.eyebrow}>Dashboard</p>
          <h2>Sign in to access your stories</h2>
          <p>
            StoryBoard AI is moving to a per-user workspace model. Sign in to create
            stories, upload source material, and eventually run authenticated RAG.
          </p>
          <Link className={styles.secondaryLink} href="/sign-in">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  const storiesResult = await listStoriesForOwner(viewer.userId);
  const sourceDocumentsResult = await listSourceDocumentsForOwner(viewer.userId);

  return (
    <main className={styles.pageShell}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Authenticated workspace</p>
        <div className={styles.heroGrid}>
          <div>
            <h1>Your stories</h1>
            <p className={styles.lede}>
              This dashboard is the first step toward a real multi-user StoryBoard AI
              platform where every user owns their own stories, source files, and AI outputs.
            </p>
          </div>
          <div className={styles.statusCard}>
            <h3>Current foundation status</h3>
            <p className={styles.mutedText}>
              Authentication, story ownership, and the first source-ingestion slice are in place.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Create story</h2>
            <p>Start a workspace that will later hold uploaded drafts and retrieval context.</p>
          </div>
          <CreateStoryForm />
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Story list</h2>
            <p>Stories are scoped to the signed-in user.</p>
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
