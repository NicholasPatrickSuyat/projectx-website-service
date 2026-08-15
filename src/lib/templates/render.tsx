import { RestaurantModern01 } from "@/components/website-templates/restaurant-modern-01/RestaurantModern01";
import { ServiceModern01 } from "@/components/website-templates/service-modern-01/ServiceModern01";
import {
  isRestaurantTemplateId,
  isServiceTemplateId,
} from "@/lib/templates/registry";
import type { WebsiteContent } from "@/lib/templates/types";
import {
  isRestaurantWebsiteContent,
  isServiceWebsiteContent,
} from "@/lib/templates/types";

export function renderTemplate(id: string, content: WebsiteContent) {
  if (isServiceTemplateId(id) && isServiceWebsiteContent(content)) {
    return <ServiceModern01 content={content} />;
  }

  if (isRestaurantTemplateId(id) && isRestaurantWebsiteContent(content)) {
    return <RestaurantModern01 content={content} />;
  }

  return null;
}
