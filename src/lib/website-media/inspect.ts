import {
  WEBSITE_MEDIA_ALLOWED_MIME_TYPES,
  type WebsiteMediaMimeType,
} from "./types";

export type InspectedWebsiteImage = {
  mimeType: WebsiteMediaMimeType;
  extension: "jpg" | "png" | "webp";
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[index] === value);
}

function looksLikeSvg(bytes: Uint8Array): boolean {
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 256))
    .replace(/^\uFEFF/, "")
    .trimStart()
    .toLowerCase();
  return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
}

export function inspectWebsiteImageBytes(
  bytes: Uint8Array,
): InspectedWebsiteImage | { error: string } {
  if (looksLikeSvg(bytes)) {
    return { error: "SVG uploads are not accepted." };
  }

  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) {
    return { error: "GIF images are not supported. Use JPEG, PNG, or WebP." };
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  if (startsWith(bytes, PNG_SIGNATURE)) {
    return { mimeType: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return {
    error: `That file is not a supported website image. Use ${WEBSITE_MEDIA_ALLOWED_MIME_TYPES.join(", ")}.`,
  };
}

export function extensionFromOriginalFilename(filename: string): string {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function sanitizeOriginalFilename(filename: string): string {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "image";
  const cleaned = base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120).trim();
  return cleaned || "image";
}
