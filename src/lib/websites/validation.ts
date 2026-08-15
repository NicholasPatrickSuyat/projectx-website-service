import {
  WEBSITE_RECORD_STATUSES,
  getWebsiteStatusTransitions,
  type WebsiteRecordStatus,
} from "@/lib/domain";
import {
  isRestaurantTemplateId,
  isServiceTemplateId,
} from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

export const WEBSITE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const WEBSITE_NAME_MAX = 120;

export function isWebsiteId(value: string): boolean {
  return WEBSITE_ID_PATTERN.test(value);
}

export function isWebsiteRecordStatus(
  value: string,
): value is WebsiteRecordStatus {
  return WEBSITE_RECORD_STATUSES.includes(value as WebsiteRecordStatus);
}

export function isWebsiteTemplateId(value: string): value is TemplateId {
  return isServiceTemplateId(value) || isRestaurantTemplateId(value);
}

export function canTransitionWebsiteStatus(
  from: WebsiteRecordStatus,
  to: WebsiteRecordStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return getWebsiteStatusTransitions(from).includes(to);
}

export type CreateWebsiteFieldErrors = Partial<{
  clientId: string;
  templateId: string;
  name: string;
}>;

export type CreateWebsiteInput = {
  clientId: string;
  templateId: TemplateId;
  name: string;
};

export type CreateWebsiteValidationResult =
  | { ok: true; data: CreateWebsiteInput }
  | { ok: false; error: string; fieldErrors: CreateWebsiteFieldErrors };

function readRequired(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateWebsiteInput(
  formData: FormData,
): CreateWebsiteValidationResult {
  const fieldErrors: CreateWebsiteFieldErrors = {};
  const clientId = readRequired(formData.get("clientId"));
  const templateId = readRequired(formData.get("templateId"));
  const name = readRequired(formData.get("name"));

  if (!isWebsiteId(clientId)) {
    fieldErrors.clientId = "Client ID is invalid.";
  }

  if (!isWebsiteTemplateId(templateId)) {
    fieldErrors.templateId = "Choose an available website template.";
  }

  if (!name) {
    fieldErrors.name = "Website name is required.";
  } else if (name.length > WEBSITE_NAME_MAX) {
    fieldErrors.name = `Website name must be ${WEBSITE_NAME_MAX} characters or fewer.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      clientId,
      templateId: templateId as TemplateId,
      name,
    },
  };
}
