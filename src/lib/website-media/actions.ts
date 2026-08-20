"use server";

import { getAdminActionError } from "@/lib/auth/guard";
import {
  deleteWebsiteMediaRecordThenObject,
  writeWebsiteMediaThenRecord,
} from "@/lib/website-media/consistency";
import {
  createWebsiteMedia,
  deleteWebsiteMediaForWebsite,
  getWebsiteMediaForWebsite,
  listWebsiteMedia,
  websiteMediaIsReferenced,
} from "@/lib/website-media/repository";
import { getDeleteWebsiteMediaDenial } from "@/lib/website-media/delete-guard";
import { getWebsiteMediaStorage } from "@/lib/website-media/storage";
import { planWebsiteMediaUpload } from "@/lib/website-media/upload-plan";
import { type WebsiteMedia } from "@/lib/website-media/types";
import { getWebsiteById } from "@/lib/websites/repository";
import type { Website } from "@/lib/websites/types";
import { isWebsiteId } from "@/lib/websites/validation";

export type ListWebsiteMediaResult =
  | { ok: true; media: WebsiteMedia[] }
  | { ok: false; error: string };

export type UploadWebsiteMediaResult =
  | { ok: true; media: WebsiteMedia }
  | { ok: false; error: string };

export type DeleteWebsiteMediaResult =
  | { ok: true }
  | { ok: false; error: string };

type WebsiteLookup =
  | { ok: true; website: Website }
  | { ok: false; error: string };

async function requireWebsite(websiteId: string): Promise<WebsiteLookup> {
  if (!isWebsiteId(websiteId)) {
    return { ok: false, error: "Website ID is invalid." };
  }

  const website = await getWebsiteById(websiteId);
  if (!website) {
    return { ok: false, error: "That website could not be found." };
  }

  return { ok: true, website };
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    "name" in value
  );
}

export async function listWebsiteMediaAction(
  websiteId: string,
): Promise<ListWebsiteMediaResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  const found = await requireWebsite(websiteId);
  if (!found.ok) {
    return { ok: false, error: found.error };
  }

  const media = await listWebsiteMedia(websiteId);
  return { ok: true, media };
}

export async function uploadWebsiteMediaAction(
  websiteId: string,
  formData: FormData,
): Promise<UploadWebsiteMediaResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  const found = await requireWebsite(websiteId);
  if (!found.ok) {
    return { ok: false, error: found.error };
  }

  const file = formData.get("file");
  if (!isUploadedFile(file)) {
    return { ok: false, error: "Choose a JPEG, PNG, or WebP image to upload." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const planned = planWebsiteMediaUpload({
    originalName: file.name || "image",
    size: file.size,
    bytes,
    id: crypto.randomUUID(),
  });
  if (!planned.ok) {
    return { ok: false, error: planned.error };
  }

  const storage = await getWebsiteMediaStorage();

  try {
    const media = await writeWebsiteMediaThenRecord(
      storage,
      websiteId,
      planned.plan.storedFilename,
      bytes,
      () =>
        createWebsiteMedia({
          id: planned.plan.id,
          websiteId,
          originalFilename: planned.plan.originalFilename,
          storedFilename: planned.plan.storedFilename,
          mimeType: planned.plan.mimeType,
          fileSize: planned.plan.fileSize,
        }),
    );
    return { ok: true, media };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("MEDIA_KV")) {
      return {
        ok: false,
        error: "Media storage is unavailable.",
      };
    }
    return { ok: false, error: "That image could not be saved." };
  }
}

export async function deleteWebsiteMediaAction(
  websiteId: string,
  mediaId: string,
): Promise<DeleteWebsiteMediaResult> {
  const denied = await getAdminActionError();
  if (denied) {
    return { ok: false, error: denied };
  }

  const found = await requireWebsite(websiteId);
  if (!found.ok) {
    return { ok: false, error: found.error };
  }

  if (!isWebsiteId(mediaId)) {
    return { ok: false, error: "That image could not be found." };
  }

  const media = await getWebsiteMediaForWebsite(websiteId, mediaId);
  const deniedDelete = getDeleteWebsiteMediaDenial({
    adminError: null,
    websiteExists: true,
    mediaBelongsToWebsite: Boolean(media),
    referenced: media
      ? await websiteMediaIsReferenced(websiteId, mediaId)
      : false,
  });
  if (deniedDelete) {
    return { ok: false, error: deniedDelete };
  }
  if (!media) {
    return { ok: false, error: "That image could not be found." };
  }

  const storage = await getWebsiteMediaStorage();
  try {
    await deleteWebsiteMediaRecordThenObject(
      storage,
      websiteId,
      media.storedFilename,
      async () => {
        const deleted = await deleteWebsiteMediaForWebsite(websiteId, mediaId);
        if (!deleted) {
          throw new Error("Media metadata was not deleted.");
        }
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("MEDIA_KV")) {
      return { ok: false, error: "Media storage is unavailable." };
    }
    return { ok: false, error: "That image could not be deleted." };
  }

  return { ok: true };
}
