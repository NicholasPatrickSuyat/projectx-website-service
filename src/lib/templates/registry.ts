import type {
  ServiceWebsiteContent,
  TemplateDefinition,
  TemplateId,
} from "@/lib/templates/types";
import { PEAK_HEATING_AIR_DEMO } from "@/lib/templates/demo-content/peak-heating-air";

export const SERVICE_MODERN_01_ID = "service-modern-01" as const satisfies TemplateId;

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: SERVICE_MODERN_01_ID,
    displayName: "Service Modern 01",
    category: "SERVICE_BUSINESS",
    categoryLabel: "Service Business",
    description:
      "A premium single-page website for local service businesses such as HVAC, plumbing, and electrical.",
    status: "Available",
    previewPath: "/templates/service-modern-01/preview",
    editPath: "/templates/service-modern-01/edit",
    capabilities: [
      "hero",
      "services",
      "about",
      "whyChooseUs",
      "gallery",
      "testimonials",
      "serviceAreas",
      "faq",
      "contact",
    ],
  },
];

export function listTemplates(): TemplateDefinition[] {
  return TEMPLATE_REGISTRY;
}

export function getTemplate(id: string): TemplateDefinition | null {
  return TEMPLATE_REGISTRY.find((template) => template.id === id) ?? null;
}

export function getTemplateDemoContent(id: string): ServiceWebsiteContent | null {
  if (id === SERVICE_MODERN_01_ID) {
    return PEAK_HEATING_AIR_DEMO;
  }

  return null;
}
