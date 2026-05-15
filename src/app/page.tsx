import Link from "next/link";
import { redirect } from "next/navigation";

import { getViewer } from "@/lib/auth/viewer";
import styles from "./page.module.css";

export default async function Home() {
  const viewer = await getViewer();

  if (viewer.status === "signed-in") {
    redirect("/dashboard");
  }

  const primaryHref = "/sign-in";
  const primaryLabel = "Sign in to begin";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Cinematic story operating system</p>
          <h1 className={styles.heroTitle}>
            Build a story world that feels like a film already running in your head.
          </h1>
          <p className={styles.heroLead}>
            StoryBoard AI is a cinematic planning space for novelists and visual storytellers
            who need more than a blank document. It gathers your lore, scene fragments,
            chapter notes, and source files into a single story workspace so every new beat
            carries the right atmosphere, continuity, and pressure.
          </p>
          <p className={styles.heroSubcopy}>
            Sign in to enter your dashboard, create a story, and keep each world organized
            inside a private story library built for planning, continuity, and atmosphere.
          </p>

          <div className={styles.actionRow}>
            <Link className={styles.primaryAction} href={primaryHref}>
              {primaryLabel}
            </Link>
            {viewer.status === "not-configured" ? (
              <Link className={styles.secondaryAction} href="/setup">
                Review setup
              </Link>
            ) : null}
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaCard}>
              <strong>Source-grounded</strong>
              <span>Keep uploads, notes, and retrieval tied to the story they belong to.</span>
            </div>
            <div className={styles.heroMetaCard}>
              <strong>Private library</strong>
              <span>Organize each world inside its own workspace instead of one global dump.</span>
            </div>
            <div className={styles.heroMetaCard}>
              <strong>Cinematic beats</strong>
              <span>Generate scene structure with continuity pressure, atmosphere, and stakes intact.</span>
            </div>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelLabel}>What the space is for</p>
            <h2 className={styles.panelTitle}>Planning pressure without losing the plot.</h2>
            <p className={styles.panelLead}>
              StoryBoard AI works best when your material is messy, partial, and alive. Draft
              fragments, world notes, PDFs, and scene ideas stay close enough to shape the next
              beat instead of disappearing into folder sprawl.
            </p>
          </div>

          <div className={styles.signalGrid}>
            <div className={styles.signalCard}>
              <p className={styles.signalLabel}>Signal 01</p>
              <strong>One story, one context window</strong>
              <p>Uploads and notes stay scoped to the story you are actively shaping.</p>
            </div>
            <div className={styles.signalCard}>
              <p className={styles.signalLabel}>Signal 02</p>
              <strong>Retrieval that stays grounded</strong>
              <p>Generated storyboard beats are built from the source material closest to the ask.</p>
            </div>
            <div className={styles.signalCard}>
              <p className={styles.signalLabel}>Signal 03</p>
              <strong>Continuity before improvisation</strong>
              <p>Pressure, tone, and factual consistency survive from one planning session to the next.</p>
            </div>
          </div>

          <div className={styles.quotePanel}>
            <blockquote>
              “A harbor before dawn. A cathedral on the edge of collapse. A floodgate engine hall
              loud enough to swallow confession.”
            </blockquote>
            <p>
              This is the level of scene pressure the workspace is built to preserve while you plan.
            </p>
          </div>
        </aside>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>What changes</p>
          <h2 className={styles.sectionTitle}>The site should feel like a story desk, not a form stack.</h2>
          <p className={styles.sectionLead}>
            The product is strongest when the interface makes story pressure legible. These are the
            three operating moves the workspace is designed around.
          </p>
        </header>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <h3>Gather the world</h3>
            <p>
              Bring in chapter notes, pasted excerpts, and source files so the planning surface
              starts from what already exists instead of pretending everything lives in your head.
            </p>
            <div className={styles.featureList}>
              <span>Story-scoped source uploads</span>
              <span>Private dashboard workspaces</span>
              <span>Context that survives between sessions</span>
            </div>
          </article>

          <article className={styles.featureCard}>
            <h3>Interrogate the scene</h3>
            <p>
              Ask for the next beat, the next pressure shift, or the next reveal, and keep the
              returned answer grounded in the material that supports it.
            </p>
            <div className={styles.featureList}>
              <span>Grounded retrieval over source chunks</span>
              <span>AI-backed storyboard generation</span>
              <span>Evaluation metadata for every response</span>
            </div>
          </article>

          <article className={styles.featureCard}>
            <h3>Return without drift</h3>
            <p>
              Come back days later and still recover the tone, pressure, and factual edges that
              make the story feel coherent instead of re-deriving it from scratch.
            </p>
            <div className={styles.featureList}>
              <span>Story libraries organized by owner</span>
              <span>Embedded source refresh without duplicate sprawl</span>
              <span>Markdown export for storyboards</span>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Workflow</p>
          <h2 className={styles.sectionTitle}>Three moves, one consistent loop.</h2>
        </header>

        <div className={styles.stepsGrid}>
          <article className={styles.stepCard}>
            <p className={styles.stepNumber}>Step 01</p>
            <h3>Create a story workspace</h3>
            <p>
              Start from the dashboard and keep each project in its own private planning lane.
            </p>
          </article>

          <article className={styles.stepCard}>
            <p className={styles.stepNumber}>Step 02</p>
            <h3>Load the evidence</h3>
            <p>
              Add source text, drafts, PDFs, and notes so retrieval has something real to anchor to.
            </p>
          </article>

          <article className={styles.stepCard}>
            <p className={styles.stepNumber}>Step 03</p>
            <h3>Plan the next move</h3>
            <p>
              Generate a storyboard response, inspect the grounding, and keep iterating from there.
            </p>
          </article>
        </div>

        <div className={styles.ctaBand}>
          <div className={styles.ctaBody}>
            <p className={styles.sectionEyebrow}>Ready when you are</p>
            <h2 className={styles.ctaTitle}>Open the story desk and make the next beat legible.</h2>
            <p className={styles.ctaText}>
              The dashboard is where the real workflow lives. The setup page remains available if
              you need to verify providers or local configuration first.
            </p>
          </div>

          <div className={styles.actionRow}>
            <Link className={styles.primaryAction} href={primaryHref}>
              {primaryLabel}
            </Link>
            <Link className={styles.secondaryAction} href="/demo/glass-archive">
              View demo story
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
