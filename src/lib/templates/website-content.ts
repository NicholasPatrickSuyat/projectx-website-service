import {
  isRestaurantTemplateId,
  isSalonTemplateId,
  isServiceTemplateId,
} from "@/lib/templates/registry";
import {
  syncSharedContactFields,
  validateContent,
  type EditorErrors,
} from "@/lib/templates/editor";
import {
  syncRestaurantSharedFields,
  validateRestaurantContent,
} from "@/lib/templates/restaurant-editor";
import {
  syncSalonSharedFields,
  validateSalonContent,
} from "@/lib/templates/salon-editor";
import type {
  TemplateId,
  WebsiteContent,
} from "@/lib/templates/types";
import {
  isRestaurantWebsiteContent,
  isSalonWebsiteContent,
  isServiceWebsiteContent,
} from "@/lib/templates/types";

export function syncWebsiteContent(
  templateId: TemplateId,
  content: WebsiteContent,
): WebsiteContent {
  if (isServiceTemplateId(templateId) && isServiceWebsiteContent(content)) {
    return syncSharedContactFields(content);
  }
  if (isRestaurantTemplateId(templateId) && isRestaurantWebsiteContent(content)) {
    return syncRestaurantSharedFields(content);
  }
  if (isSalonTemplateId(templateId) && isSalonWebsiteContent(content)) {
    return syncSalonSharedFields(content);
  }
  return content;
}

export function validateWebsiteContent(
  templateId: TemplateId,
  content: WebsiteContent,
): EditorErrors {
  if (isServiceTemplateId(templateId) && isServiceWebsiteContent(content)) {
    return validateContent(content);
  }
  if (isRestaurantTemplateId(templateId) && isRestaurantWebsiteContent(content)) {
    return validateRestaurantContent(content);
  }
  if (isSalonTemplateId(templateId) && isSalonWebsiteContent(content)) {
    return validateSalonContent(content);
  }
  return { content: "Website content does not match this template." };
}
