export const MISSING_MEDIA_KV_BINDING =
  "Missing required Cloudflare KV binding `MEDIA_KV`. Production cannot use local filesystem media storage.";

export const FILESYSTEM_WORKERS_ERROR =
  "Local filesystem media storage cannot run in the Cloudflare Workers runtime.";

export const FILESYSTEM_PRODUCTION_ADMIN_ERROR =
  "Local filesystem media storage cannot run in production admin mode. Workers KV binding `MEDIA_KV` is required.";

export type WebsiteMediaProviderKind = "filesystem" | "kv";

export type ChooseWebsiteMediaProviderInput = {
  isWorkersRuntime: boolean;
  isProductionAdmin: boolean;
  hasMediaKv: boolean;
};

export function chooseWebsiteMediaProvider(
  input: ChooseWebsiteMediaProviderInput,
): WebsiteMediaProviderKind {
  if (input.isWorkersRuntime || input.isProductionAdmin) {
    if (!input.hasMediaKv) {
      throw new Error(MISSING_MEDIA_KV_BINDING);
    }
    return "kv";
  }

  return "filesystem";
}
