import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";

export async function writeWebsiteMediaThenRecord<T>(
  storage: WebsiteMediaStorage,
  websiteId: string,
  storedFilename: string,
  bytes: Uint8Array,
  record: () => Promise<T>,
): Promise<T> {
  await storage.write(websiteId, storedFilename, bytes);
  try {
    return await record();
  } catch (error) {
    try {
      await storage.delete(websiteId, storedFilename);
    } catch (cleanupError) {
      console.error(
        "Website media storage cleanup after metadata insert failure failed.",
        cleanupError,
      );
    }
    throw error;
  }
}

export async function deleteWebsiteMediaRecordThenObject(
  storage: WebsiteMediaStorage,
  websiteId: string,
  storedFilename: string,
  deleteRecord: () => Promise<void>,
): Promise<void> {
  await deleteRecord();
  try {
    await storage.delete(websiteId, storedFilename);
  } catch (error) {
    console.error(
      "Website media storage delete after metadata delete failed. The object may be orphaned and is no longer authorized.",
      error,
    );
  }
}
