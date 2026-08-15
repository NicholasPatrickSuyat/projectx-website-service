import { getTemplate } from "@/lib/templates/registry";
import type { TemplateId, WebsiteContent } from "@/lib/templates/types";
import { parseWebsiteContentJson } from "@/lib/websites/content";
import { getLatestWebsitePublication } from "@/lib/website-publications/repository";
import { isWebsiteId } from "@/lib/websites/validation";

export type StandalonePublishedWebsite = {
  websiteId: string;
  publicationNumber: number;
  templateId: TemplateId;
  content: WebsiteContent;
  publishedAt: string;
};

export async function getStandalonePublishedWebsite(
  websiteId: string,
): Promise<StandalonePublishedWebsite | null> {
  if (!isWebsiteId(websiteId)) {
    return null;
  }

  const publication = await getLatestWebsitePublication(websiteId);
  if (!publication) {
    return null;
  }

  const template = getTemplate(publication.templateId);
  if (!template) {
    return null;
  }

  const parsed = parseWebsiteContentJson(
    publication.contentJson,
    publication.templateId,
  );
  if (!parsed.ok) {
    return null;
  }

  return {
    websiteId: publication.websiteId,
    publicationNumber: publication.publicationNumber,
    templateId: template.id,
    content: parsed.content,
    publishedAt: publication.publishedAt,
  };
}
