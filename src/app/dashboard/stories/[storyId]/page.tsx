import Link from "next/link";
import { notFound } from "next/navigation";

import { PasteSourceForm } from "@/components/paste-source-form";
import { SourceDocumentList } from "@/components/source-document-list";
import styles from "@/components/dashboard.module.css";
import { UploadSourceFileForm } from "@/components/upload-source-file-form";
import { getViewer } from "@/lib/auth/viewer";
import { getMissingPlatformRequirements } from "@/lib/platform/env";
import { listSourceDocumentsForStory } from "@/lib/source-documents/service";
import { getStoryForOwner } from "@/lib/stories/service";

export default async function StoryWorkspacePage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const viewer = await getViewer();

  if (viewer.status === "not-configured") {
    const missing = getMissingPlatformRequirements();

    return (
      <main className={styles.pageShell}>
        <section className={styles.setupCard}>
          <p className={styles.eyebrow}>Sprint 007 in progress</p>
          <h2>Story source workspace is ready to activate</h2>
          <p>
            Story-level source views, pasted intake, and upload extraction are wired,
            but provider credentials are still required before this environment can load
            authenticated story data.
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
          <p className={styles.eyebrow}>Story workspace</p>
          <h2>Sign in to inspect story sources</h2>
          <p>
            StoryBoard AI now supports story-level source intake, but it still requires a
            signed-in user context.
          </p>
          <Link className={styles.secondaryLink} href="/sign-in">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  const storyResult = await getStoryForOwner(viewer.userId, storyId);

  if (!storyResult.ok) {
    notFound();
  }

  const sourceDocumentsResult = await listSourceDocumentsForStory(viewer.userId, storyId);
  const story = storyResult.data;

  return (
    <main className={styles.pageShell}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Story source workspace</p>
        <div className={styles.heroGrid}>
          <div>
            <h1>{story.title}</h1>
            <p className={styles.lede}>{story.summary || "No summary yet."}</p>
          </div>
          <div className={styles.statusCard}>
            <h3>Ingestion status</h3>
            <p className={styles.mutedText}>
              Source files can now be uploaded and extracted, but chunking and semantic
              retrieval are still pending later sprint work.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Paste source text</h2>
            <p>Attach notes, draft fragments, or chapter text directly to this story.</p>
          </div>
          <PasteSourceForm stories={[story]} />
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <h2>Upload source file</h2>
            <p>PDF and DOCX uploads are stored and extracted server-side.</p>
          </div>
          <UploadSourceFileForm storyId={story.id} />
        </div>

        <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
          <div className={styles.sectionHeader}>
            <h2>Story sources</h2>
            <p>Inspect stored material and its current processing state.</p>
          </div>

          {sourceDocumentsResult.ok ? (
            <SourceDocumentList
              documents={sourceDocumentsResult.data}
              emptyMessage="No source material is attached to this story yet."
            />
          ) : (
            <p className={styles.errorMessage}>{sourceDocumentsResult.error}</p>
          )}
        </div>
      </section>
    </main>
  );
}