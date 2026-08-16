import "server-only";
import { headers } from "next/headers";
import {
  LOGIN_LOCKOUT_SECONDS,
  LOGIN_MAX_FAILURES,
  LOGIN_WINDOW_SECONDS,
} from "@/lib/auth/constants";
import { bytesToBase64Url, hmacSha256 } from "@/lib/auth/encoding";
import { getDb } from "@/lib/db";

type ThrottleRow = {
  key_hash: string;
  failed_count: number;
  window_started_at: number;
  locked_until: number | null;
};

async function clientNetworkKey(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("cf-connecting-ip")
    || headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headerStore.get("x-real-ip")
    || "local";
  return forwarded.trim() || "local";
}

export async function throttleKeyHash(sessionSecret: string): Promise<string> {
  const material = await hmacSha256(
    sessionSecret,
    `login-throttle:${await clientNetworkKey()}`,
  );
  return bytesToBase64Url(material.subarray(0, 16));
}

export async function getLoginThrottleState(
  keyHash: string,
): Promise<{ locked: boolean; failedCount: number }> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(
      `SELECT key_hash, failed_count, window_started_at, locked_until
       FROM admin_auth_login_throttle
       WHERE key_hash = ?`,
    )
    .bind(keyHash)
    .first<ThrottleRow>();

  if (!row) {
    return { locked: false, failedCount: 0 };
  }

  if (row.locked_until && row.locked_until > now) {
    return { locked: true, failedCount: row.failed_count };
  }

  if (
    row.window_started_at + LOGIN_WINDOW_SECONDS <= now ||
    (row.locked_until && row.locked_until <= now)
  ) {
    await db
      .prepare(`DELETE FROM admin_auth_login_throttle WHERE key_hash = ?`)
      .bind(keyHash)
      .run();
    return { locked: false, failedCount: 0 };
  }

  return { locked: false, failedCount: row.failed_count };
}

export async function recordLoginFailure(keyHash: string): Promise<boolean> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const current = await getLoginThrottleState(keyHash);
  const failedCount = current.failedCount + 1;
  const lockedUntil =
    failedCount >= LOGIN_MAX_FAILURES ? now + LOGIN_LOCKOUT_SECONDS : null;

  await db
    .prepare(
      `INSERT INTO admin_auth_login_throttle (
         key_hash, failed_count, window_started_at, locked_until
       ) VALUES (?, ?, ?, ?)
       ON CONFLICT(key_hash) DO UPDATE SET
         failed_count = excluded.failed_count,
         window_started_at = CASE
           WHEN admin_auth_login_throttle.window_started_at + ${LOGIN_WINDOW_SECONDS} <= excluded.window_started_at
             THEN excluded.window_started_at
           ELSE admin_auth_login_throttle.window_started_at
         END,
         locked_until = excluded.locked_until`,
    )
    .bind(keyHash, failedCount, now, lockedUntil)
    .run();

  return lockedUntil !== null;
}

export async function clearLoginFailures(keyHash: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare(`DELETE FROM admin_auth_login_throttle WHERE key_hash = ?`)
    .bind(keyHash)
    .run();
}
