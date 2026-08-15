import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/lib/db";
import { createReviewToken, isReviewToken } from "@/lib/website-review/token";
import {
  getReviewPath,
  mapWebsiteReviewFeedbackRow,
  mapWebsiteReviewSessionRow,
  type WebsiteReviewAdminView,
  type WebsiteReviewFeedback,
  type WebsiteReviewFeedbackRow,
  type WebsiteReviewSession,
  type WebsiteReviewSessionRow,
} from "@/lib/website-review/types";
import { isWebsiteId } from "@/lib/websites/validation";

const SESSION_COLUMNS = `
  id,
  website_id,
  token,
  status,
  created_at,
  updated_at,
  approved_at
`;

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique/i.test(message);
}

function toAdminView(
  session: WebsiteReviewSession,
  feedback: WebsiteReviewFeedback[],
): WebsiteReviewAdminView {
  return {
    session,
    reviewPath: getReviewPath(session.token),
    feedbackCount: feedback.length,
    feedback,
  };
}

export async function getReviewSessionByWebsiteId(
  websiteId: string,
): Promise<WebsiteReviewSession | null> {
  if (!isWebsiteId(websiteId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${SESSION_COLUMNS} FROM website_review_sessions WHERE website_id = ?`,
    )
    .bind(websiteId)
    .first<WebsiteReviewSessionRow>();

  return row ? mapWebsiteReviewSessionRow(row) : null;
}

export async function getReviewSessionByToken(
  token: string,
): Promise<WebsiteReviewSession | null> {
  if (!isReviewToken(token)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${SESSION_COLUMNS} FROM website_review_sessions WHERE token = ?`,
    )
    .bind(token)
    .first<WebsiteReviewSessionRow>();

  return row ? mapWebsiteReviewSessionRow(row) : null;
}

export async function listReviewFeedback(
  reviewSessionId: string,
): Promise<WebsiteReviewFeedback[]> {
  if (!isWebsiteId(reviewSessionId)) {
    return [];
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT id, review_session_id, message, created_at
       FROM website_review_feedback
       WHERE review_session_id = ?
       ORDER BY created_at DESC, id DESC`,
    )
    .bind(reviewSessionId)
    .all<WebsiteReviewFeedbackRow>();

  return (result.results ?? []).map(mapWebsiteReviewFeedbackRow);
}

export async function getReviewAdminView(
  websiteId: string,
): Promise<WebsiteReviewAdminView | null> {
  const session = await getReviewSessionByWebsiteId(websiteId);
  if (!session) {
    return null;
  }

  const feedback = await listReviewFeedback(session.id);
  return toAdminView(session, feedback);
}

async function insertReviewSession(
  websiteId: string,
): Promise<WebsiteReviewSession> {
  const db = await getDb();
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = crypto.randomUUID();
    const token = createReviewToken();

    try {
      await db
        .prepare(
          `INSERT INTO website_review_sessions (
            id,
            website_id,
            token,
            status,
            created_at,
            updated_at,
            approved_at
          ) VALUES (?, ?, ?, 'OPEN', ?, ?, NULL)`,
        )
        .bind(id, websiteId, token, now, now)
        .run();

      const created = await getReviewSessionByWebsiteId(websiteId);
      if (!created) {
        throw new Error("Review session was created but could not be loaded.");
      }
      return created;
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < 4) {
        const existing = await getReviewSessionByWebsiteId(websiteId);
        if (existing) {
          return existing;
        }
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not create a review link.");
}

export async function getOrCreateReviewSession(
  websiteId: string,
): Promise<WebsiteReviewAdminView> {
  const existing = await getReviewAdminView(websiteId);
  if (existing) {
    return existing;
  }

  const session = await insertReviewSession(websiteId);
  return toAdminView(session, []);
}

export async function regenerateReviewToken(
  websiteId: string,
): Promise<WebsiteReviewAdminView | null> {
  const existing = await getReviewSessionByWebsiteId(websiteId);
  if (!existing) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = createReviewToken();
    try {
      await db
        .prepare(
          `UPDATE website_review_sessions
           SET token = ?, updated_at = ?
           WHERE website_id = ?`,
        )
        .bind(token, now, websiteId)
        .run();

      return getReviewAdminView(websiteId);
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < 4) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not regenerate the review link.");
}

export async function addReviewFeedback(
  reviewSessionId: string,
  message: string,
): Promise<WebsiteReviewFeedback> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO website_review_feedback (
        id,
        review_session_id,
        message,
        created_at
      ) VALUES (?, ?, ?, ?)`,
    )
    .bind(id, reviewSessionId, message, now)
    .run();

  return {
    id,
    reviewSessionId,
    message,
    createdAt: now,
  };
}

export function prepareReopenApprovedReviewSession(
  db: D1Database,
  websiteId: string,
  updatedAt: string,
) {
  return db
    .prepare(
      `UPDATE website_review_sessions
       SET status = 'OPEN',
           approved_at = NULL,
           updated_at = ?
       WHERE website_id = ? AND status = 'APPROVED'`,
    )
    .bind(updatedAt, websiteId);
}

export async function markReviewSessionApproved(
  sessionId: string,
  approvedAt: string,
): Promise<WebsiteReviewSession | null> {
  const db = await getDb();

  await db
    .prepare(
      `UPDATE website_review_sessions
       SET status = 'APPROVED',
           approved_at = COALESCE(approved_at, ?),
           updated_at = ?
       WHERE id = ?`,
    )
    .bind(approvedAt, approvedAt, sessionId)
    .run();

  const row = await db
    .prepare(`SELECT ${SESSION_COLUMNS} FROM website_review_sessions WHERE id = ?`)
    .bind(sessionId)
    .first<WebsiteReviewSessionRow>();

  return row ? mapWebsiteReviewSessionRow(row) : null;
}
