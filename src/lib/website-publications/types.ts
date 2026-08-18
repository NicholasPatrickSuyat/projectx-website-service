import type { TemplateId } from "@/lib/templates/types";

export type WebsitePublicationSummary = {
  id: string;
  websiteId: string;
  publicationNumber: number;
  templateId: TemplateId;
  publishedAt: string;
  createdAt: string;
  isActive: boolean;
};

export type WebsitePublication = WebsitePublicationSummary & {
  contentJson: string;
};

export type WebsitePublicationRow = {
  id: string;
  website_id: string;
  publication_number: number;
  template_id: string;
  content_json: string;
  published_at: string;
  created_at: string;
};

export type WebsitePublicationSummaryRow = Omit<
  WebsitePublicationRow,
  "content_json"
> & {
  is_active?: number | boolean | null;
};

export function mapWebsitePublicationSummaryRow(
  row: WebsitePublicationSummaryRow,
): WebsitePublicationSummary {
  return {
    id: row.id,
    websiteId: row.website_id,
    publicationNumber: row.publication_number,
    templateId: row.template_id as TemplateId,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    isActive: Boolean(row.is_active),
  };
}

export function mapWebsitePublicationRow(
  row: WebsitePublicationRow,
): WebsitePublication {
  return {
    ...mapWebsitePublicationSummaryRow(row),
    contentJson: row.content_json,
  };
}

export function getPublishedWebsitePreviewPath(websiteId: string) {
  return `/published/${websiteId}`;
}

export function formatPublicationPublishedAt(iso: string): string {
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

  return `Published ${datePart} at ${timePart}`;
}
