"use server";

import { revalidatePath } from "next/cache";
import { parseWebsiteContentJson } from "@/lib/websites/content";
import {
  getWebsiteById,
  updateWebsiteStatus,
} from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";
import {
  addReviewFeedback,
  getOrCreateReviewSession,
  getReviewAdminView,
  getReviewSessionByToken,
  getReviewSessionByWebsiteId,
  markReviewSessionApproved,
  regenerateReviewToken,
} from "@/lib/website-review/repository";
import { isReviewToken } from "@/lib/website-review/token";
import {
  getReviewPath,
  type ClientReviewPageData,
  type WebsiteReviewAdminView,
} from "@/lib/website-review/types";
import { validateReviewFeedbackMessage } from "@/lib/website-review/validation";

export type WebsiteReviewMutationResult =
  | { ok: true; review: WebsiteReviewAdminView }
  | { ok: false; error: string };

export type ClientReviewActionResult =
  | { ok: true; message?: string; approvedAt?: string | null }
  | { ok: false; error: string };

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

export async function getClientReviewByToken(
  token: string,
): Promise<ClientReviewPageData | null> {
  if (!isReviewToken(token)) {
    return null;
  }

  const session = await getReviewSessionByToken(token);
  if (!session) {
    return null;
  }

  const website = await getWebsiteById(session.websiteId);
  if (!website) {
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
    templateId: website.templateId,
    content: parsed.content,
    sessionStatus: session.status,
    approvedAt: session.approvedAt,
  };
}

export async function submitReviewFeedbackAction(
  token: string,
  formData: FormData,
): Promise<ClientReviewActionResult> {
  if (!isReviewToken(token)) {
    return { ok: false, error: "This review link is unavailable." };
  }

  const session = await getReviewSessionByToken(token);
  if (!session) {
    return { ok: false, error: "This review link is unavailable." };
  }

  const parsed = validateReviewFeedbackMessage(formData.get("message"));
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  await addReviewFeedback(session.id, parsed.message);

  const website = await getWebsiteById(session.websiteId);
  if (website) {
    await revalidateReviewPaths(website.id, website.clientId, session.token);
  }

  return { ok: true, message: "Your feedback was sent." };
}

export async function approveReviewAction(
  token: string,
): Promise<ClientReviewActionResult> {
  if (!isReviewToken(token)) {
    return { ok: false, error: "This review link is unavailable." };
  }

  const session = await getReviewSessionByToken(token);
  if (!session) {
    return { ok: false, error: "This review link is unavailable." };
  }

  const website = await getWebsiteById(session.websiteId);
  if (!website) {
    return { ok: false, error: "This review link is unavailable." };
  }

  if (session.status === "APPROVED") {
    return { ok: true, approvedAt: session.approvedAt };
  }

  const approvedAt = new Date().toISOString();
  const updatedSession = await markReviewSessionApproved(session.id, approvedAt);
  if (!updatedSession) {
    return { ok: false, error: "This review could not be approved." };
  }

  if (website.status === "READY_FOR_APPROVAL") {
    await updateWebsiteStatus(website.id, "READY_TO_PUBLISH");
  }

  await revalidateReviewPaths(website.id, website.clientId, session.token);
  return { ok: true, approvedAt: updatedSession.approvedAt };
}
