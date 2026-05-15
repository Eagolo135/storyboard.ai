import { PlatformSetupGuide } from "@/components/platform-setup-guide";

export default function SetupPage() {
  console.log("[v0] Setup page - checking env vars:");
  console.log("[v0] OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
  console.log("[v0] OPENAI_STORYBOARD_MODEL:", process.env.OPENAI_STORYBOARD_MODEL || "NOT SET");
  console.log("[v0] CLERK_PUBLISHABLE:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "SET" : "NOT SET");
  console.log("[v0] CLERK_SECRET:", process.env.CLERK_SECRET_KEY ? "SET" : "NOT SET");
  console.log("[v0] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET");
  console.log("[v0] SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
  
  return (
    <main>
      <PlatformSetupGuide />
    </main>
  );
}
