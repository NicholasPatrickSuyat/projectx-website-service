import type { WebsiteRecordStatus } from "../domain";
import type { TemplateId } from "@/lib/templates/types";

export type Website = {
  id: string;
  clientId: string;
  templateId: TemplateId;
  name: string;
  status: WebsiteRecordStatus;
  contentJson: string;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteListItem = Website & {
  clientBusinessName: string;
};

export type WebsiteCreateInput = {
  clientId: string;
  templateId: TemplateId;
  name: string;
  contentJson: string;
  reviewHtml: string;
};

export type WebsiteRow = {
  id: string;
  client_id: string;
  template_id: string;
  name: string;
  status: string;
  content_json: string;
  created_at: string;
  updated_at: string;
};

export type WebsiteListRow = WebsiteRow & {
  client_business_name: string;
};

export function mapWebsiteRow(row: WebsiteRow): Website {
  return {
    id: row.id,
    clientId: row.client_id,
    templateId: row.template_id as TemplateId,
    name: row.name,
    status: row.status as WebsiteRecordStatus,
    contentJson: row.content_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWebsiteListRow(row: WebsiteListRow): WebsiteListItem {
  return {
    ...mapWebsiteRow(row),
    clientBusinessName: row.client_business_name,
  };
}

export function defaultWebsiteName(businessName: string): string {
  const trimmed = businessName.trim();
  return trimmed ? `${trimmed} Website` : "Website";
}

export function getSavedWebsitePreviewPath(websiteId: string) {
  return `/site/${websiteId}`;
}
