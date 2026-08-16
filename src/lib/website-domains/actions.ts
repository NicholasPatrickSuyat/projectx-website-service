"use server";

import { revalidatePath } from "next/cache";
import { getAdminActionError } from "@/lib/auth/guard";
import { getWebsiteById } from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";
import { parseHostnameCandidate } from "@/lib/website-domains/hostname";
import {
  addWebsiteDomain,
  getWebsiteDomainByHostname,
  listWebsiteDomains,
  removeWebsiteDomain,
} from "@/lib/website-domains/repository";
import type { WebsiteDomain } from "@/lib/website-domains/types";

export type ListWebsiteDomainsResult =
  | { ok: true; domains: WebsiteDomain[] }
  | { ok: false; error: string };

export type MutateWebsiteDomainResult =
  | { ok: true; domains: WebsiteDomain[] }
  | { ok: false; error: string };

function revalidateDomainPaths(websiteId: string, clientId: string) {
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidatePath("/websites");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/host");
}

export async function listWebsiteDomainsAction(
  websiteId: string,
): Promise<ListWebsiteDomainsResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return { ok: false, error: "That website could not be found." };
  }

  const domains = await listWebsiteDomains(websiteId);
  return { ok: true, domains };
}

export async function addWebsiteDomainAction(
  websiteId: string,
  hostnameInput: string,
): Promise<MutateWebsiteDomainResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const parsed = parseHostnameCandidate(hostnameInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return { ok: false, error: "That website could not be found." };
  }

  const existing = await getWebsiteDomainByHostname(parsed.hostname);
  if (existing) {
    return {
      ok: false,
      error:
        existing.websiteId === websiteId
          ? "That hostname is already assigned to this website."
          : "That hostname is already assigned to another website.",
    };
  }

  try {
    await addWebsiteDomain(websiteId, parsed.hostname);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "WEBSITE_DOMAIN_LIMIT") {
      return {
        ok: false,
        error: "This website already has the maximum number of hostnames.",
      };
    }
    if (message === "WEBSITE_DOMAIN_CONFLICT") {
      return {
        ok: false,
        error: "That hostname is already assigned to another website.",
      };
    }
    if (message === "WEBSITE_NOT_FOUND") {
      return { ok: false, error: "That website could not be found." };
    }
    return { ok: false, error: "The hostname could not be saved." };
  }

  revalidateDomainPaths(websiteId, website.clientId);
  const domains = await listWebsiteDomains(websiteId);
  return { ok: true, domains };
}

export async function removeWebsiteDomainAction(
  websiteId: string,
  domainId: string,
): Promise<MutateWebsiteDomainResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId) || !isWebsiteId(domainId)) {
    return { ok: false, error: "That hostname could not be removed." };
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return { ok: false, error: "That website could not be found." };
  }

  const removed = await removeWebsiteDomain(websiteId, domainId);
  if (!removed) {
    return { ok: false, error: "That hostname could not be found." };
  }

  revalidateDomainPaths(websiteId, website.clientId);
  const domains = await listWebsiteDomains(websiteId);
  return { ok: true, domains };
}
