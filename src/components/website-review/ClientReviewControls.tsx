"use client";

import { useActionState, useState } from "react";
import {
  approveReviewAction,
  submitReviewFeedbackAction,
  type ClientReviewActionResult,
} from "@/lib/website-review/public-actions";
import {
  REVIEW_FEEDBACK_MAX_LENGTH,
  formatReviewDateTime,
} from "@/lib/website-review/types";

type ClientReviewControlsProps = {
  token: string;
  approved: boolean;
  approvedAt: string | null;
};

export function ClientReviewControls({
  token,
  approved,
  approvedAt,
}: ClientReviewControlsProps) {
  const [isApproved, setIsApproved] = useState(approved);
  const [shownApprovedAt, setShownApprovedAt] = useState(approvedAt);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const [feedbackState, feedbackAction, feedbackPending] = useActionState(
    async (
      _previous: ClientReviewActionResult | null,
      formData: FormData,
    ): Promise<ClientReviewActionResult> => {
      return submitReviewFeedbackAction(token, formData);
    },
    null,
  );

  async function onApprove() {
    const confirmed = window.confirm(
      "Approving confirms that you are happy with this website draft. It does not publish the website.",
    );
    if (!confirmed) {
      return;
    }

    setApproving(true);
    setApproveError(null);
    const result = await approveReviewAction(token);
    setApproving(false);
    if (!result.ok) {
      setApproveError(result.error);
      return;
    }

    setIsApproved(true);
    setShownApprovedAt(result.approvedAt ?? new Date().toISOString());
  }

  return (
    <section
      id="review-actions"
      className="border-t border-slate-200 bg-[#f8f6f2] px-4 py-8 sm:px-6"
    >
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Request a change
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Describe anything you would like updated. This does not publish the
            website.
          </p>
          <form action={feedbackAction} className="mt-4 space-y-3">
            <label htmlFor="review-feedback" className="sr-only">
              Requested change
            </label>
            <textarea
              id="review-feedback"
              name="message"
              required
              maxLength={REVIEW_FEEDBACK_MAX_LENGTH}
              rows={5}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              placeholder="What would you like changed?"
            />
            <button
              type="submit"
              disabled={feedbackPending}
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {feedbackPending ? "Sending…" : "Submit"}
            </button>
          </form>
          {feedbackState?.ok && feedbackState.message ? (
            <p className="mt-3 text-sm text-emerald-800" role="status">
              {feedbackState.message}
            </p>
          ) : null}
          {feedbackState && !feedbackState.ok ? (
            <p className="mt-3 text-sm text-rose-800" role="alert">
              {feedbackState.error}
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Approve website
          </h2>
          {isApproved ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-900">Approved</p>
              {shownApprovedAt ? (
                <p className="mt-1 text-sm text-emerald-800">
                  {formatReviewDateTime(shownApprovedAt)}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                This confirms the draft. It does not publish the website.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Approving confirms that you are happy with this website draft.
                It does not publish the website.
              </p>
              <button
                type="button"
                onClick={() => void onApprove()}
                disabled={approving}
                className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {approving ? "Approving…" : "Approve Website"}
              </button>
              {approveError ? (
                <p className="mt-3 text-sm text-rose-800" role="alert">
                  {approveError}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
