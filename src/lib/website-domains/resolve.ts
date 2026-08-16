import "server-only";
import { cache } from "react";
import { getTemplate } from "@/lib/templates/registry";
import type { TemplateId, WebsiteContent } from "@/lib/templates/types";
import { parseWebsiteContentJson } from "@/lib/websites/content";
import {
  isAdminApplicationHostname,
  parseRequestHostname,
} from "@/lib/website-domains/hostname";
import { getWebsiteDomainByHostname } from "@/lib/website-domains/repository";
import { getLatestWebsitePublication } from "@/lib/website-publications/repository";

export type PublicHostWebsite = {
  hostname: string;
  templateId: TemplateId;
  content: WebsiteContent;
};

export const resolvePublishedWebsiteForHostname = cache(
  async function resolvePublishedWebsiteForHostname(
    rawHostHeader: string | null | undefined,
  ): Promise<PublicHostWebsite | null> {
    const hostname = parseRequestHostname(rawHostHeader);
    if (!hostname || isAdminApplicationHostname(hostname)) {
      return null;
    }

    const mapping = await getWebsiteDomainByHostname(hostname);
    if (!mapping) {
      return null;
    }

    const publication = await getLatestWebsitePublication(mapping.websiteId);
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
      hostname,
      templateId: template.id,
      content: parsed.content,
    };
  },
);
