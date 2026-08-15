"use client";

import { useEffect, useState } from "react";
import {
  createWebsiteReviewAction,
  getWebsiteReviewAction,
  regenerateWebsiteReviewTokenAction,
} from "@/lib/website-review/actions";
import {
  WEBSITE_REVIEW_STATUS_LABELS,
  formatReviewDateTime,
  getReviewWorkflowHint,
  type WebsiteReviewAdminView,
} from "@/lib/website-review/types";
import type { WebsiteRecordStatus } from "@/lib/domain";

type ClientReviewPanelProps = {
  websiteId: string;
  websiteStatus: WebsiteRecordStatus;
  open: boolean;
  onClose: () => void;
};

export function ClientReviewPanel({
  websiteId,
  websiteStatus,
  open,
  onClose,
}: ClientReviewPanelProps) {
  const [review, setReview] = useState<WebsiteReviewAdminView | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getWebsiteReviewAction(websiteId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setReview(null);
      } else {
        setReview(result.review);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, websiteId]);

  async function createLink() {
    setBusy(true);
    setError(null);
    const result = await createWebsiteReviewAction(websiteId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReview(result.review);
  }

  async function regenerateLink() {
    const confirmed = window.confirm(
      "Replace the current review link? The old link will stop working. Existing feedback and approval status will be kept.",
    );
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    const result = await regenerateWebsiteReviewTokenAction(websiteId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReview(result.review);
    setCopied(false);
  }

  async function copyLink(path: string) {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Could not copy the review link.");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close client review"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        aria-labelledby="client-review-heading"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2
              id="client-review-heading"
              className="text-base font-semibold text-foreground"
            >
              Client Review
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Share a token-based preview of the last saved draft. This is not
              publishing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-muted">Loading review status…</p>
          ) : error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : !review ? (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-muted">
                {getReviewWorkflowHint(websiteStatus, null)}
              </p>
              <button
                type="button"
                onClick={() => void createLink()}
                disabled={busy}
                className="inline-flex rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0] disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create Review Link"}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-muted">
                {getReviewWorkflowHint(websiteStatus, review.session.status)}
              </p>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                    Review status
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {WEBSITE_REVIEW_STATUS_LABELS[review.session.status]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                    Created
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {formatReviewDateTime(review.session.createdAt)}
                  </dd>
                </div>
                {review.session.approvedAt ? (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                      Approved
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatReviewDateTime(review.session.approvedAt)}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                    Review path
                  </dt>
                  <dd className="mt-1 break-all text-foreground">
                    {review.reviewPath}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                    Feedback
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {review.feedbackCount === 1
                      ? "1 request"
                      : `${review.feedbackCount} requests`}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink(review.reviewPath)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                >
                  {copied ? "Copied" : "Copy Review Link"}
                </button>
                <a
                  href={review.reviewPath}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                >
                  Open Review
                </a>
                <button
                  type="button"
                  onClick={() => void regenerateLink()}
                  disabled={busy}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground disabled:opacity-60"
                >
                  {busy ? "Updating…" : "Regenerate Review Link"}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Requested changes
                </h3>
                {review.feedback.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    No feedback yet.
                  </p>
                ) : (
                  <ol className="mt-3 space-y-3">
                    {review.feedback.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-border bg-background px-4 py-3"
                      >
                        <p className="text-xs text-muted">
                          {formatReviewDateTime(item.createdAt)}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {item.message}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
