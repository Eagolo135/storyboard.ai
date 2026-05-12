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
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
});

export type PlatformEnv = z.infer<typeof platformEnvSchema>;

export function getPlatformEnv(input: NodeJS.ProcessEnv = process.env): PlatformEnv {
  return platformEnvSchema.parse(input);
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
