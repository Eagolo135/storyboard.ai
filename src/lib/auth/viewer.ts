import { isClerkConfigured } from "@/lib/platform/env";

export type Viewer =
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string };

export async function getViewer(): Promise<Viewer> {
  if (!isClerkConfigured()) {
    return { status: "not-configured" };
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  if (!userId) {
    return { status: "signed-out" };
  }

  return {
    status: "signed-in",
    userId,
  };
}
