import "server-only";
import { cookies, headers } from "next/headers";
import {
  ADMIN_SESSION_TTL_SECONDS,
  getAdminSessionCookieName,
} from "@/lib/auth/constants";
import { getAdminAuthConfig } from "@/lib/auth/config";
import {
  createAdminSessionValue,
  readAdminSessionValue,
  type AdminSession,
} from "@/lib/auth/session-token";
import {
  clearCurrentAdminSession,
  getCurrentAdminSessionId,
  saveCurrentAdminSession,
} from "@/lib/auth/session-store";

export type { AdminSession };

async function isHttpsRequest(): Promise<boolean> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }

  const host = headerStore.get("host") || "";
  return !(
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  );
}

export async function getVerifiedAdminSession(): Promise<AdminSession | null> {
  const config = await getAdminAuthConfig();
  if (!config) {
    return null;
  }

  const store = await cookies();
  const parsed = await readAdminSessionValue(
    store.get(getAdminSessionCookieName())?.value,
    config.sessionSecret,
  );
  if (!parsed) {
    return null;
  }

  const currentId = await getCurrentAdminSessionId();
  if (!currentId || currentId !== parsed.sessionId) {
    return null;
  }

  return parsed;
}

export async function persistAdminSession(username: string): Promise<boolean> {
  const config = await getAdminAuthConfig();
  if (!config) {
    return false;
  }

  const sessionId = crypto.randomUUID();
  const expiresAt =
    Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  await saveCurrentAdminSession(sessionId, expiresAt);
  const value = await createAdminSessionValue(
    username,
    sessionId,
    config.sessionSecret,
  );
  const store = await cookies();
  store.set(getAdminSessionCookieName(), value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await isHttpsRequest(),
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  await clearCurrentAdminSession();
  const store = await cookies();
  store.set(getAdminSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await isHttpsRequest(),
    maxAge: 0,
  });
}
