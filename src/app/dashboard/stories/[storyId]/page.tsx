import Link from "next/link";

import styles from "@/components/dashboard.module.css";
import { getViewer } from "@/lib/auth/viewer";
import { getMissingPlatformRequirements } from "@/lib/platform/env";

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
          <Link className={styles.secondaryLink} href="/setup">
            Open setup guide
          </Link>
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
          <Link className={styles.secondaryLink} href="/setup">
            Review setup
          </Link>
        </section>
      </main>
    );
  }

  const { SignedInStoryWorkspace } = await import("./signed-in-story-workspace");

  return <SignedInStoryWorkspace storyId={storyId} userId={viewer.userId} />;
}