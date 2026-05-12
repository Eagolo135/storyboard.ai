import { describe, expect, it } from "vitest";

import {
  getMissingPlatformRequirements,
  isClerkConfigured,
  isSupabaseConfigured,
} from "@/lib/platform/env";

describe("platform env", () => {
  it("detects missing configuration", () => {
    expect(
      getMissingPlatformRequirements({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
        CLERK_SECRET_KEY: "",
        NEXT_PUBLIC_SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      }),
    ).toHaveLength(2);
  });

  it("detects configured auth and database", () => {
    const env = {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
      CLERK_SECRET_KEY: "sk_test_123",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    };

    expect(isClerkConfigured(env)).toBe(true);
    expect(isSupabaseConfigured(env)).toBe(true);
  });
});
