import { notFound } from "next/navigation";

import { PasteSourceForm } from "@/components/paste-source-form";
import styles from "@/components/dashboard.module.css";
import { SourceDocumentList } from "@/components/source-document-list";
import { StorySourceStoryboardPanel } from "@/components/story-source-storyboard-panel";
import { UploadSourceFileForm } from "@/components/upload-source-file-form";
import { listSourceDocumentsForStory } from "@/lib/source-documents/service";
import { getStoryForOwner } from "@/lib/stories/service";

type SignedInStoryWorkspaceProps = {
  storyId: string;
  userId: string;
};

export async function SignedInStoryWorkspace({
  storyId,
  userId,
}: SignedInStoryWorkspaceProps) {
  const storyResult = await getStoryForOwner(userId, storyId);

  if (!storyResult.ok) {
    notFound();
  }

  const sourceDocumentsResult = await listSourceDocumentsForStory(userId, storyId);
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
              Uploaded and pasted sources are chunked automatically, and storyboard
              generation now retrieves against those story-owned chunks.
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
            <p>Inspect stored material and verify which sources are chunked for retrieval.</p>
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

        <StorySourceStoryboardPanel story={story} />
      </section>
    </main>
  );
}