import Link from "next/link";
import { redirect } from "next/navigation";

import dashboardStyles from "@/components/dashboard.module.css";
import { getViewer } from "@/lib/auth/viewer";

export default async function Home() {
  const viewer = await getViewer();

  if (viewer.status === "signed-in") {
    redirect("/dashboard");
  }

  const primaryHref = "/sign-in";
  const primaryLabel = "Sign in to begin";

  return (
    <main className={dashboardStyles.pageShell}>
      <section className={dashboardStyles.landingHero}>
        <div className={dashboardStyles.landingHeroCopy}>
          <p className={dashboardStyles.eyebrow}>Cinematic story operating system</p>
          <h1>Build a story world that feels like a film already running in your head.</h1>
          <p className={dashboardStyles.landingLead}>
            StoryBoard AI is a cinematic planning space for novelists and visual storytellers
            who need more than a blank document. It gathers your lore, scene fragments,
            chapter notes, and source files into a single story workspace so every new beat
            carries the right atmosphere, continuity, and pressure.
          </p>
          <p className={dashboardStyles.landingSubcopy}>
            Sign in to enter your dashboard, create a story, and keep each world organized
            inside a private story library built for planning, continuity, and atmosphere.
          </p>
          <div className={dashboardStyles.landingActions}>
            <Link className={dashboardStyles.primaryAction} href={primaryHref}>
              {primaryLabel}
            </Link>
            {viewer.status === "not-configured" ? (
              <Link className={dashboardStyles.secondaryLink} href="/setup">
                Review setup
              </Link>
            ) : null}
          </div>
        </div>

        <div className={dashboardStyles.heroSceneCard}>
          <p className={dashboardStyles.sceneLabel}>What the space is for</p>
          <div className={dashboardStyles.sceneLine} />
          <p className={dashboardStyles.sceneText}>
            A harbor before dawn. A cathedral on the edge of collapse. A floodgate engine
            hall loud enough to swallow confession. StoryBoard AI helps you hold that kind of
            pressure on the page by keeping your story facts close when you plan the next move.
          </p>
          <div className={dashboardStyles.sceneStats}>
            <div>
              <strong>1.</strong>
              <span>Create a story workspace.</span>
            </div>
            <div>
              <strong>2.</strong>
              <span>Fill it with notes, drafts, and source files.</span>
            </div>
            <div>
              <strong>3.</strong>
              <span>Return to a story library that remembers what matters.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
