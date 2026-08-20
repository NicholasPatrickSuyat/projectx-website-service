import { sanitizeOriginalFilename } from "@/lib/website-media/inspect";
import type { WebsiteMediaMimeType } from "@/lib/website-media/types";

export function getWebsiteMediaResponseHeaders(input: {
  mimeType: WebsiteMediaMimeType;
  originalFilename: string;
  byteLength: number;
}): HeadersInit {
  const filename = sanitizeOriginalFilename(input.originalFilename).replace(
    /"/g,
    "",
  );

  return {
    "Content-Type": input.mimeType,
    "Content-Length": String(input.byteLength),
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename="${filename}"`,
  };
}
