import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { AppAuthProvider } from "@/components/app-auth-provider";
import { AppNavigation } from "@/components/app-navigation";
import { getViewer } from "@/lib/auth/viewer";

import "./globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "StoryBoard AI",
  description:
    "A source-grounded storyboarding platform for long-form fiction planning.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <AppAuthProvider>
          <AppNavigation viewerStatus={viewer.status} />
          {children}
        </AppAuthProvider>
      </body>
    </html>
  );
}
