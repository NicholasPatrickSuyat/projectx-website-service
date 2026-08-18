import "server-only";
import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MediaObjectStore } from "@/lib/website-media/r2-storage";
import { isProductionAdminMode } from "@/lib/runtime/production-admin";

const MISSING_DB_BINDING =
  "Missing required Cloudflare D1 binding `DB`. The application cannot use a silent database fallback.";

const MISSING_MEDIA_BINDING =
  "Missing required Cloudflare R2 binding `MEDIA`. Production cannot use local filesystem media storage.";

const MISSING_PRODUCTION_REMOTE_D1 =
  "Production admin refused silent local D1 fallback. Remote projectx-websites-production is required.";

let productionRemoteDbVerified = false;

type AppCloudflareEnv = CloudflareEnv & {
  DB?: D1Database;
  MEDIA?: MediaObjectStore;
  // Admin-only. The public runtime must boot without these.
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  AUTH_SESSION_SECRET?: string;
};

export function isCloudflareWorkersRuntime(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.includes("Cloudflare-Workers")
  );
}

export async function getCloudflareEnv(): Promise<AppCloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as AppCloudflareEnv;
}

export async function getRequiredDatabaseBinding(): Promise<D1Database> {
  const env = await getCloudflareEnv();
  if (!env.DB) {
    console.error(MISSING_DB_BINDING);
    throw new Error(MISSING_DB_BINDING);
  }
  if (isProductionAdminMode() && !productionRemoteDbVerified) {
    try {
      const row = await env.DB.prepare(
        `SELECT 1 AS ok
         FROM sqlite_master
         WHERE type = 'table' AND name = 'admin_auth_login_throttle'
         LIMIT 1`,
      ).first<{ ok: number }>();
      if (!row) {
        console.error(MISSING_PRODUCTION_REMOTE_D1);
        throw new Error(MISSING_PRODUCTION_REMOTE_D1);
      }
      productionRemoteDbVerified = true;
    } catch (error) {
      if (error instanceof Error && error.message === MISSING_PRODUCTION_REMOTE_D1) {
        throw error;
      }
      console.error(MISSING_PRODUCTION_REMOTE_D1);
      throw new Error(MISSING_PRODUCTION_REMOTE_D1);
    }
  }
  return env.DB;
}

export async function getRequiredMediaBinding(): Promise<MediaObjectStore> {
  const env = await getCloudflareEnv();
  if (!env.MEDIA) {
    console.error(MISSING_MEDIA_BINDING);
    throw new Error(MISSING_MEDIA_BINDING);
  }
  return env.MEDIA;
}
