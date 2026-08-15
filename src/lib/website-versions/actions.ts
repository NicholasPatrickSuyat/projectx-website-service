"use server";

import { cloneContent } from "@/lib/templates/editor";
import {
  listWebsiteVersions,
  getWebsiteVersionForWebsite,
} from "@/lib/website-versions/repository";
import type { WebsiteVersionSummary } from "@/lib/website-versions/types";
import { parseWebsiteContentJson } from "@/lib/websites/content";
import { isWebsiteId } from "@/lib/websites/validation";
import type { ServiceWebsiteContent } from "@/lib/templates/types";

export type ListWebsiteVersionsResult =
  | { ok: true; versions: WebsiteVersionSummary[] }
  | { ok: false; error: string };

export type GetWebsiteVersionResult =
  | {
      ok: true;
      version: WebsiteVersionSummary;
      content: ServiceWebsiteContent;
    }
  | { ok: false; error: string; malformed?: boolean };

export async function listWebsiteVersionsAction(
  websiteId: string,
): Promise<ListWebsiteVersionsResult> {
  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const versions = await listWebsiteVersions(websiteId);
  return { ok: true, versions };
}

export async function getWebsiteVersionAction(
  websiteId: string,
  versionId: string,
): Promise<GetWebsiteVersionResult> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(versionId)) {
    return { ok: false, error: "Version ID is invalid." };
  }

  const version = await getWebsiteVersionForWebsite(websiteId, versionId);
  if (!version) {
    return { ok: false, error: "That version could not be found." };
  }

  const parsed = parseWebsiteContentJson(version.contentJson);
  if (!parsed.ok) {
    return {
      ok: false,
      error:
        "This version snapshot could not be read. It was not loaded into the editor.",
      malformed: true,
    };
  }

  return {
    ok: true,
    version: {
      id: version.id,
      websiteId: version.websiteId,
      versionNumber: version.versionNumber,
      websiteStatus: version.websiteStatus,
      createdAt: version.createdAt,
    },
    content: cloneContent(parsed.content),
  };
}
