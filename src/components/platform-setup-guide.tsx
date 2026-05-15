import styles from "@/components/dashboard.module.css";
import {
  getAiProviderSummary,
  getPlatformSetupStatus,
  getRecommendedPlatformEnhancements,
} from "@/lib/platform/env";

const setupSections = [
  {
    id: "auth",
    title: "SSO and authentication",
    description:
      "Use Clerk for hosted sign-in, social providers, and enterprise SSO entry points.",
    variables: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    steps: [
      "Create or open your Clerk application.",
      "Enable the social or enterprise providers you want in Clerk.",
      "Set the publishable and secret keys in .env.local.",
      "If you want Supabase to trust Clerk session tokens directly later, connect Clerk to Supabase in both dashboards.",
    ],
  },
  {
    id: "database",
    title: "Database and storage",
    description:
      "Use Supabase for stories, source documents, and private file storage backing the workspace.",
    variables: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
    steps: [
      "Create or link a Supabase project.",
      "Apply the migrations in supabase/migrations to provision stories and source documents.",
      "Use either the newer publishable key or the legacy anon key for future session-aware browser access, and keep the service role key server-only.",
      "If you want Clerk-backed RLS later, enable the Clerk third-party auth integration in Supabase and configure Clerk session tokens accordingly.",
    ],
  },
  {
    id: "ai",
    title: "AI provider",
    description:
      "Use OpenAI or an OpenAI-compatible endpoint for storyboard generation, evaluation, and embeddings-backed retrieval.",
    variables: [
      "OPENAI_API_KEY",
      "OPENAI_BASE_URL",
      "OPENAI_STORYBOARD_MODEL",
      "OPENAI_EVALUATION_MODEL",
      "OPENAI_EMBEDDING_MODEL",
      "STORYBOARD_AI_PROVIDER_LABEL",
    ],
    steps: [
      "Choose OpenAI or an OpenAI-compatible provider that supports chat completions and embeddings.",
      "Set the API key and optional base URL in .env.local.",
      "Set separate models for storyboard generation, evaluation, and embeddings if you want to tune cost and quality independently.",
      "If AI is not configured or a provider call fails, the app falls back to deterministic generation, heuristic evaluation, and lexical retrieval.",
    ],
  },
] as const;

export function PlatformSetupGuide() {
  const status = getPlatformSetupStatus();
  const recommended = getRecommendedPlatformEnhancements();
  const aiSummary = getAiProviderSummary();

  return (
    <section className={styles.grid}>
      <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
        <p className={styles.eyebrow}>Activation guide</p>
        <h1>Provider setup</h1>
        <p className={styles.lede}>
          StoryBoard AI now has explicit setup hooks for Clerk SSO, Supabase-backed
          persistence, and an OpenAI-compatible model provider.
        </p>
      </div>

      {setupSections.map((section) => {
        const configured = status[section.id];

        return (
          <article className={styles.panel} key={section.id}>
            <div className={styles.sectionHeader}>
              <h2>{section.title}</h2>
              <span className={configured ? styles.statusOk : styles.statusBadge}>
                {configured ? "Configured" : "Needs setup"}
              </span>
            </div>
            <p className={styles.formNote}>{section.description}</p>
            <div className={styles.setupBlock}>
              <h3>Environment variables</h3>
              <ul className={styles.setupList}>
                {section.variables.map((variable) => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
            </div>
            <div className={styles.setupBlock}>
              <h3>Activation steps</h3>
              <ol className={styles.setupSteps}>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </article>
        );
      })}

      {recommended.length > 0 ? (
        <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
          <div className={styles.sectionHeader}>
            <h2>Recommended next activations</h2>
          </div>
          <ul className={styles.setupList}>
            {recommended.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {status.ai ? (
        <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
          <div className={styles.sectionHeader}>
            <h2>Active AI configuration</h2>
          </div>
          <ul className={styles.setupList}>
            <li>{`Provider: ${aiSummary.providerLabel}`}</li>
            <li>{`Storyboard model: ${aiSummary.storyboardModel || "Not configured"}`}</li>
            <li>{`Evaluation model: ${aiSummary.evaluationModel || "Not configured"}`}</li>
            <li>{`Embedding model: ${aiSummary.embeddingModel || "Not configured"}`}</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}