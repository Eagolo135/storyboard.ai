"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import type { StoryKnowledgeBase, StoryboardResponse } from "@/lib/schemas/story";

import { SignOutButton } from "./sign-out-button";
import styles from "./storyboard-workspace.module.css";

const DEFAULT_SAMPLE_REQUESTS = [
  "Draft a chapter 8 confrontation where Mara corners Ilyan inside the Floodgate Engine Hall after decoding the falsified founder ledger.",
  "Plan a scene that continues directly after chapter 7 and tests whether Mara can trust Ilyan long enough to prevent a floodgate collapse.",
  "Generate a storyboard for a rain-soaked chapter 8 scene that balances lore pressure, sibling tension, and the established close-third style.",
];

type StoryboardWorkspaceProps = {
  knowledgeBase: StoryKnowledgeBase;
  storyId?: string;
  sampleRequests?: string[];
};

export function StoryboardWorkspace({
  knowledgeBase,
  storyId,
  sampleRequests = DEFAULT_SAMPLE_REQUESTS,
}: StoryboardWorkspaceProps) {
  const [request, setRequest] = useState(sampleRequests[0] ?? DEFAULT_SAMPLE_REQUESTS[0]);
  const [result, setResult] = useState<StoryboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const notesByCategory = knowledgeBase.notes.reduce<Record<string, StoryKnowledgeBase["notes"]>>(
    (groups, note) => {
      groups[note.category] = [...(groups[note.category] ?? []), note];
      return groups;
    },
    {},
  );

  async function generateStoryboard() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request, storyId }),
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

  async function copyMarkdown() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.markdown);
  }

  function exportMarkdown() {
    if (!result) {
      return;
    }

    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "storyboard-ai-export.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Applied AI prototype</p>
          <h1>StoryBoard AI</h1>
          <p className={styles.heroCopy}>
            A source-grounded storyboarding workspace for writers managing lore,
            character arcs, world rules, and style constraints across long-form fiction.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.secondaryButton} href="/dashboard">
              Back to dashboard
            </Link>
            <SignOutButton className={styles.secondaryButton} />
          </div>
        </div>
        <div className={styles.storyMetaCard}>
          <p className={styles.storyTitle}>{knowledgeBase.story.title}</p>
          <p>{knowledgeBase.story.premise}</p>
          <div className={styles.genreRow}>
            {knowledgeBase.story.genre.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.workspaceGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Knowledge base</h2>
              <p>{knowledgeBase.notes.length} curated notes</p>
            </div>
            <div className={styles.noteGroups}>
              {Object.entries(notesByCategory).map(([category, notes]) => (
                <div className={styles.noteGroup} key={category}>
                  <h3>{category.replace("-", " ")}</h3>
                  {notes.map((note) => (
                    <article className={styles.noteCard} key={note.id}>
                      <div className={styles.noteHeading}>
                        <strong>{note.title}</strong>
                        <span>P{note.priority}</span>
                      </div>
                      <p>{note.summary}</p>
                      <div className={styles.tagRow}>
                        {note.tags.slice(0, 4).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.mainColumn}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Scene or chapter request</h2>
              <p>Retrieve grounded context before outlining the storyboard.</p>
            </div>
            <div className={styles.promptRow}>
              {sampleRequests.map((sampleRequest) => (
                <button
                  className={styles.promptChip}
                  key={sampleRequest}
                  onClick={() => setRequest(sampleRequest)}
                  type="button"
                >
                  Use sample
                </button>
              ))}
            </div>
            <textarea
              className={styles.requestInput}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="Describe the scene or chapter you want to plan."
              rows={6}
              value={request}
            />
            <div className={styles.actions}>
              <button className={styles.primaryButton} onClick={generateStoryboard} type="button">
                {isPending ? "Generating..." : "Generate storyboard"}
              </button>
              {result ? (
                <>
                  <button className={styles.secondaryButton} onClick={copyMarkdown} type="button">
                    Copy Markdown
                  </button>
                  <button className={styles.secondaryButton} onClick={exportMarkdown} type="button">
                    Export Markdown
                  </button>
                </>
              ) : null}
            </div>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </div>

          {result ? (
            <>
              <div className={styles.resultsGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Retrieved context</h2>
                    <p>{`${result.retrieval.provider} • ${result.retrieval.model}`}</p>
                  </div>
                  {result.retrieval.warning ? (
                    <div className={styles.warningBox}>
                      <p>{result.retrieval.warning}</p>
                    </div>
                  ) : null}
                  <div className={styles.retrievedList}>
                    {result.retrievedNotes.map((note) => (
                      <article className={styles.retrievedCard} key={note.id}>
                        <div className={styles.noteHeading}>
                          <strong>{note.title}</strong>
                          <span>{note.score.toFixed(1)}</span>
                        </div>
                        <p>{note.summary}</p>
                        <ul className={styles.reasonList}>
                          {note.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                        <div className={styles.breakdownGrid}>
                          {Object.entries(note.breakdown)
                            .filter(([key]) => key !== "total")
                            .map(([key, value]) => (
                              <div className={styles.breakdownItem} key={key}>
                                <span>{key}</span>
                                <strong>{value}</strong>
                              </div>
                            ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Evaluation</h2>
                    <p>{`${result.evaluationMeta.provider} • ${result.evaluationMeta.model}`}</p>
                  </div>
                  <div className={styles.metricGrid}>
                    <div className={styles.metricCard}>
                      <span>Continuity score</span>
                      <strong>{result.evaluation.continuityScore}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Source alignment</span>
                      <strong>{result.evaluation.sourceAlignment}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Character consistency</span>
                      <strong>{result.evaluation.characterConsistency}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Worldbuilding consistency</span>
                      <strong>{result.evaluation.worldbuildingConsistency}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Tone fit</span>
                      <strong>{result.evaluation.toneFit}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Style match</span>
                      <strong>{result.evaluation.styleMatch}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Scene clarity</span>
                      <strong>{result.evaluation.sceneClarity}</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Hallucination risk</span>
                      <strong>{result.evaluation.hallucinationRisk.score}</strong>
                    </div>
                  </div>
                  <div className={styles.warningBox}>
                    <p>
                      Risk level: <strong>{result.evaluation.hallucinationRisk.level}</strong>
                    </p>
                    {result.evaluation.summary.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                    {result.evaluationMeta.warning ? <p>{result.evaluationMeta.warning}</p> : null}
                    {result.evaluation.hallucinationRisk.unsupportedEntities.map((item) => (
                      <p key={item}>Unsupported entity: {item}</p>
                    ))}
                    {result.evaluation.hallucinationRisk.genericProseWarnings.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Structured storyboard</h2>
                  <p>
                    Built from retrieved notes and shaped for long-form planning.
                    {` ${result.generation.provider} • ${result.generation.model}`}
                  </p>
                </div>
                {result.generation.warning ? (
                  <div className={styles.warningBox}>
                    <p>{result.generation.warning}</p>
                  </div>
                ) : null}
                <div className={styles.storyboardSections}>
                  <section>
                    <h3>Scene goal</h3>
                    <p>{result.storyboard.sections.sceneGoal}</p>
                  </section>
                  <section>
                    <h3>Retrieved source context</h3>
                    <ul className={styles.reasonList}>
                      {result.storyboard.sections.retrievedSourceContext.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3>Opening situation</h3>
                    <p>{result.storyboard.sections.openingSituation}</p>
                  </section>
                  <section>
                    <h3>Character motivation</h3>
                    <p>{result.storyboard.sections.characterMotivation}</p>
                  </section>
                  <section>
                    <h3>Key beats</h3>
                    <ol className={styles.beatList}>
                      {result.storyboard.sections.keyBeats.map((beat) => (
                        <li key={beat}>{beat}</li>
                      ))}
                    </ol>
                  </section>
                  <section>
                    <h3>Conflict/tension</h3>
                    <p>{result.storyboard.sections.conflictTension}</p>
                  </section>
                  <section>
                    <h3>Internal thought direction</h3>
                    <p>{result.storyboard.sections.internalThoughtDirection}</p>
                  </section>
                  <section>
                    <h3>Continuity notes</h3>
                    <ul className={styles.reasonList}>
                      {result.storyboard.sections.continuityNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3>Ending hook</h3>
                    <p>{result.storyboard.sections.endingHook}</p>
                  </section>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}