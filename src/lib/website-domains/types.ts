export type WebsiteDomain = {
  id: string;
  websiteId: string;
  hostname: string;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteDomainRow = {
  id: string;
  website_id: string;
  hostname: string;
  created_at: string;
  updated_at: string;
};

export function mapWebsiteDomainRow(row: WebsiteDomainRow): WebsiteDomain {
  return {
    id: row.id,
    websiteId: row.website_id,
    hostname: row.hostname,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
