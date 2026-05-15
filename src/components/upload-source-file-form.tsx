"use client";

import { useActionState } from "react";

import {
  createUploadedSourceAction,
  type CreateUploadedSourceActionState,
} from "@/app/dashboard/actions";

import styles from "./dashboard.module.css";

const INITIAL_STATE: CreateUploadedSourceActionState = {
  status: "idle",
};

type UploadSourceFileFormProps = {
  storyId: string;
};

export function UploadSourceFileForm({ storyId }: UploadSourceFileFormProps) {
  const [state, formAction, isPending] = useActionState(
    createUploadedSourceAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className={styles.createForm}>
      <input name="storyId" type="hidden" value={storyId} />

      <div className={styles.fieldGroup}>
        <label htmlFor="sourceFile">Upload PDF or DOCX</label>
        <input
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          id="sourceFile"
          name="sourceFile"
          required
          type="file"
        />
      </div>

      <p className={styles.formNote}>
        Uploaded files are stored and text is extracted server-side. Files larger than
        3000 KB are supported, up to a 10 MB request size.
      </p>

      <button className={styles.primaryAction} disabled={isPending} type="submit">
        {isPending ? "Uploading source..." : "Upload and extract"}
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