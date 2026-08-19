import "server-only";
// Public review serving only. Do not import template renderers or
// review HTML generation from this module.
import { NextResponse } from "next/server";
import {
  approveReviewAction,
  submitReviewFeedbackAction,
} from "@/lib/website-review/public-actions";
import { getStoredClientReviewByToken } from "@/lib/website-review/repository";
import {
  REVIEW_APPROVE_DONE_END,
  REVIEW_APPROVE_DONE_START,
  REVIEW_APPROVE_OPEN_END,
  REVIEW_APPROVE_OPEN_START,
  REVIEW_APPROVED_AT_PLACEHOLDER,
  REVIEW_NOTICE_PLACEHOLDER,
  REVIEW_TOKEN_PLACEHOLDER,
} from "@/lib/website-review/review-html-placeholders";
import { REVIEW_UNAVAILABLE_HTML } from "@/lib/website-review/review-unavailable-html";
import { isReviewToken } from "@/lib/website-review/token";
import { formatReviewDateTime } from "@/lib/website-review/types";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-cache",
  "x-robots-tag": "noindex, nofollow",
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripBlock(html: string, start: string, end: string): string {
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    return html;
  }
  return html.slice(0, from) + html.slice(to + end.length);
}

function noticeHtml(notice: string | null): string {
  if (notice === "sent") {
    return `<p style="margin-top:12px;font-size:14px;color:#065f46;" role="status">Your feedback was sent.</p>`;
  }
  if (notice === "error") {
    return `<p style="margin-top:12px;font-size:14px;color:#9f1239;" role="alert">This review could not be updated.</p>`;
  }
  return "";
}

export function reviewUnavailableResponse(): Response {
  return new Response(REVIEW_UNAVAILABLE_HTML, {
    status: 404,
    headers: HTML_HEADERS,
  });
}

function applyReviewPlaceholders(
  storedHtml: string,
  token: string,
  approved: boolean,
  approvedAt: string | null,
  notice: string | null,
): string | null {
  let html = storedHtml.replaceAll(REVIEW_TOKEN_PLACEHOLDER, token);
  html = html.replaceAll(REVIEW_NOTICE_PLACEHOLDER, noticeHtml(notice));

  if (approved) {
    html = stripBlock(html, REVIEW_APPROVE_OPEN_START, REVIEW_APPROVE_OPEN_END);
    html = html
      .replaceAll(REVIEW_APPROVE_DONE_START, "")
      .replaceAll(REVIEW_APPROVE_DONE_END, "");
    html = html.replaceAll(
      REVIEW_APPROVED_AT_PLACEHOLDER,
      escapeHtml(approvedAt ? formatReviewDateTime(approvedAt) : ""),
    );
  } else {
    html = stripBlock(html, REVIEW_APPROVE_DONE_START, REVIEW_APPROVE_DONE_END);
    html = html
      .replaceAll(REVIEW_APPROVE_OPEN_START, "")
      .replaceAll(REVIEW_APPROVE_OPEN_END, "");
  }

  if (
    html.includes(REVIEW_TOKEN_PLACEHOLDER) ||
    html.includes(REVIEW_NOTICE_PLACEHOLDER) ||
    html.includes(REVIEW_APPROVED_AT_PLACEHOLDER) ||
    html.includes(REVIEW_APPROVE_OPEN_START) ||
    html.includes(REVIEW_APPROVE_DONE_START)
  ) {
    return null;
  }

  return html;
}

export async function serveClientReviewHtml(
  token: string,
  notice: string | null,
): Promise<Response> {
  if (!isReviewToken(token)) {
    return reviewUnavailableResponse();
  }

  const review = await getStoredClientReviewByToken(token);
  if (!review) {
    return reviewUnavailableResponse();
  }

  const html = applyReviewPlaceholders(
    review.reviewHtml,
    token,
    review.status === "APPROVED",
    review.approvedAt,
    notice === "sent" || notice === "error" ? notice : null,
  );
  if (!html) {
    return reviewUnavailableResponse();
  }

  return new Response(html, {
    status: 200,
    headers: HTML_HEADERS,
  });
}

export async function handleClientReviewPost(
  token: string,
  request: Request,
): Promise<Response> {
  if (!isReviewToken(token)) {
    return reviewUnavailableResponse();
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const reviewPath = new URL(`/review/${token}`, request.url);

  if (intent === "feedback") {
    const result = await submitReviewFeedbackAction(token, formData);
    reviewPath.searchParams.set("notice", result.ok ? "sent" : "error");
    return NextResponse.redirect(reviewPath, 303);
  }

  if (intent === "approve") {
    const result = await approveReviewAction(token);
    if (!result.ok) {
      reviewPath.searchParams.set("notice", "error");
    }
    return NextResponse.redirect(reviewPath, 303);
  }

  return reviewUnavailableResponse();
}
