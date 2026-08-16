"use client";

import { useActionState } from "react";
import { loginAdminAction, type LoginActionState } from "@/lib/auth/actions";

type LoginFormProps = {
  nextPath: string;
};

const initialState: LoginActionState = null;

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <label className="block">
        <span className="text-sm font-medium text-foreground">Username</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          maxLength={64}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      {state?.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
