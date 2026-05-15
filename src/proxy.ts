import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkProxy = clerkMiddleware();
const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && process.env.CLERK_SECRET_KEY?.trim(),
);

export default hasClerkConfig ? clerkProxy : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)",
    "/(api|trpc)(.*)",
  ],
};