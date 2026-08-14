import { SERVICE_MODERN_01_ID } from "@/lib/templates/registry";
import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { ServiceModern01 } from "@/components/website-templates/service-modern-01/ServiceModern01";

export function renderTemplate(id: string, content: ServiceWebsiteContent) {
  if (id === SERVICE_MODERN_01_ID) {
    return <ServiceModern01 content={content} />;
  }

  return null;
}
