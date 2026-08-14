"use client";

import { useState, type ReactNode } from "react";

type RepeatableCardProps = {
  title: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
  disableRemove?: boolean;
};

export function RepeatableCard({
  title,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
  disableRemove,
}: RepeatableCardProps) {
  const [confirming, setConfirming] = useState(false);
  const itemLabel = title.trim() || `Item ${index + 1}`;

  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{itemLabel}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move ${itemLabel} up`}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Move up
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label={`Move ${itemLabel} down`}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Move down
          </button>
          {confirming ? (
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onRemove();
              }}
              aria-label={`Confirm delete ${itemLabel}`}
              className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white"
            >
              Confirm delete
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={disableRemove}
              aria-label={`Delete ${itemLabel}`}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-4">{children}</div>
    </article>
  );
}
