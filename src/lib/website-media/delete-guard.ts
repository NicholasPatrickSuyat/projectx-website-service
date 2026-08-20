export const WEBSITE_MEDIA_REFERENCED_ERROR =
  "That image is still used in the draft, a saved version, or a publication.";

export function getDeleteWebsiteMediaDenial(input: {
  adminError: string | null;
  websiteExists: boolean;
  mediaBelongsToWebsite: boolean;
  referenced: boolean;
}): string | null {
  if (input.adminError) {
    return input.adminError;
  }
  if (!input.websiteExists || !input.mediaBelongsToWebsite) {
    return "That image could not be found.";
  }
  if (input.referenced) {
    return WEBSITE_MEDIA_REFERENCED_ERROR;
  }
  return null;
}
