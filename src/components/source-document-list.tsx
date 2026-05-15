import type { SourceDocumentRecord } from "@/lib/source-documents/schema";

import styles from "./dashboard.module.css";

const processingStatusLabels: Record<SourceDocumentRecord["processingStatus"], string> = {
  uploaded: "Stored",
  extracting: "Extracting",
  chunked: "Chunked",
  embedded: "Embedded",
  failed: "Failed",
};

type SourceDocumentListProps = {
  documents: SourceDocumentRecord[];
  emptyMessage: string;
};

function getDocumentPreview(document: SourceDocumentRecord) {
  if (!document.rawText) {
    return "No extracted text preview is available for this source yet.";
  }

  const preview = document.rawText.replace(/\s+/g, " ").trim();
  return preview.length > 260 ? `${preview.slice(0, 257)}...` : preview;
}

export function SourceDocumentList({
  documents,
  emptyMessage,
}: SourceDocumentListProps) {
  if (documents.length === 0) {
    return <p className={styles.mutedText}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.storyGrid}>
      {documents.map((document) => (
        <article className={styles.storyCard} key={document.id}>
          <div className={styles.storyCardHeader}>
            <div>
              <h3>{document.fileName ?? "Untitled source"}</h3>
              <p className={styles.metaRow}>{document.sourceType}</p>
            </div>
            <span className={styles.statusBadge}>
              {processingStatusLabels[document.processingStatus]}
            </span>
          </div>
          <p>{getDocumentPreview(document)}</p>
          <p className={styles.metaRow}>
            {processingStatusLabels[document.processingStatus]} • Updated {new Date(document.updatedAt).toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}