import { getPlatformProxy } from "wrangler";
import type { D1Database } from "@cloudflare/workers-types";

type CloudflareEnv = {
  DB: D1Database;
};

type PlatformProxy = Awaited<ReturnType<typeof getPlatformProxy<CloudflareEnv>>>;

let platformProxyPromise: Promise<PlatformProxy> | null = null;

export async function getDb(): Promise<D1Database> {
  if (!platformProxyPromise) {
    platformProxyPromise = getPlatformProxy<CloudflareEnv>({
      persist: true,
      remoteBindings: false,
    });
  }

  const { env } = await platformProxyPromise;
  return env.DB;
}
