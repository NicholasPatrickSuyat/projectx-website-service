import "server-only";
import {
  getCloudflareEnv,
  getRequiredMediaKvBinding,
  isCloudflareWorkersRuntime,
} from "@/lib/runtime/env";
import { isProductionAdminMode } from "@/lib/runtime/production-admin";
import { chooseWebsiteMediaProvider } from "@/lib/website-media/provider";
import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export async function getWebsiteMediaStorage(): Promise<WebsiteMediaStorage> {
  const isWorkersRuntime = isCloudflareWorkersRuntime();
  const isProductionAdmin = isProductionAdminMode();
  let hasMediaKv = false;
  if (isWorkersRuntime || isProductionAdmin) {
    try {
      const env = await getCloudflareEnv();
      hasMediaKv = Boolean(env.MEDIA_KV);
    } catch {
      hasMediaKv = false;
    }
  }

  const provider = chooseWebsiteMediaProvider({
    isWorkersRuntime,
    isProductionAdmin,
    hasMediaKv,
  });

  if (provider === "kv") {
    const { createKvWebsiteMediaStorage } = await import("./kv-storage");
    return createKvWebsiteMediaStorage(await getRequiredMediaKvBinding());
  }

  const { getLocalWebsiteMediaStorage } = await import(
    "./local-filesystem-storage"
  );
  return getLocalWebsiteMediaStorage();
}

export async function getMediaStorage(): Promise<WebsiteMediaStorage> {
  return getWebsiteMediaStorage();
}
