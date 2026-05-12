import styles from "@/components/dashboard.module.css";
import { isClerkConfigured } from "@/lib/platform/env";

export default async function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className={styles.pageShell}>
        <section className={styles.setupCard}>
          <p className={styles.eyebrow}>Auth setup required</p>
          <h2>Clerk is not configured yet</h2>
          <p>
            Add the Clerk environment variables from .env.example before using the
            hosted sign-up experience.
          </p>
        </section>
      </main>
    );
  }

  const { SignUp } = await import("@clerk/nextjs");

  return (
    <main className={styles.pageShell}>
      <SignUp />
    </main>
  );
}
