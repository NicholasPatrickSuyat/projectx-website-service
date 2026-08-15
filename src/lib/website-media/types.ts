export const WEBSITE_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export const WEBSITE_MEDIA_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type WebsiteMediaMimeType =
  (typeof WEBSITE_MEDIA_ALLOWED_MIME_TYPES)[number];

export type WebsiteMedia = {
  id: string;
  websiteId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: WebsiteMediaMimeType;
  fileSize: number;
  createdAt: string;
  publicPath: string;
};

export type WebsiteMediaRow = {
  id: string;
  website_id: string;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export function formatWebsiteMediaSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isWebsiteMediaMimeType(
  value: string,
): value is WebsiteMediaMimeType {
  return WEBSITE_MEDIA_ALLOWED_MIME_TYPES.includes(
    value as WebsiteMediaMimeType,
  );
}
