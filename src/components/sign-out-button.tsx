"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

type SignOutButtonProps = {
  className: string;
  label?: string;
};

export function SignOutButton({ className, label = "Sign out" }: SignOutButtonProps) {
  return (
    <ClerkSignOutButton redirectUrl="/">
      <button className={className} type="button">
        {label}
      </button>
    </ClerkSignOutButton>
  );
}