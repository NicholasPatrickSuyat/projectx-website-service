import "server-only";
import { getDb } from "@/lib/db";
import { getWebsiteById } from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";
import { HOSTNAME_MAX_PER_WEBSITE } from "@/lib/website-domains/hostname";
import {
  mapWebsiteDomainRow,
  type WebsiteDomain,
  type WebsiteDomainRow,
} from "@/lib/website-domains/types";

const DOMAIN_COLUMNS = `
  id,
  website_id,
  hostname,
  created_at,
  updated_at
`;

function isUniqueConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique/i.test(message);
}

export async function listWebsiteDomains(
  websiteId: string,
): Promise<WebsiteDomain[]> {
  if (!isWebsiteId(websiteId)) {
    return [];
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT ${DOMAIN_COLUMNS}
       FROM website_domains
       WHERE website_id = ?
       ORDER BY hostname ASC`,
    )
    .bind(websiteId)
    .all<WebsiteDomainRow>();

  return (result.results ?? []).map(mapWebsiteDomainRow);
}

export async function countWebsiteDomains(websiteId: string): Promise<number> {
  if (!isWebsiteId(websiteId)) {
    return 0;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS total
       FROM website_domains
       WHERE website_id = ?`,
    )
    .bind(websiteId)
    .first<{ total: number | string }>();

  return Number(row?.total ?? 0);
}

export async function getWebsiteDomainByHostname(
  hostname: string,
): Promise<WebsiteDomain | null> {
  if (!hostname) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${DOMAIN_COLUMNS}
       FROM website_domains
       WHERE hostname = ?`,
    )
    .bind(hostname)
    .first<WebsiteDomainRow>();

  return row ? mapWebsiteDomainRow(row) : null;
}

export async function getWebsiteDomainForWebsite(
  websiteId: string,
  domainId: string,
): Promise<WebsiteDomain | null> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(domainId)) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT ${DOMAIN_COLUMNS}
       FROM website_domains
       WHERE id = ? AND website_id = ?`,
    )
    .bind(domainId, websiteId)
    .first<WebsiteDomainRow>();

  return row ? mapWebsiteDomainRow(row) : null;
}

export async function addWebsiteDomain(
  websiteId: string,
  hostname: string,
): Promise<WebsiteDomain> {
  const website = await getWebsiteById(websiteId);
  if (!website) {
    throw new Error("WEBSITE_NOT_FOUND");
  }

  const existingCount = await countWebsiteDomains(websiteId);
  if (existingCount >= HOSTNAME_MAX_PER_WEBSITE) {
    throw new Error("WEBSITE_DOMAIN_LIMIT");
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  try {
    await db
      .prepare(
        `INSERT INTO website_domains (
          id,
          website_id,
          hostname,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, websiteId, hostname, now, now)
      .run();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("WEBSITE_DOMAIN_CONFLICT");
    }
    throw error;
  }

  const created = await getWebsiteDomainForWebsite(websiteId, id);
  if (!created) {
    throw new Error("WEBSITE_NOT_FOUND");
  }

  return created;
}

export async function removeWebsiteDomain(
  websiteId: string,
  domainId: string,
): Promise<boolean> {
  if (!isWebsiteId(websiteId) || !isWebsiteId(domainId)) {
    return false;
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `DELETE FROM website_domains
       WHERE id = ? AND website_id = ?`,
    )
    .bind(domainId, websiteId)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}
