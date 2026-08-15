import { getDb } from "@/lib/db";
import { getWebsiteMediaPublicPath } from "@/lib/website-media/paths";
import {
  isWebsiteMediaMimeType,
  type WebsiteMedia,
  type WebsiteMediaMimeType,
  type WebsiteMediaRow,
} from "@/lib/website-media/types";
import { isWebsiteId } from "@/lib/websites/validation";

const MEDIA_COLUMNS = `
  id,
  website_id,
  original_filename,
  stored_filename,
  mime_type,
  file_size,
  created_at
`;

export type WebsiteMediaCreateInput = {
  id: string;
  websiteId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: WebsiteMediaMimeType;
  fileSize: number;
};

function mapWebsiteMediaRow(row: WebsiteMediaRow): WebsiteMedia {
  if (!isWebsiteMediaMimeType(row.mime_type)) {
    throw new Error("Stored media has an unsupported MIME type.");
  }

  return {
    id: row.id,
    websiteId: row.website_id,
    originalFilename: row.original_filename,
    storedFilename: row.stored_filename,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
    publicPath: getWebsiteMediaPublicPath(row.id),
  };
}

export async function listWebsiteMedia(
  websiteId: string,
): Promise<WebsiteMedia[]> {
  if (!isWebsiteId(websiteId)) {
    return [];
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT ${MEDIA_COLUMNS}
       FROM website_media
       WHERE website_id = ?
       ORDER BY created_at DESC, original_filename COLLATE NOCASE ASC`,
    )
    .bind(websiteId)
    .all<WebsiteMediaRow>();

  return (result.results ?? []).map(mapWebsiteMediaRow);
}

export async function getWebsiteMediaById(
  mediaId: string,
): Promise<WebsiteMedia | null> {
  if (!isWebsiteId(mediaId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${MEDIA_COLUMNS} FROM website_media WHERE id = ?`)
    .bind(mediaId)
    .first<WebsiteMediaRow>();

  return row ? mapWebsiteMediaRow(row) : null;
}

export async function getWebsiteMediaForWebsite(
  websiteId: string,
  mediaId: string,
): Promise<WebsiteMedia | null> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(mediaId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${MEDIA_COLUMNS}
       FROM website_media
       WHERE id = ? AND website_id = ?`,
    )
    .bind(mediaId, websiteId)
    .first<WebsiteMediaRow>();

  return row ? mapWebsiteMediaRow(row) : null;
}

export async function createWebsiteMedia(
  input: WebsiteMediaCreateInput,
): Promise<WebsiteMedia> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO website_media (
        id,
        website_id,
        original_filename,
        stored_filename,
        mime_type,
        file_size,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.websiteId,
      input.originalFilename,
      input.storedFilename,
      input.mimeType,
      input.fileSize,
      now,
    )
    .run();

  const created = await getWebsiteMediaById(input.id);
  if (!created) {
    throw new Error("Media was saved but could not be loaded.");
  }

  return created;
}
