import { ClerkProvider } from "@clerk/nextjs";

import { isClerkConfigured } from "@/lib/platform/env";

type AppAuthProviderProps = {
  children: React.ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  if (!isClerkConfigured()) {
    return children;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
