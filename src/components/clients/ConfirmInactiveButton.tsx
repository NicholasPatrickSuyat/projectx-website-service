"use client";

import { useState } from "react";

type ConfirmInactiveButtonProps = {
  action: () => Promise<unknown>;
};

export function ConfirmInactiveButton({ action }: ConfirmInactiveButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
      >
        Mark inactive
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm text-muted">Mark this client inactive?</p>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await action();
        }}
        className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-70"
      >
        {pending ? "Updating…" : "Confirm inactive"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
