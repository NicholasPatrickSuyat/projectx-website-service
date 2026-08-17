"use server";

import { revalidatePath } from "next/cache";
import { getAdminActionError } from "@/lib/auth/guard";
import { getWebsiteById } from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";
import {
  getOrCreateReviewSession,
  getReviewAdminView,
  getReviewSessionByWebsiteId,
  regenerateReviewToken,
} from "@/lib/website-review/repository";
import {
  getReviewPath,
  type WebsiteReviewAdminView,
} from "@/lib/website-review/types";

export type WebsiteReviewMutationResult =
  | { ok: true; review: WebsiteReviewAdminView }
  | { ok: false; error: string };

export type {
  ClientReviewActionResult,
} from "@/lib/website-review/public-actions";

async function revalidateReviewPaths(
  websiteId: string,
  clientId: string,
  token?: string,
) {
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidatePath("/websites");
  revalidatePath(`/clients/${clientId}`);
  if (token) {
    revalidatePath(getReviewPath(token));
  }
}

export async function getWebsiteReviewAction(
  websiteId: string,
): Promise<WebsiteReviewMutationResult | { ok: true; review: null }> {
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

  const review = await getReviewAdminView(websiteId);
  return { ok: true, review };
}

export async function createWebsiteReviewAction(
  websiteId: string,
): Promise<WebsiteReviewMutationResult> {
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

  const review = await getOrCreateReviewSession(websiteId);
  await revalidateReviewPaths(website.id, website.clientId, review.session.token);
  return { ok: true, review };
}

export async function regenerateWebsiteReviewTokenAction(
  websiteId: string,
): Promise<WebsiteReviewMutationResult> {
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

  const previous = await getReviewSessionByWebsiteId(websiteId);
  const review = await regenerateReviewToken(websiteId);
  if (!review) {
    return { ok: false, error: "Create a review link before regenerating it." };
  }

  if (previous) {
    revalidatePath(getReviewPath(previous.token));
  }
  await revalidateReviewPaths(website.id, website.clientId, review.session.token);
  return { ok: true, review };
}
