import { WEBSITE_ID_PATTERN } from "@/lib/websites/validation";

export const WEBSITE_MEDIA_PUBLIC_PREFIX = "/media/";

const TEMPLATE_IMAGE_SRC =
  /^\/templates\/[a-z0-9-]+\/[a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

export function getWebsiteMediaPublicPath(mediaId: string) {
  return `${WEBSITE_MEDIA_PUBLIC_PREFIX}${mediaId}`;
}

export function parseWebsiteMediaId(src: string): string | null {
  if (!src.startsWith(WEBSITE_MEDIA_PUBLIC_PREFIX)) {
    return null;
  }

  const mediaId = src.slice(WEBSITE_MEDIA_PUBLIC_PREFIX.length);
  return WEBSITE_ID_PATTERN.test(mediaId) ? mediaId : null;
}

export function isWebsiteMediaSrc(src: string): boolean {
  return parseWebsiteMediaId(src) !== null;
}

export function isAllowedWebsiteImageSrc(src: string): boolean {
  return TEMPLATE_IMAGE_SRC.test(src) || isWebsiteMediaSrc(src);
}
