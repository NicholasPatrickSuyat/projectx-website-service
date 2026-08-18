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

const PUBLICATION_COLUMNS_P = `
  p.id,
  p.website_id,
  p.publication_number,
  p.template_id,
  p.content_json,
  p.published_at,
  p.created_at
`;

const PUBLICATION_SUMMARY_COLUMNS = `
  p.id,
  p.website_id,
  p.publication_number,
  p.template_id,
  p.published_at,
  p.created_at,
  CASE WHEN p.id = w.active_publication_id THEN 1 ELSE 0 END AS is_active
`;

export type WebsitePublishResult = {
  website: Website;
  publication: WebsitePublication;
};

export type WebsitePublishSnapshot = {
  publicHtml: string;
  contentJson: string;
  templateId: string;
};

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique/i.test(message);
}

function asPublicationFailure(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message.startsWith("WEBSITE_")) {
    return error;
  }
  return new Error(fallback);
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
       FROM website_publications p
       INNER JOIN websites w ON w.id = p.website_id
       WHERE p.website_id = ?
       ORDER BY p.publication_number DESC`,
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

export async function getActiveWebsitePublication(
  websiteId: string,
): Promise<WebsitePublication | null> {
  if (!isWebsiteId(websiteId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${PUBLICATION_COLUMNS_P}
       FROM websites w
       INNER JOIN website_publications p ON p.id = w.active_publication_id
       WHERE w.id = ? AND p.website_id = w.id`,
    )
    .bind(websiteId)
    .first<WebsitePublicationRow>();

  return row ? mapWebsitePublicationRow(row) : null;
}

export async function getActivePublicationPublicHtmlByHostname(
  hostname: string,
): Promise<string | null> {
  if (!hostname) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT p.public_html AS public_html
       FROM website_domains d
       INNER JOIN websites w ON w.id = d.website_id
       INNER JOIN website_publications p ON p.id = w.active_publication_id
       WHERE d.hostname = ?
         AND p.website_id = w.id
         AND length(p.public_html) > 0`,
    )
    .bind(hostname)
    .first<{ public_html: string }>();

  const html = row?.public_html?.trim() ?? "";
  return html || null;
}

export async function publishWebsite(
  id: string,
  snapshot: WebsitePublishSnapshot,
): Promise<WebsitePublishResult | null> {
  const existing = await getWebsiteById(id);
  if (!existing) {
    return null;
  }

  if (existing.status !== "READY_TO_PUBLISH") {
    throw new Error("WEBSITE_NOT_READY_TO_PUBLISH");
  }

  const html = snapshot.publicHtml.trim();
  const contentJson = snapshot.contentJson.trim();
  const templateId = snapshot.templateId.trim();
  if (!html || !contentJson || !templateId) {
    throw new Error("WEBSITE_PUBLICATION_HTML_FAILED");
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
            public_html,
            published_at,
            created_at
          )
          SELECT ?, w.id, COALESCE((
            SELECT MAX(publication_number)
            FROM website_publications
            WHERE website_id = w.id
          ), 0) + 1, ?, ?, ?, ?, ?
          FROM websites w
          WHERE w.id = ? AND w.status = 'READY_TO_PUBLISH'`,
        )
        .bind(
          publicationId,
          templateId,
          contentJson,
          html,
          now,
          now,
          id,
        ),
      db
        .prepare(
          `UPDATE websites
           SET status = 'PUBLISHED',
               active_publication_id = ?,
               updated_at = ?
           WHERE id = ?
             AND status = 'READY_TO_PUBLISH'
             AND EXISTS (
               SELECT 1
               FROM website_publications p
               WHERE p.id = ?
                 AND p.website_id = websites.id
                 AND length(p.public_html) > 0
             )`,
        )
        .bind(publicationId, now, id, publicationId),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("WEBSITE_PUBLICATION_CONFLICT");
    }
    throw asPublicationFailure(error, "WEBSITE_PUBLICATION_CONFLICT");
  }

  const website = await getWebsiteById(id);
  const publication = await getWebsitePublicationById(publicationId);
  const pointer = await db
    .prepare(
      `SELECT active_publication_id, status
       FROM websites
       WHERE id = ?`,
    )
    .bind(id)
    .first<{ active_publication_id: string | null; status: string }>();

  if (
    !website ||
    website.status !== "PUBLISHED" ||
    !publication ||
    pointer?.status !== "PUBLISHED" ||
    pointer.active_publication_id !== publicationId
  ) {
    throw new Error("WEBSITE_NOT_READY_TO_PUBLISH");
  }

  return { website, publication };
}

export async function activateWebsitePublication(
  websiteId: string,
  publicationId: string,
): Promise<WebsitePublication | null> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(publicationId)) {
    return null;
  }

  const publication = await getWebsitePublicationForWebsite(
    websiteId,
    publicationId,
  );
  if (!publication) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();

  try {
    const result = await db
      .prepare(
        `UPDATE websites
         SET active_publication_id = ?, updated_at = ?
         WHERE id = ?
           AND EXISTS (
             SELECT 1
             FROM website_publications p
             WHERE p.id = ?
               AND p.website_id = websites.id
               AND length(p.public_html) > 0
           )`,
      )
      .bind(publicationId, now, websiteId, publicationId)
      .run();

    if ((result.meta?.changes ?? 0) !== 1) {
      throw new Error("WEBSITE_PUBLICATION_HTML_MISSING");
    }
  } catch (error) {
    throw asPublicationFailure(error, "WEBSITE_PUBLICATION_ACTIVATE_FAILED");
  }

  return publication;
}
