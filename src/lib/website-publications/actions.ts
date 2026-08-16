"use server";

import { revalidatePath } from "next/cache";
import { getAdminActionError } from "@/lib/auth/guard";
import { cloneContent } from "@/lib/templates/editor";
import type { WebsiteContent } from "@/lib/templates/types";
import { canPublishWebsite } from "@/lib/domain";
import {
  getWebsitePublicationForWebsite,
  listWebsitePublications,
  publishWebsite,
} from "@/lib/website-publications/repository";
import {
  getPublishedWebsitePreviewPath,
  type WebsitePublicationSummary,
} from "@/lib/website-publications/types";
import {
  parseWebsiteContentJson,
  prepareWebsiteContentForSave,
} from "@/lib/websites/content";
import { getWebsiteById } from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";
import { getReviewSessionByWebsiteId } from "@/lib/website-review/repository";
import { getReviewPath } from "@/lib/website-review/types";

export type ListWebsitePublicationsResult =
  | { ok: true; publications: WebsitePublicationSummary[] }
  | { ok: false; error: string };

export type GetWebsitePublicationResult =
  | {
      ok: true;
      publication: WebsitePublicationSummary;
      content: WebsiteContent;
    }
  | { ok: false; error: string; malformed?: boolean };

export type PublishWebsiteResult =
  | {
      ok: true;
      updatedAt: string;
      status: "PUBLISHED";
      publicationNumber: number;
      publishedAt: string;
    }
  | { ok: false; error: string };

function revalidatePublishPaths(
  websiteId: string,
  clientId: string,
  reviewToken?: string,
) {
  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
  revalidatePath("/host");
  revalidatePath(getPublishedWebsitePreviewPath(websiteId));
  if (reviewToken) {
    revalidatePath(getReviewPath(reviewToken));
  }
}

export async function listWebsitePublicationsAction(
  websiteId: string,
): Promise<ListWebsitePublicationsResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const publications = await listWebsitePublications(websiteId);
  return { ok: true, publications };
}

export async function getWebsitePublicationAction(
  websiteId: string,
  publicationId: string,
): Promise<GetWebsitePublicationResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId) || !isWebsiteId(publicationId)) {
    return { ok: false, error: "Publication ID is invalid." };
  }

  const publication = await getWebsitePublicationForWebsite(
    websiteId,
    publicationId,
  );
  if (!publication) {
    return { ok: false, error: "That publication could not be found." };
  }

  const parsed = parseWebsiteContentJson(
    publication.contentJson,
    publication.templateId,
  );
  if (!parsed.ok) {
    return {
      ok: false,
      error:
        "This publication snapshot could not be read. It was not loaded into the editor.",
      malformed: true,
    };
  }

  return {
    ok: true,
    publication: {
      id: publication.id,
      websiteId: publication.websiteId,
      publicationNumber: publication.publicationNumber,
      templateId: publication.templateId,
      publishedAt: publication.publishedAt,
      createdAt: publication.createdAt,
    },
    content: cloneContent(parsed.content),
  };
}

export async function publishWebsiteAction(
  websiteId: string,
): Promise<PublishWebsiteResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const existing = await getWebsiteById(websiteId);
  if (!existing) {
    return { ok: false, error: "That website could not be found." };
  }

  if (!canPublishWebsite(existing.status)) {
    return {
      ok: false,
      error:
        "Publish is only allowed when the website status is Ready to publish.",
    };
  }

  const prepared = prepareWebsiteContentForSave(
    existing.contentJson,
    existing.templateId,
  );
  if (!prepared.ok) {
    return {
      ok: false,
      error:
        "The saved website content is invalid and cannot be published. Fix and Save Draft first.",
    };
  }

  let published;
  try {
    published = await publishWebsite(websiteId);
  } catch (error) {
    if (error instanceof Error && error.message === "WEBSITE_NOT_READY_TO_PUBLISH") {
      return {
        ok: false,
        error:
          "Publish is only allowed when the website status is Ready to publish.",
      };
    }
    if (error instanceof Error && error.message === "WEBSITE_PUBLICATION_CONFLICT") {
      return {
        ok: false,
        error: "Could not create the publication snapshot. Try Publish again.",
      };
    }
    throw error;
  }

  if (!published) {
    return { ok: false, error: "That website could not be found." };
  }

  const session = await getReviewSessionByWebsiteId(published.website.id);
  revalidatePublishPaths(
    published.website.id,
    published.website.clientId,
    session?.token,
  );

  return {
    ok: true,
    updatedAt: published.website.updatedAt,
    status: "PUBLISHED",
    publicationNumber: published.publication.publicationNumber,
    publishedAt: published.publication.publishedAt,
  };
}
