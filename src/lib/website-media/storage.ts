import "server-only";
import {
  getRequiredMediaBinding,
  isCloudflareWorkersRuntime,
} from "@/lib/runtime/env";
import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export async function getWebsiteMediaStorage(): Promise<WebsiteMediaStorage> {
  if (isCloudflareWorkersRuntime()) {
    const { createR2WebsiteMediaStorage } = await import("./r2-storage");
    return createR2WebsiteMediaStorage(await getRequiredMediaBinding());
  }

  const { getLocalWebsiteMediaStorage } = await import(
    "./local-filesystem-storage"
  );
  return getLocalWebsiteMediaStorage();
}

export async function getMediaStorage(): Promise<WebsiteMediaStorage> {
  return getWebsiteMediaStorage();
}
