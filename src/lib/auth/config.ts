import "server-only";
import { getCloudflareEnv } from "@/lib/runtime/env";
import { isProductionAdminMode } from "@/lib/runtime/production-admin";
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_USERNAME_MAX_LENGTH,
  SESSION_SECRET_MIN_BYTES,
} from "@/lib/auth/constants";

export type AdminAuthConfig = {
  username: string;
  passwordHash: string;
  sessionSecret: string;
};

function readProcessValue(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function getAdminAuthConfig(): Promise<AdminAuthConfig | null> {
  const env = isProductionAdminMode() ? null : await getCloudflareEnv();
  const username = (
    (env?.ADMIN_USERNAME || readProcessValue("ADMIN_USERNAME") || "")
  ).trim();
  const passwordHash = (
    env?.ADMIN_PASSWORD_HASH ||
    readProcessValue("ADMIN_PASSWORD_HASH") ||
    ""
  ).trim();
  const sessionSecret = (
    env?.AUTH_SESSION_SECRET ||
    readProcessValue("AUTH_SESSION_SECRET") ||
    ""
  ).trim();

  if (
    !username ||
    username.length > AUTH_USERNAME_MAX_LENGTH ||
    !passwordHash ||
    !sessionSecret ||
    sessionSecret.length < SESSION_SECRET_MIN_BYTES
  ) {
    return null;
  }

  if (passwordHash.length > 512) {
    return null;
  }

  return { username, passwordHash, sessionSecret };
}

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const username = value.trim();
  if (!username || username.length > AUTH_USERNAME_MAX_LENGTH) {
    return null;
  }

  return username;
}

export function normalizePassword(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!value || value.length > AUTH_PASSWORD_MAX_LENGTH) {
    return null;
  }

  return value;
}
