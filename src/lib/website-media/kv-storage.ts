import { getWebsiteMediaObjectKey } from "@/lib/website-media/object-key";
import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export type MediaKvNamespace = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
  ): Promise<unknown>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<unknown>;
};

export function createKvWebsiteMediaStorage(
  namespace: MediaKvNamespace,
): WebsiteMediaStorage {
  return {
    async write(websiteId, storedFilename, bytes) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      await namespace.put(key, bytes);
    },

    async read(websiteId, storedFilename) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      const value = await namespace.get(key, "arrayBuffer");
      if (!value) {
        return null;
      }
      return new Uint8Array(value);
    },

    async delete(websiteId, storedFilename) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      await namespace.delete(key);
    },
  };
}
