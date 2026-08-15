import {
  REVIEW_FEEDBACK_MAX_LENGTH,
  WEBSITE_REVIEW_STATUSES,
  type WebsiteReviewStatus,
} from "@/lib/website-review/types";

export function isWebsiteReviewStatus(
  value: string,
): value is WebsiteReviewStatus {
  return WEBSITE_REVIEW_STATUSES.includes(value as WebsiteReviewStatus);
}

export type FeedbackValidationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export function validateReviewFeedbackMessage(
  value: unknown,
): FeedbackValidationResult {
  if (typeof value !== "string") {
    return { ok: false, error: "Enter the change you would like to request." };
  }

  const message = value.trim();
  if (!message) {
    return { ok: false, error: "Enter the change you would like to request." };
  }

  if (message.length > REVIEW_FEEDBACK_MAX_LENGTH) {
    return {
      ok: false,
      error: `Keep feedback to ${REVIEW_FEEDBACK_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, message };
}
