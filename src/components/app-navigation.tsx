"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DEFAULT_STORY_ID } from "@/lib/data/repository";
import type { Viewer } from "@/lib/auth/viewer";

import { SignOutButton } from "./sign-out-button";
import styles from "./app-navigation.module.css";

type AppNavigationProps = {
  viewerStatus: Viewer["status"];
};

type NavLink = {
  href: string;
  label: string;
};

function getNavLinks(viewerStatus: Viewer["status"]): NavLink[] {
  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: `/demo/${DEFAULT_STORY_ID}`, label: "Demo" },
    { href: "/setup", label: "Setup" },
  ];

  if (viewerStatus === "signed-in") {
    links.splice(1, 0, { href: "/dashboard", label: "Dashboard" });
  }

  return links;
}

export function AppNavigation({ viewerStatus }: AppNavigationProps) {
  const pathname = usePathname();
  const navLinks = getNavLinks(viewerStatus);

  return (
    <header className={styles.shell}>
      <div className={styles.bar}>
        <Link className={styles.brand} href="/">
          StoryBoard AI
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          {viewerStatus === "signed-in" ? (
            <>
              <Link className={styles.primaryAction} href="/dashboard">
                Open dashboard
              </Link>
              <SignOutButton className={styles.secondaryAction} />
            </>
          ) : viewerStatus === "signed-out" ? (
            <>
              <Link className={styles.secondaryAction} href="/sign-up">
                Sign up
              </Link>
              <Link className={styles.primaryAction} href="/sign-in">
                Sign in
              </Link>
            </>
          ) : (
            <Link className={styles.secondaryAction} href="/setup">
              Configure app
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}