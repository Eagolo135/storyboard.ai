"use client";

import { useActionState } from "react";

import {
  createPastedSourceAction,
  type CreatePastedSourceActionState,
} from "@/app/dashboard/actions";
import type { StoryRecord } from "@/lib/stories/schema";

import styles from "./dashboard.module.css";

const INITIAL_STATE: CreatePastedSourceActionState = {
  status: "idle",
};

type PasteSourceFormProps = {
  stories: StoryRecord[];
};

export function PasteSourceForm({ stories }: PasteSourceFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPastedSourceAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className={styles.createForm}>
      <div className={styles.fieldGroup}>
        <label htmlFor="storyId">Target story</label>
        <select defaultValue={stories[0]?.id ?? ""} id="storyId" name="storyId" required>
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.title}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="sourceTitle">Source title</label>
        <input
          id="sourceTitle"
          name="sourceTitle"
          placeholder="Chapter 3 draft"
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="rawText">Pasted source text</label>
        <textarea
          id="rawText"
          name="rawText"
          placeholder="Paste chapter text, outline material, lore notes, or scene fragments here."
          rows={8}
          required
        />
      </div>

      <p className={styles.formNote}>
        This sprint starts with pasted text. File uploads, parsing, chunking, and embeddings
        come later.
      </p>

      <button
        className={styles.primaryAction}
        disabled={isPending || stories.length === 0}
        type="submit"
      >
        {isPending ? "Saving source..." : "Save source text"}
      </button>

      {state.message ? (
        <p
          className={
            state.status === "error" ? styles.errorMessage : styles.statusMessage
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}