import "server-only";
import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MediaObjectStore } from "@/lib/website-media/r2-storage";

const MISSING_DB_BINDING =
  "Missing required Cloudflare D1 binding `DB`. The application cannot use a silent database fallback.";

const MISSING_MEDIA_BINDING =
  "Missing required Cloudflare R2 binding `MEDIA`. Production cannot use local filesystem media storage.";

type AppCloudflareEnv = CloudflareEnv & {
  DB?: D1Database;
  MEDIA?: MediaObjectStore;
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
