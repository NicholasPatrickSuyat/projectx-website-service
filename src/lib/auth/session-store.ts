import "server-only";
import { getDb } from "@/lib/db";

const CURRENT_ID = "current";

type AdminSessionRow = {
  session_id: string;
  expires_at: number;
};

export async function saveCurrentAdminSession(
  sessionId: string,
  expiresAt: number,
): Promise<void> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO admin_auth_session (id, session_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         session_id = excluded.session_id,
         expires_at = excluded.expires_at,
         created_at = excluded.created_at`,
    )
    .bind(CURRENT_ID, sessionId, expiresAt, now)
    .run();
}

export async function getCurrentAdminSessionId(): Promise<string | null> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT session_id, expires_at
       FROM admin_auth_session
       WHERE id = ?`,
    )
    .bind(CURRENT_ID)
    .first<AdminSessionRow>();

  if (!row) {
    return null;
  }

  if (row.expires_at <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return row.session_id;
}

export async function clearCurrentAdminSession(): Promise<void> {
  const db = await getDb();
  await db
    .prepare(`DELETE FROM admin_auth_session WHERE id = ?`)
    .bind(CURRENT_ID)
    .run();
}
