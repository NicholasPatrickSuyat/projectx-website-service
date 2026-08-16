import type { WebsiteRecordStatus } from "@/lib/domain";
import type { WebsiteContent } from "@/lib/templates/types";

export const WEBSITE_REVIEW_STATUSES = ["OPEN", "APPROVED"] as const;
export type WebsiteReviewStatus = (typeof WEBSITE_REVIEW_STATUSES)[number];

export const WEBSITE_REVIEW_STATUS_LABELS: Record<WebsiteReviewStatus, string> =
  {
    OPEN: "Open",
    APPROVED: "Approved",
  };

export const REVIEW_FEEDBACK_MAX_LENGTH = 2000;
export const REVIEW_TOKEN_BYTES = 32;
export const REVIEW_TOKEN_PATTERN = /^[0-9a-f]{64}$/;
export const REVIEW_MEDIA_COOKIE = "pxws_review_media";
export const REVIEW_MEDIA_COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;

export type WebsiteReviewSession = {
  id: string;
  websiteId: string;
  token: string;
  status: WebsiteReviewStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
};

export type WebsiteReviewFeedback = {
  id: string;
  reviewSessionId: string;
  message: string;
  createdAt: string;
};

export type WebsiteReviewAdminView = {
  session: WebsiteReviewSession;
  reviewPath: string;
  feedbackCount: number;
  feedback: WebsiteReviewFeedback[];
};

export type ClientReviewPageData = {
  templateId: string;
  content: WebsiteContent;
  sessionStatus: WebsiteReviewStatus;
  approvedAt: string | null;
};

export type WebsiteReviewSessionRow = {
  id: string;
  website_id: string;
  token: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
};

export type WebsiteReviewFeedbackRow = {
  id: string;
  review_session_id: string;
  message: string;
  created_at: string;
};

export function mapWebsiteReviewSessionRow(
  row: WebsiteReviewSessionRow,
): WebsiteReviewSession {
  return {
    id: row.id,
    websiteId: row.website_id,
    token: row.token,
    status: row.status as WebsiteReviewStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
  };
}

export function mapWebsiteReviewFeedbackRow(
  row: WebsiteReviewFeedbackRow,
): WebsiteReviewFeedback {
  return {
    id: row.id,
    reviewSessionId: row.review_session_id,
    message: row.message,
    createdAt: row.created_at,
  };
}

export function getReviewPath(token: string) {
  return `/review/${token}`;
}

export function formatReviewDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${datePart} at ${timePart}`;
}

export function getReviewWorkflowHint(
  websiteStatus: WebsiteRecordStatus,
  reviewStatus: WebsiteReviewStatus | null,
): string {
  if (websiteStatus === "PUBLISHED") {
    return "Internal published snapshot. Public deployment is not configured yet. Client Review still shows the current saved draft.";
  }

  if (reviewStatus === "APPROVED" && websiteStatus === "DRAFT") {
    return "Client approved this review. The website remains Draft because it was not marked Ready for approval.";
  }

  if (websiteStatus === "DRAFT") {
    return "Review link available for draft review.";
  }

  if (websiteStatus === "READY_FOR_APPROVAL") {
    return "Ready for client approval.";
  }

  return "Client approval complete / internal publishing preparation.";
}
