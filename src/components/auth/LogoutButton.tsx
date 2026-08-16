"use client";

import { logoutAdminAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <button
        type="submit"
        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-card sm:px-3 sm:text-sm"
      >
        Sign out
      </button>
    </form>
  );
}
