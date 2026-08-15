import { getDb } from "@/lib/db";
import { getWebsiteById } from "@/lib/websites/repository";
import type { Website } from "@/lib/websites/types";
import { isWebsiteId } from "@/lib/websites/validation";
import {
  mapWebsitePublicationRow,
  mapWebsitePublicationSummaryRow,
  type WebsitePublication,
  type WebsitePublicationRow,
  type WebsitePublicationSummary,
  type WebsitePublicationSummaryRow,
} from "@/lib/website-publications/types";

const PUBLICATION_COLUMNS = `
  id,
  website_id,
  publication_number,
  template_id,
  content_json,
  published_at,
  created_at
`;

const PUBLICATION_SUMMARY_COLUMNS = `
  id,
  website_id,
  publication_number,
  template_id,
  published_at,
  created_at
`;

export type WebsitePublishResult = {
  website: Website;
  publication: WebsitePublication;
};

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique/i.test(message);
}

export async function listWebsitePublications(
  websiteId: string,
): Promise<WebsitePublicationSummary[]> {
  if (!isWebsiteId(websiteId)) {
    return [];
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT ${PUBLICATION_SUMMARY_COLUMNS}
       FROM website_publications
       WHERE website_id = ?
       ORDER BY publication_number DESC`,
    )
    .bind(websiteId)
    .all<WebsitePublicationSummaryRow>();

  return (result.results ?? []).map(mapWebsitePublicationSummaryRow);
}

export async function getWebsitePublicationById(
  id: string,
): Promise<WebsitePublication | null> {
  if (!isWebsiteId(id)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${PUBLICATION_COLUMNS} FROM website_publications WHERE id = ?`,
    )
    .bind(id)
    .first<WebsitePublicationRow>();

  return row ? mapWebsitePublicationRow(row) : null;
}

export async function getWebsitePublicationForWebsite(
  websiteId: string,
  publicationId: string,
): Promise<WebsitePublication | null> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(publicationId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${PUBLICATION_COLUMNS}
       FROM website_publications
       WHERE id = ? AND website_id = ?`,
    )
    .bind(publicationId, websiteId)
    .first<WebsitePublicationRow>();

  return row ? mapWebsitePublicationRow(row) : null;
}

export async function getLatestWebsitePublication(
  websiteId: string,
): Promise<WebsitePublication | null> {
  if (!isWebsiteId(websiteId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${PUBLICATION_COLUMNS}
       FROM website_publications
       WHERE website_id = ?
       ORDER BY publication_number DESC
       LIMIT 1`,
    )
    .bind(websiteId)
    .first<WebsitePublicationRow>();

  return row ? mapWebsitePublicationRow(row) : null;
}

export async function publishWebsite(
  id: string,
): Promise<WebsitePublishResult | null> {
  const existing = await getWebsiteById(id);
  if (!existing) {
    return null;
  }

  if (existing.status !== "READY_TO_PUBLISH") {
    throw new Error("WEBSITE_NOT_READY_TO_PUBLISH");
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const publicationId = crypto.randomUUID();

  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO website_publications (
            id,
            website_id,
            publication_number,
            template_id,
            content_json,
            published_at,
            created_at
          )
          SELECT ?, w.id, COALESCE((
            SELECT MAX(publication_number)
            FROM website_publications
            WHERE website_id = w.id
          ), 0) + 1, w.template_id, w.content_json, ?, ?
          FROM websites w
          WHERE w.id = ? AND w.status = 'READY_TO_PUBLISH'`,
        )
        .bind(publicationId, now, now, id),
      db
        .prepare(
          `UPDATE websites
           SET status = 'PUBLISHED', updated_at = ?
           WHERE id = ? AND status = 'READY_TO_PUBLISH'`,
        )
        .bind(now, id),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("WEBSITE_PUBLICATION_CONFLICT");
    }
    throw error;
  }

  const website = await getWebsiteById(id);
  const publication = await getWebsitePublicationById(publicationId);

  if (!website || website.status !== "PUBLISHED" || !publication) {
    throw new Error("WEBSITE_NOT_READY_TO_PUBLISH");
  }

  return { website, publication };
}
