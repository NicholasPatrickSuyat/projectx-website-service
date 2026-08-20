import { getWebsiteMediaObjectKey } from "@/lib/website-media/object-key";
import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export type MediaObjectStore = {
  put(key: string, value: Uint8Array): Promise<unknown>;
  get(
    key: string,
  ): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<unknown>;
};

export function createR2WebsiteMediaStorage(
  bucket: MediaObjectStore,
): WebsiteMediaStorage {
  return {
    async write(websiteId, storedFilename, bytes) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      await bucket.put(key, bytes);
    },

    async read(websiteId, storedFilename) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      const object = await bucket.get(key);
      if (!object) {
        return null;
      }

      return new Uint8Array(await object.arrayBuffer());
    },

    async delete(websiteId, storedFilename) {
      const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
      await bucket.delete(key);
    },
  };
}
