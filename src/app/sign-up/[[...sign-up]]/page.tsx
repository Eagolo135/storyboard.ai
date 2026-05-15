import Link from "next/link";
import { redirect } from "next/navigation";

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
          <Link className={styles.secondaryLink} href="/setup">
            Open setup guide
          </Link>
        </section>
      </main>
    );
  }

  redirect("/sign-in");
}
