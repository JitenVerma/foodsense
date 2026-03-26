"use client";

import Link from "next/link";

import { EmptyState } from "./EmptyState";

export function AuthRequiredState({
  title = "Sign in required",
  description = "Log in to view your saved meals and tracking history.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <EmptyState
        title={title}
        description={description}
        action={
          <Link
            href="/login"
            className="arcade-button-primary"
          >
            Go to login
          </Link>
        }
      />
    </main>
  );
}
