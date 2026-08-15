import { getDb } from "@/lib/db";
import type { WebsiteRecordStatus } from "@/lib/domain";
import {
  getWebsiteVersionById,
  prepareInsertWebsiteVersion,
} from "@/lib/website-versions/repository";
import {
  mapWebsiteListRow,
  mapWebsiteRow,
  type Website,
  type WebsiteCreateInput,
  type WebsiteListItem,
  type WebsiteListRow,
  type WebsiteRow,
} from "@/lib/websites/types";

const WEBSITE_COLUMNS = `
  id,
  client_id,
  template_id,
  name,
  status,
  content_json,
  created_at,
  updated_at
`;

export type WebsiteContentSaveResult = {
  website: Website;
  versionNumber: number | null;
  contentChanged: boolean;
};

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique/i.test(message);
}

export async function listWebsites(): Promise<WebsiteListItem[]> {
  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT
        w.id,
        w.client_id,
        w.template_id,
        w.name,
        w.status,
        w.content_json,
        w.created_at,
        w.updated_at,
        c.business_name AS client_business_name
      FROM websites w
      INNER JOIN clients c ON c.id = w.client_id
      ORDER BY w.updated_at DESC, w.name COLLATE NOCASE ASC`,
    )
    .all<WebsiteListRow>();

  return (result.results ?? []).map(mapWebsiteListRow);
}

export async function getWebsiteById(id: string): Promise<Website | null> {
  if (!id) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${WEBSITE_COLUMNS} FROM websites WHERE id = ?`)
    .bind(id)
    .first<WebsiteRow>();

  return row ? mapWebsiteRow(row) : null;
}

export async function getWebsiteForClient(
  clientId: string,
): Promise<Website | null> {
  if (!clientId) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${WEBSITE_COLUMNS} FROM websites WHERE client_id = ?`)
    .bind(clientId)
    .first<WebsiteRow>();

  return row ? mapWebsiteRow(row) : null;
}

export async function createWebsite(
  input: WebsiteCreateInput,
): Promise<Website> {
  const existing = await getWebsiteForClient(input.clientId);
  if (existing) {
    throw new Error("WEBSITE_ALREADY_EXISTS");
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const versionId = crypto.randomUUID();

  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO websites (
            id,
            client_id,
            template_id,
            name,
            status,
            content_json,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?)`,
        )
        .bind(
          id,
          input.clientId,
          input.templateId,
          input.name,
          input.contentJson,
          now,
          now,
        ),
      prepareInsertWebsiteVersion(db, {
        id: versionId,
        websiteId: id,
        versionNumber: 1,
        contentJson: input.contentJson,
        websiteStatus: "DRAFT",
        createdAt: now,
      }),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("WEBSITE_ALREADY_EXISTS");
    }
    throw error;
  }

  const created = await getWebsiteById(id);
  if (!created) {
    throw new Error("Website was created but could not be loaded.");
  }

  return created;
}

export async function updateWebsiteContent(
  id: string,
  contentJson: string,
): Promise<WebsiteContentSaveResult | null> {
  const existing = await getWebsiteById(id);
  if (!existing) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const versionId = crypto.randomUUID();

  try {
    await db.batch([
      db
        .prepare(
          "UPDATE websites SET content_json = ?, updated_at = ? WHERE id = ?",
        )
        .bind(contentJson, now, id),
      prepareInsertWebsiteVersion(db, {
        id: versionId,
        websiteId: id,
        contentJson,
        websiteStatus: existing.status,
        createdAt: now,
      }),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("WEBSITE_VERSION_CONFLICT");
    }
    throw error;
  }

  const website = await getWebsiteById(id);
  if (!website) {
    throw new Error("Website was saved but could not be loaded.");
  }

  const version = await getWebsiteVersionById(versionId);

  return {
    website,
    versionNumber: version?.versionNumber ?? null,
    contentChanged: true,
  };
}

export async function updateWebsiteStatus(
  id: string,
  status: WebsiteRecordStatus,
): Promise<Website | null> {
  const existing = await getWebsiteById(id);
  if (!existing) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .prepare("UPDATE websites SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now, id)
    .run();

  return getWebsiteById(id);
}
