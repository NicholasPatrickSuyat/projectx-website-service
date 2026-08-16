import { isWebsiteId } from "@/lib/websites/validation";

export const STORED_FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export function getWebsiteMediaObjectKey(
  websiteId: string,
  storedFilename: string,
): string {
  if (!isWebsiteId(websiteId)) {
    throw new Error("Website ID is invalid.");
  }
  if (!STORED_FILENAME_PATTERN.test(storedFilename)) {
    throw new Error("Stored filename is invalid.");
  }

  return `${websiteId}/${storedFilename}`;
}
