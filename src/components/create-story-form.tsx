"use client";

import { useActionState } from "react";

import {
  createStoryAction,
  type CreateStoryActionState,
} from "@/app/dashboard/actions";

import styles from "./dashboard.module.css";

const INITIAL_STATE: CreateStoryActionState = {
  status: "idle",
};

export function CreateStoryForm() {
  const [state, formAction, isPending] = useActionState(
    createStoryAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className={styles.createForm}>
      <div className={styles.fieldGroup}>
        <label htmlFor="title">Story title</label>
        <input id="title" name="title" placeholder="Ashes of Orendale" required />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="summary">Short summary</label>
        <textarea
          id="summary"
          name="summary"
          placeholder="A floodgate conspiracy unraveling inside a memory-fed city."
          rows={4}
        />
      </div>

      <button className={styles.primaryAction} disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Create story"}
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
