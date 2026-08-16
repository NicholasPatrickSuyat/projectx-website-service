"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionError } from "@/lib/auth/guard";
import { getClientById } from "@/lib/clients/repository";
import type { EditorErrors } from "@/lib/templates/editor";
import type { WebsiteRecordStatus } from "@/lib/domain";
import {
  initializeWebsiteContent,
  prepareWebsiteContentForSave,
  serializeWebsiteContent,
  websiteContentJsonEquals,
} from "@/lib/websites/content";
import { getReviewSessionByWebsiteId } from "@/lib/website-review/repository";
import { getReviewPath } from "@/lib/website-review/types";
import {
  createWebsite,
  getWebsiteById,
  getWebsiteForClient,
  updateWebsiteContent,
  updateWebsiteStatus,
} from "@/lib/websites/repository";
import {
  canTransitionWebsiteStatus,
  isWebsiteId,
  isWebsiteRecordStatus,
  validateCreateWebsiteInput,
  type CreateWebsiteFieldErrors,
} from "@/lib/websites/validation";

export type CreateWebsiteActionState = {
  error?: string;
  fieldErrors?: CreateWebsiteFieldErrors;
} | null;

export type WebsiteMutationResult =
  | {
      ok: true;
      updatedAt: string;
      status: WebsiteRecordStatus;
      versionNumber?: number | null;
      contentChanged?: boolean;
    }
  | { ok: false; error: string; fieldErrors?: EditorErrors };

function revalidateWebsitePaths(websiteId: string, clientId: string) {
  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}

async function revalidateWebsiteAndReview(websiteId: string, clientId: string) {
  revalidateWebsitePaths(websiteId, clientId);
  const session = await getReviewSessionByWebsiteId(websiteId);
  if (session) {
    revalidatePath(getReviewPath(session.token));
  }
}

export async function createWebsiteAction(
  _prevState: CreateWebsiteActionState,
  formData: FormData,
): Promise<CreateWebsiteActionState> {
  const denied = await getAdminActionError();
  if (denied) {
    return { error: denied };
  }

  const parsed = validateCreateWebsiteInput(formData);
  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const client = await getClientById(parsed.data.clientId);
  if (!client) {
    return { error: "That client could not be found." };
  }

  const existing = await getWebsiteForClient(client.id);
  if (existing) {
    return {
      error: "This client already has a website. Open the existing website editor instead.",
    };
  }

  const content = initializeWebsiteContent(client, parsed.data.templateId);

  let website;
  try {
    website = await createWebsite({
      clientId: client.id,
      templateId: parsed.data.templateId,
      name: parsed.data.name,
      contentJson: serializeWebsiteContent(content, parsed.data.templateId),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WEBSITE_ALREADY_EXISTS") {
      return {
        error:
          "This client already has a website. Open the existing website editor instead.",
      };
    }
    throw error;
  }

  revalidateWebsitePaths(website.id, client.id);
  redirect(`/websites/${website.id}/edit`);
}

export async function saveWebsiteDraftAction(
  websiteId: string,
  contentJson: string,
): Promise<WebsiteMutationResult> {
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

  const prepared = prepareWebsiteContentForSave(contentJson, existing.templateId);
  if (!prepared.ok) {
    return {
      ok: false,
      error: prepared.error,
      fieldErrors: prepared.fieldErrors,
    };
  }

  if (websiteContentJsonEquals(existing.contentJson, prepared.json, existing.templateId)) {
    return {
      ok: true,
      updatedAt: existing.updatedAt,
      status: existing.status,
      versionNumber: null,
      contentChanged: false,
    };
  }

  let updated;
  try {
    updated = await updateWebsiteContent(websiteId, prepared.json);
  } catch (error) {
    if (error instanceof Error && error.message === "WEBSITE_VERSION_CONFLICT") {
      return {
        ok: false,
        error: "Could not save a version checkpoint. Try Save Draft again.",
      };
    }
    throw error;
  }

  if (!updated) {
    return { ok: false, error: "That website could not be found." };
  }

  await revalidateWebsiteAndReview(updated.website.id, updated.website.clientId);
  return {
    ok: true,
    updatedAt: updated.website.updatedAt,
    status: updated.website.status,
    versionNumber: updated.versionNumber,
    contentChanged: true,
  };
}

export async function updateWebsiteStatusAction(
  websiteId: string,
  nextStatus: string,
): Promise<WebsiteMutationResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  if (!isWebsiteRecordStatus(nextStatus)) {
    return { ok: false, error: "Choose a valid website status." };
  }

  const existing = await getWebsiteById(websiteId);
  if (!existing) {
    return { ok: false, error: "That website could not be found." };
  }

  if (!canTransitionWebsiteStatus(existing.status, nextStatus)) {
    return {
      ok: false,
      error: "That status change is not allowed from the current status.",
    };
  }

  const updated = await updateWebsiteStatus(websiteId, nextStatus);
  if (!updated) {
    return { ok: false, error: "That website could not be found." };
  }

  revalidateWebsitePaths(updated.id, updated.clientId);
  return {
    ok: true,
    updatedAt: updated.updatedAt,
    status: updated.status,
  };
}
