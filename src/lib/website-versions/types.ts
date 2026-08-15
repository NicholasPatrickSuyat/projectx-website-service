import type { WebsiteRecordStatus } from "@/lib/domain";
import type { WebsiteContent } from "@/lib/templates/types";

export type WebsiteVersionSummary = {
  id: string;
  websiteId: string;
  versionNumber: number;
  websiteStatus: WebsiteRecordStatus;
  createdAt: string;
};

export type WebsiteVersion = WebsiteVersionSummary & {
  contentJson: string;
};

export type ParsedWebsiteVersion = WebsiteVersionSummary & {
  content: WebsiteContent;
};

export type WebsiteVersionRow = {
  id: string;
  website_id: string;
  version_number: number;
  content_json: string;
  website_status: string;
  created_at: string;
};

export type WebsiteVersionSummaryRow = Omit<WebsiteVersionRow, "content_json">;

export function mapWebsiteVersionSummaryRow(
  row: WebsiteVersionSummaryRow,
): WebsiteVersionSummary {
  return {
    id: row.id,
    websiteId: row.website_id,
    versionNumber: row.version_number,
    websiteStatus: row.website_status as WebsiteRecordStatus,
    createdAt: row.created_at,
  };
}

export function mapWebsiteVersionRow(row: WebsiteVersionRow): WebsiteVersion {
  return {
    ...mapWebsiteVersionSummaryRow(row),
    contentJson: row.content_json,
  };
}

export function formatVersionSavedAt(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `Saved ${datePart} at ${timePart}`;
}
