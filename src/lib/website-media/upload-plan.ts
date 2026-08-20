import { inspectWebsiteImageBytes, sanitizeOriginalFilename, extensionFromOriginalFilename } from "@/lib/website-media/inspect";
import {
  WEBSITE_MEDIA_MAX_BYTES,
  formatWebsiteMediaSize,
  type WebsiteMediaMimeType,
} from "@/lib/website-media/types";
import { isWebsiteId } from "@/lib/websites/validation";

export const REJECTED_UPLOAD_EXTENSIONS = new Set([
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

export type PlannedWebsiteMediaUpload = {
  id: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: WebsiteMediaMimeType;
  fileSize: number;
};

export type PlanWebsiteMediaUploadResult =
  | { ok: true; plan: PlannedWebsiteMediaUpload }
  | { ok: false; error: string };

export function planWebsiteMediaUpload(input: {
  originalName: string;
  size: number;
  bytes: Uint8Array;
  id: string;
}): PlanWebsiteMediaUploadResult {
  if (!isWebsiteId(input.id)) {
    return { ok: false, error: "Stored filename is invalid." };
  }

  if (!input.bytes.byteLength || input.size === 0) {
    return { ok: false, error: "Choose a JPEG, PNG, or WebP image to upload." };
  }

  if (input.size > WEBSITE_MEDIA_MAX_BYTES || input.bytes.byteLength > WEBSITE_MEDIA_MAX_BYTES) {
    return {
      ok: false,
      error: `That image is too large. The maximum size is ${formatWebsiteMediaSize(WEBSITE_MEDIA_MAX_BYTES)}.`,
    };
  }

  const originalFilename = sanitizeOriginalFilename(input.originalName || "image");
  const originalExtension = extensionFromOriginalFilename(originalFilename);
  if (originalExtension === "svg" || originalExtension === "svgz") {
    return { ok: false, error: "SVG uploads are not accepted." };
  }
  if (REJECTED_UPLOAD_EXTENSIONS.has(originalExtension)) {
    return {
      ok: false,
      error: "That file type is not allowed. Use JPEG, PNG, or WebP.",
    };
  }

  const inspected = inspectWebsiteImageBytes(input.bytes);
  if ("error" in inspected) {
    return { ok: false, error: inspected.error };
  }

  return {
    ok: true,
    plan: {
      id: input.id,
      originalFilename,
      storedFilename: `${input.id}.${inspected.extension}`,
      mimeType: inspected.mimeType,
      fileSize: input.bytes.byteLength,
    },
  };
}
