import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal(""));

const optionalString = z.string().trim().optional().or(z.literal(""));

const platformEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalString,
  CLERK_SECRET_KEY: optionalString,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  OPENAI_API_KEY: optionalString,
  OPENAI_BASE_URL: optionalUrl,
  OPENAI_STORYBOARD_MODEL: optionalString,
  OPENAI_EVALUATION_MODEL: optionalString,
  OPENAI_EMBEDDING_MODEL: optionalString,
  STORYBOARD_AI_PROVIDER_LABEL: optionalString,
  STORYBOARD_AI_BASE_URL: optionalUrl,
  STORYBOARD_AI_API_KEY: optionalString,
  STORYBOARD_AI_MODEL: optionalString,
});

export type PlatformEnv = z.infer<typeof platformEnvSchema>;
export type PlatformSetupStatus = {
  auth: boolean;
  database: boolean;
  ai: boolean;
};

export type AiProviderConfig = {
  providerLabel: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};

function stripMatchingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeEnvInput(input: NodeJS.ProcessEnv) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string" ? stripMatchingQuotes(value) : value,
    ]),
  );
}

export function getPlatformEnv(input: NodeJS.ProcessEnv = process.env): PlatformEnv {
  return platformEnvSchema.parse(normalizeEnvInput(input));
}

export function isClerkConfigured(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return Boolean(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY,
  );
}

export function isSupabaseConfigured(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isAiConfigured(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return Boolean(
    (env.OPENAI_API_KEY && (env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL)) ||
      (env.STORYBOARD_AI_API_KEY && env.STORYBOARD_AI_MODEL),
  );
}

export function isAiEvaluationConfigured(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return Boolean(
    (env.OPENAI_API_KEY &&
      (env.OPENAI_EVALUATION_MODEL || env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL)) ||
      (env.STORYBOARD_AI_API_KEY && env.STORYBOARD_AI_MODEL),
  );
}

export function isAiEmbeddingConfigured(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return Boolean((env.OPENAI_API_KEY || env.STORYBOARD_AI_API_KEY) && getAiEmbeddingModel(env));
}

export function getPlatformSetupStatus(
  input: NodeJS.ProcessEnv = process.env,
): PlatformSetupStatus {
  return {
    auth: isClerkConfigured(input),
    database: isSupabaseConfigured(input),
    ai: isAiConfigured(input),
  };
}

export function getMissingPlatformRequirements(
  input: NodeJS.ProcessEnv = process.env,
) {
  const missing: string[] = [];

  if (!isClerkConfigured(input)) {
    missing.push("Clerk auth environment variables");
  }

  if (!isSupabaseConfigured(input)) {
    missing.push("Supabase database/storage environment variables");
  }

  return missing;
}

export function getRecommendedPlatformEnhancements(
  input: NodeJS.ProcessEnv = process.env,
) {
  const recommended: string[] = [];

  if (!isAiConfigured(input)) {
    recommended.push(
      "OpenAI or OpenAI-compatible environment variables for generation, evaluation, and embeddings",
    );
  }

  const env = getPlatformEnv(input);

  if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    recommended.push("Supabase publishable key for future client-side session-aware access");
  }

  return recommended;
}

function getAiBaseUrl(env: PlatformEnv) {
  return env.OPENAI_BASE_URL || env.STORYBOARD_AI_BASE_URL || "https://api.openai.com/v1";
}

function getAiApiKey(env: PlatformEnv) {
  return env.OPENAI_API_KEY || env.STORYBOARD_AI_API_KEY || "";
}

function getAiProviderLabel(env: PlatformEnv) {
  return env.STORYBOARD_AI_PROVIDER_LABEL || (env.OPENAI_API_KEY ? "OpenAI" : "OpenAI-compatible");
}

function getAiEmbeddingModel(env: PlatformEnv) {
  return env.OPENAI_EMBEDDING_MODEL || (getAiApiKey(env) ? "text-embedding-3-small" : "");
}

export function getSupabaseAdminConfig(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured.");
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getAiGenerationConfig(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);
  const apiKey = getAiApiKey(env);
  const model = env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL;

  if (!apiKey || !model) {
    throw new Error("AI generation is not configured.");
  }

  return {
    providerLabel: getAiProviderLabel(env),
    baseUrl: getAiBaseUrl(env),
    apiKey,
    model,
  } satisfies AiProviderConfig;
}

export function getAiEvaluationConfig(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);
  const apiKey = getAiApiKey(env);
  const model = env.OPENAI_EVALUATION_MODEL || env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL;

  if (!apiKey || !model) {
    throw new Error("AI evaluation is not configured.");
  }

  return {
    providerLabel: getAiProviderLabel(env),
    baseUrl: getAiBaseUrl(env),
    apiKey,
    model,
  } satisfies AiProviderConfig;
}

export function getAiEmbeddingConfig(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);
  const apiKey = getAiApiKey(env);
  const model = getAiEmbeddingModel(env);

  if (!apiKey || !model) {
    throw new Error("AI embeddings are not configured.");
  }

  return {
    providerLabel: getAiProviderLabel(env),
    baseUrl: getAiBaseUrl(env),
    apiKey,
    model,
  } satisfies AiProviderConfig;
}

export function getAiProviderSummary(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return {
    providerLabel: getAiProviderLabel(env),
    baseUrl: getAiBaseUrl(env),
    storyboardModel: env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL || "",
    evaluationModel:
      env.OPENAI_EVALUATION_MODEL || env.OPENAI_STORYBOARD_MODEL || env.STORYBOARD_AI_MODEL || "",
    embeddingModel: getAiEmbeddingModel(env),
  };
}

export function getSupabasePublicKey(input: NodeJS.ProcessEnv = process.env) {
  const env = getPlatformEnv(input);

  return env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}
