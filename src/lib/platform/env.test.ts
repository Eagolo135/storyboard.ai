import { describe, expect, it } from "vitest";

import {
  getAiEmbeddingConfig,
  getAiGenerationConfig,
  getAiEvaluationConfig,
  getAiProviderSummary,
  getMissingPlatformRequirements,
  getRecommendedPlatformEnhancements,
  getSupabasePublicKey,
  isClerkConfigured,
  isAiEmbeddingConfigured,
  isAiEvaluationConfigured,
  isAiConfigured,
  isSupabaseConfigured,
} from "@/lib/platform/env";

describe("platform env", () => {
  it("detects missing configuration", () => {
    const missingEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "test",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
      CLERK_SECRET_KEY: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    };
    const recommendedEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      OPENAI_API_KEY: "",
      OPENAI_STORYBOARD_MODEL: "",
    };

    expect(
      getMissingPlatformRequirements(missingEnv),
    ).toHaveLength(2);
    expect(getRecommendedPlatformEnhancements(recommendedEnv)).toHaveLength(2);
  });

  it("detects configured auth and database", () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: "test",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
      CLERK_SECRET_KEY: "sk_test_123",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      OPENAI_API_KEY: "openai-key",
      OPENAI_BASE_URL: "https://api.openai.com/v1",
      OPENAI_STORYBOARD_MODEL: "gpt-4.1-mini",
      OPENAI_EVALUATION_MODEL: "gpt-4.1-mini",
      OPENAI_EMBEDDING_MODEL: "text-embedding-3-small",
    };

    expect(isClerkConfigured(env)).toBe(true);
    expect(isSupabaseConfigured(env)).toBe(true);
    expect(isAiConfigured(env)).toBe(true);
    expect(isAiEvaluationConfigured(env)).toBe(true);
    expect(isAiEmbeddingConfigured(env)).toBe(true);
    expect(getAiGenerationConfig(env).providerLabel).toBe("OpenAI");
    expect(getAiEvaluationConfig(env).model).toBe("gpt-4.1-mini");
    expect(getAiEmbeddingConfig(env).model).toBe("text-embedding-3-small");
    expect(getAiProviderSummary(env).storyboardModel).toBe("gpt-4.1-mini");
    expect(getSupabasePublicKey(env)).toBe("anon-key");
  });
});
