import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/lib/db";
import type { WebsiteRecordStatus } from "@/lib/domain";
import {
  mapWebsiteVersionRow,
  mapWebsiteVersionSummaryRow,
  type WebsiteVersion,
  type WebsiteVersionRow,
  type WebsiteVersionSummary,
  type WebsiteVersionSummaryRow,
} from "@/lib/website-versions/types";
import { isWebsiteId } from "@/lib/websites/validation";

const VERSION_COLUMNS = `
  id,
  website_id,
  version_number,
  content_json,
  website_status,
  created_at
`;

const VERSION_SUMMARY_COLUMNS = `
  id,
  website_id,
  version_number,
  website_status,
  created_at
`;

export type WebsiteVersionInsert = {
  id: string;
  websiteId: string;
  contentJson: string;
  websiteStatus: WebsiteRecordStatus;
  createdAt: string;
  versionNumber?: number;
};

export function prepareInsertWebsiteVersion(
  db: D1Database,
  input: WebsiteVersionInsert,
) {
  if (input.versionNumber != null) {
    return db
      .prepare(
        `INSERT INTO website_versions (
          id,
          website_id,
          version_number,
          content_json,
          website_status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.websiteId,
        input.versionNumber,
        input.contentJson,
        input.websiteStatus,
        input.createdAt,
      );
  }

  return db
    .prepare(
      `INSERT INTO website_versions (
        id,
        website_id,
        version_number,
        content_json,
        website_status,
        created_at
      )
      SELECT ?, ?, COALESCE((
        SELECT MAX(version_number)
        FROM website_versions
        WHERE website_id = ?
      ), 0) + 1, ?, ?, ?`,
    )
    .bind(
      input.id,
      input.websiteId,
      input.websiteId,
      input.contentJson,
      input.websiteStatus,
      input.createdAt,
    );
}

export async function listWebsiteVersions(
  websiteId: string,
): Promise<WebsiteVersionSummary[]> {
  if (!isWebsiteId(websiteId)) {
    return [];
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT ${VERSION_SUMMARY_COLUMNS}
       FROM website_versions
       WHERE website_id = ?
       ORDER BY version_number DESC`,
    )
    .bind(websiteId)
    .all<WebsiteVersionSummaryRow>();

  return (result.results ?? []).map(mapWebsiteVersionSummaryRow);
}

export async function getWebsiteVersionById(
  id: string,
): Promise<WebsiteVersion | null> {
  if (!isWebsiteId(id)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${VERSION_COLUMNS} FROM website_versions WHERE id = ?`)
    .bind(id)
    .first<WebsiteVersionRow>();

  return row ? mapWebsiteVersionRow(row) : null;
}

export async function getWebsiteVersionForWebsite(
  websiteId: string,
  versionId: string,
): Promise<WebsiteVersion | null> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(versionId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${VERSION_COLUMNS}
       FROM website_versions
       WHERE id = ? AND website_id = ?`,
    )
    .bind(versionId, websiteId)
    .first<WebsiteVersionRow>();

  return row ? mapWebsiteVersionRow(row) : null;
}
