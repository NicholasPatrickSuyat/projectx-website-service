"use server";

import { redirect } from "next/navigation";
import {
  INVALID_CREDENTIALS_ERROR,
  LOGIN_THROTTLED_ERROR,
  SIGN_IN_UNAVAILABLE_ERROR,
} from "@/lib/auth/constants";
import {
  getAdminAuthConfig,
  normalizePassword,
  normalizeUsername,
} from "@/lib/auth/config";
import { timingSafeEqualString } from "@/lib/auth/encoding";
import { isSafeInternalNextPath } from "@/lib/auth/paths";
import { verifyPassword } from "@/lib/auth/password";
import {
  clearAdminSession,
  getVerifiedAdminSession,
  persistAdminSession,
} from "@/lib/auth/session";
import {
  clearLoginFailures,
  getLoginThrottleState,
  recordLoginFailure,
  throttleKeyHash,
} from "@/lib/auth/throttle";

export type LoginActionState = {
  error?: string;
} | null;

export async function loginAdminAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const existing = await getVerifiedAdminSession();
  if (existing) {
    const nextPath = String(formData.get("next") || "");
    redirect(isSafeInternalNextPath(nextPath) ? nextPath : "/");
  }

  const config = await getAdminAuthConfig();
  const username = normalizeUsername(formData.get("username"));
  const password = normalizePassword(formData.get("password"));
  const nextPath = String(formData.get("next") || "");

  if (!config) {
    console.error(
      "Missing ADMIN_USERNAME, ADMIN_PASSWORD_HASH, or AUTH_SESSION_SECRET.",
    );
    return { error: SIGN_IN_UNAVAILABLE_ERROR };
  }

  const keyHash = await throttleKeyHash(config.sessionSecret);
  const throttle = await getLoginThrottleState(keyHash);
  if (throttle.locked) {
    return { error: LOGIN_THROTTLED_ERROR };
  }

  if (!username || !password) {
    await recordLoginFailure(keyHash);
    return { error: INVALID_CREDENTIALS_ERROR };
  }

  const usernameMatches = timingSafeEqualString(username, config.username);
  const passwordMatches = await verifyPassword(password, config.passwordHash);

  if (!usernameMatches || !passwordMatches) {
    const locked = await recordLoginFailure(keyHash);
    return {
      error: locked ? LOGIN_THROTTLED_ERROR : INVALID_CREDENTIALS_ERROR,
    };
  }

  await clearLoginFailures(keyHash);
  const persisted = await persistAdminSession(config.username);
  if (!persisted) {
    return { error: SIGN_IN_UNAVAILABLE_ERROR };
  }

  redirect(isSafeInternalNextPath(nextPath) ? nextPath : "/");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/login");
}
