"use server";

import {
  extensionFromOriginalFilename,
  inspectWebsiteImageBytes,
  sanitizeOriginalFilename,
} from "@/lib/website-media/inspect";
import {
  createWebsiteMedia,
  listWebsiteMedia,
} from "@/lib/website-media/repository";
import { getWebsiteMediaStorage } from "@/lib/website-media/storage";
import {
  WEBSITE_MEDIA_MAX_BYTES,
  formatWebsiteMediaSize,
  type WebsiteMedia,
} from "@/lib/website-media/types";
import { getWebsiteById } from "@/lib/websites/repository";
import type { Website } from "@/lib/websites/types";
import { isWebsiteId } from "@/lib/websites/validation";

export type ListWebsiteMediaResult =
  | { ok: true; media: WebsiteMedia[] }
  | { ok: false; error: string };

export type UploadWebsiteMediaResult =
  | { ok: true; media: WebsiteMedia }
  | { ok: false; error: string };

const REJECTED_EXTENSIONS = new Set([
  "svg",
  "svgz",
  "gif",
  "html",
  "htm",
  "js",
  "mjs",
  "exe",
  "php",
  "sh",
]);

type WebsiteLookup =
  | { ok: true; website: Website }
  | { ok: false; error: string };

async function requireWebsite(websiteId: string): Promise<WebsiteLookup> {
  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return { ok: false, error: "That website could not be found." };
  }

  return { ok: true, website };
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    "name" in value
  );
}

export async function listWebsiteMediaAction(
  websiteId: string,
): Promise<ListWebsiteMediaResult> {
  const found = await requireWebsite(websiteId);
  if (!found.ok) {
    return { ok: false, error: found.error };
  }

  const media = await listWebsiteMedia(websiteId);
  return { ok: true, media };
}

export async function uploadWebsiteMediaAction(
  websiteId: string,
  formData: FormData,
): Promise<UploadWebsiteMediaResult> {
  const found = await requireWebsite(websiteId);
  if (!found.ok) {
    return { ok: false, error: found.error };
  }

  const file = formData.get("file");
  if (!isUploadedFile(file) || file.size === 0) {
    return { ok: false, error: "Choose a JPEG, PNG, or WebP image to upload." };
  }

  if (file.size > WEBSITE_MEDIA_MAX_BYTES) {
    return {
      ok: false,
      error: `That image is too large. The maximum size is ${formatWebsiteMediaSize(WEBSITE_MEDIA_MAX_BYTES)}.`,
    };
  }

  const originalFilename = sanitizeOriginalFilename(file.name || "image");
  const originalExtension = extensionFromOriginalFilename(originalFilename);
  if (originalExtension === "svg" || originalExtension === "svgz") {
    return { ok: false, error: "SVG uploads are not accepted." };
  }
  if (REJECTED_EXTENSIONS.has(originalExtension)) {
    return {
      ok: false,
      error: "That file type is not allowed. Use JPEG, PNG, or WebP.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected = inspectWebsiteImageBytes(bytes);
  if ("error" in inspected) {
    return { ok: false, error: inspected.error };
  }

  const id = crypto.randomUUID();
  const storedFilename = `${id}.${inspected.extension}`;
  const storage = await getWebsiteMediaStorage();

  await storage.write(websiteId, storedFilename, bytes);

  const media = await createWebsiteMedia({
    id,
    websiteId,
    originalFilename,
    storedFilename,
    mimeType: inspected.mimeType,
    fileSize: bytes.byteLength,
  });

  return { ok: true, media };
}
