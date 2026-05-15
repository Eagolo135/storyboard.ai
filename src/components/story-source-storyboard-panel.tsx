"use client";

import { useState, useTransition } from "react";

import type { StoryRecord } from "@/lib/stories/schema";
import type { StoryboardResponse } from "@/lib/schemas/story";

import styles from "./dashboard.module.css";

const DEFAULT_SOURCE_REQUEST =
  "Plan the next scene using the attached story material and keep the storyboard grounded in retrieved evidence.";

type StorySourceStoryboardPanelProps = {
  story: StoryRecord;
};

export function StorySourceStoryboardPanel({ story }: StorySourceStoryboardPanelProps) {
  const [request, setRequest] = useState(DEFAULT_SOURCE_REQUEST);
  const [result, setResult] = useState<StoryboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function generateStoryboard() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request, storyId: story.id }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setResult(null);
        setError(payload.error ?? "Unable to generate storyboard.");
        return;
      }

      const payload = (await response.json()) as StoryboardResponse;
      setResult(payload);
    });
  }

  return (
    <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
      <div className={styles.sectionHeader}>
        <h2>Grounded storyboard</h2>
        <p>Generate from story-scoped source chunks instead of the curated demo library.</p>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="storyboard-request">Scene or chapter request</label>
        <textarea
          id="storyboard-request"
          onChange={(event) => setRequest(event.target.value)}
          rows={6}
          value={request}
        />
      </div>

      <div className={styles.heroActions}>
        <button className={styles.primaryAction} onClick={generateStoryboard} type="button">
          {isPending ? "Generating..." : "Generate storyboard"}
        </button>
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      {result ? (
        <div className={styles.storyboardPanelStack}>
          <div className={styles.storyboardResultGrid}>
            <div className={styles.storyboardCard}>
              <div className={styles.sectionHeader}>
                <h3>Retrieved context</h3>
                <p>{`${result.retrieval.provider} • ${result.retrieval.model}`}</p>
              </div>

              {result.retrieval.warning ? (
                <div className={styles.storyboardSummaryBlock}>
                  <p>{result.retrieval.warning}</p>
                </div>
              ) : null}

              <div className={styles.storyGrid}>
                {result.retrievedNotes.map((note) => (
                  <article className={styles.storyCard} key={note.id}>
                    <div className={styles.storyCardHeader}>
                      <div>
                        <h3>{note.title}</h3>
                        <p className={styles.metaRow}>{note.category.replace("-", " ")}</p>
                      </div>
                      <span className={styles.statusBadge}>{note.score.toFixed(1)}</span>
                    </div>
                    <p>{note.summary}</p>
                    <ul className={styles.setupList}>
                      {note.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.storyboardCard}>
              <div className={styles.sectionHeader}>
                <h3>Evaluation</h3>
                <p>{`${result.evaluationMeta.provider} • ${result.evaluationMeta.model}`}</p>
              </div>

              <div className={styles.metricGrid}>
                <div className={styles.metricTile}>
                  <span>Continuity</span>
                  <strong>{result.evaluation.continuityScore}</strong>
                </div>
                <div className={styles.metricTile}>
                  <span>Source alignment</span>
                  <strong>{result.evaluation.sourceAlignment}</strong>
                </div>
                <div className={styles.metricTile}>
                  <span>Hallucination risk</span>
                  <strong>{result.evaluation.hallucinationRisk.score}</strong>
                </div>
              </div>

              <div className={styles.storyboardSummaryBlock}>
                {result.evaluation.summary.map((item) => (
                  <p key={item}>{item}</p>
                ))}
                {result.generation.warning ? <p>{result.generation.warning}</p> : null}
                {result.evaluationMeta.warning ? <p>{result.evaluationMeta.warning}</p> : null}
              </div>
            </div>
          </div>

          <div className={styles.storyboardCard}>
            <div className={styles.sectionHeader}>
              <h3>Structured storyboard</h3>
              <p>{result.story.title}</p>
            </div>

            <div className={styles.storyboardSectionList}>
              <section>
                <h4>Scene goal</h4>
                <p>{result.storyboard.sections.sceneGoal}</p>
              </section>
              <section>
                <h4>Retrieved source context</h4>
                <ul className={styles.setupList}>
                  {result.storyboard.sections.retrievedSourceContext.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h4>Opening situation</h4>
                <p>{result.storyboard.sections.openingSituation}</p>
              </section>
              <section>
                <h4>Character motivation</h4>
                <p>{result.storyboard.sections.characterMotivation}</p>
              </section>
              <section>
                <h4>Key beats</h4>
                <ol className={styles.setupList}>
                  {result.storyboard.sections.keyBeats.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </section>
              <section>
                <h4>Conflict and tension</h4>
                <p>{result.storyboard.sections.conflictTension}</p>
              </section>
              <section>
                <h4>Internal thought direction</h4>
                <p>{result.storyboard.sections.internalThoughtDirection}</p>
              </section>
              <section>
                <h4>Continuity notes</h4>
                <ul className={styles.setupList}>
                  {result.storyboard.sections.continuityNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h4>Ending hook</h4>
                <p>{result.storyboard.sections.endingHook}</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}