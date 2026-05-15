import Link from "next/link";

import styles from "@/components/dashboard.module.css";
import { getViewer } from "@/lib/auth/viewer";
import {
  getMissingPlatformRequirements,
  getRecommendedPlatformEnhancements,
} from "@/lib/platform/env";

export default async function DashboardPage() {
  const viewer = await getViewer();

  if (viewer.status === "not-configured") {
    const missing = getMissingPlatformRequirements();
    const recommended = getRecommendedPlatformEnhancements();

    return (
      <main className={styles.pageShell}>
        <section className={styles.setupCard}>
          <p className={styles.eyebrow}>Sprint 007 in progress</p>
          <h2>Source intake is ready to activate</h2>
          <p>
            The dashboard now includes story creation and the first source-intake slice,
            but live auth and persistence still need provider credentials before this
            environment can sign users in or save data.
          </p>
          <ul className={styles.setupList}>
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {recommended.length > 0 ? (
            <ul className={styles.setupList}>
              {recommended.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
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
          <p className={styles.eyebrow}>Dashboard</p>
          <h2>Sign in to access your stories</h2>
          <p>
            StoryBoard AI is moving to a per-user workspace model. Sign in to create
            stories, upload source material, and eventually run authenticated RAG.
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

  const { SignedInDashboard } = await import("./signed-in-dashboard");

  return <SignedInDashboard userId={viewer.userId} />;
}
