"use server";

import { revalidatePath } from "next/cache";
import {
  getWebsiteById,
  updateWebsiteStatus,
} from "@/lib/websites/repository";
import {
  addReviewFeedback,
  getReviewSessionByToken,
  markReviewSessionApproved,
} from "@/lib/website-review/repository";
import { isReviewToken } from "@/lib/website-review/token";
import { getReviewPath } from "@/lib/website-review/types";
import { validateReviewFeedbackMessage } from "@/lib/website-review/validation";

export type ClientReviewActionResult =
  | { ok: true; message?: string; approvedAt?: string | null }
  | { ok: false; error: string };

async function revalidatePublicReviewPath(token: string) {
  revalidatePath(getReviewPath(token));
}

export async function submitReviewFeedbackAction(
  token: string,
  formData: FormData,
): Promise<ClientReviewActionResult> {
  // Public: authorized by the review token, not an admin session.
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
  await revalidatePublicReviewPath(session.token);
  return { ok: true, message: "Your feedback was sent." };
}

export async function approveReviewAction(
  token: string,
): Promise<ClientReviewActionResult> {
  // Public: authorized by the review token, not an admin session.
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

  await revalidatePublicReviewPath(session.token);
  return { ok: true, approvedAt: updatedSession.approvedAt };
}
