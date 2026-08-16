import { parseWebsiteMediaId } from "@/lib/website-media/paths";

const MEDIA_SRC_PATTERN =
  /\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function collectReferencedMediaIds(contentJson: string): Set<string> {
  const ids = new Set<string>();
  if (!contentJson) {
    return ids;
  }

  const matches = contentJson.match(MEDIA_SRC_PATTERN) ?? [];
  for (const match of matches) {
    const mediaId = parseWebsiteMediaId(match);
    if (mediaId) {
      ids.add(mediaId.toLowerCase());
    }
  }

  return ids;
}

export function contentReferencesMedia(
  contentJson: string,
  mediaId: string,
): boolean {
  return collectReferencedMediaIds(contentJson).has(mediaId.toLowerCase());
}
