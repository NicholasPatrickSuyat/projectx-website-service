import { getTemplate } from "@/lib/templates/registry";
import type { WebsiteContent } from "@/lib/templates/types";
import { parseWebsiteContentJson } from "@/lib/websites/content";
import { getWebsiteById } from "@/lib/websites/repository";
import type { Website } from "@/lib/websites/types";
import { isWebsiteId } from "@/lib/websites/validation";

export type StandaloneSavedWebsite = {
  website: Website;
  templateId: string;
  content: WebsiteContent;
};

export async function getStandaloneSavedWebsite(
  websiteId: string,
): Promise<StandaloneSavedWebsite | null> {
  if (!isWebsiteId(websiteId)) {
    return null;
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return null;
  }

  const template = getTemplate(website.templateId);
  if (!template) {
    return null;
  }

  const parsed = parseWebsiteContentJson(
    website.contentJson,
    website.templateId,
  );
  if (!parsed.ok) {
    return null;
  }

  return {
    website,
    templateId: template.id,
    content: parsed.content,
  };
}
