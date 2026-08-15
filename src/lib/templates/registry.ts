import type { ClientCategory } from "@/lib/domain";
import type {
  TemplateDefinition,
  TemplateId,
  WebsiteContent,
} from "@/lib/templates/types";
import { EMBER_AND_OLIVE_DEMO } from "@/lib/templates/demo-content/ember-and-olive";
import { PEAK_HEATING_AIR_DEMO } from "@/lib/templates/demo-content/peak-heating-air";
import { ROWAN_ATELIER_DEMO } from "@/lib/templates/demo-content/rowan-atelier";

export const SERVICE_MODERN_01_ID = "service-modern-01" as const satisfies TemplateId;
export const RESTAURANT_MODERN_01_ID =
  "restaurant-modern-01" as const satisfies TemplateId;
export const SALON_MODERN_01_ID = "salon-modern-01" as const satisfies TemplateId;

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
  {
    id: RESTAURANT_MODERN_01_ID,
    displayName: "Restaurant Modern 01",
    category: "RESTAURANT_FOOD",
    categoryLabel: "Restaurant / Food",
    description:
      "A warm, food-focused single-page website for neighborhood restaurants, with a structured menu and reservation CTA.",
    status: "Available",
    previewPath: "/templates/restaurant-modern-01/preview",
    editPath: "/templates/restaurant-modern-01/edit",
    capabilities: [
      "hero",
      "menu",
      "featured",
      "about",
      "gallery",
      "testimonials",
      "location",
      "faq",
      "reservationCta",
    ],
  },
  {
    id: SALON_MODERN_01_ID,
    displayName: "Salon Modern 01",
    category: "SALON_BEAUTY",
    categoryLabel: "Salon / Beauty",
    description:
      "An editorial, image-forward single-page website for salons, barbers, nail studios, and appointment-based beauty businesses.",
    status: "Available",
    previewPath: "/templates/salon-modern-01/preview",
    editPath: "/templates/salon-modern-01/edit",
    capabilities: [
      "hero",
      "services",
      "about",
      "team",
      "gallery",
      "testimonials",
      "location",
      "faq",
      "bookingCta",
    ],
  },
];

export function listTemplates(): TemplateDefinition[] {
  return TEMPLATE_REGISTRY;
}

export function getTemplate(id: string): TemplateDefinition | null {
  return TEMPLATE_REGISTRY.find((template) => template.id === id) ?? null;
}

export function isServiceTemplateId(
  id: string,
): id is typeof SERVICE_MODERN_01_ID {
  return id === SERVICE_MODERN_01_ID;
}

export function isRestaurantTemplateId(
  id: string,
): id is typeof RESTAURANT_MODERN_01_ID {
  return id === RESTAURANT_MODERN_01_ID;
}

export function isSalonTemplateId(
  id: string,
): id is typeof SALON_MODERN_01_ID {
  return id === SALON_MODERN_01_ID;
}

export function getDefaultTemplateId(category: ClientCategory): TemplateId {
  if (category === "RESTAURANT_FOOD") {
    return RESTAURANT_MODERN_01_ID;
  }
  if (category === "SALON_BEAUTY") {
    return SALON_MODERN_01_ID;
  }

  return SERVICE_MODERN_01_ID;
}

export function getTemplateDemoContent(id: string): WebsiteContent | null {
  if (isServiceTemplateId(id)) {
    return PEAK_HEATING_AIR_DEMO;
  }

  if (isRestaurantTemplateId(id)) {
    return EMBER_AND_OLIVE_DEMO;
  }

  if (isSalonTemplateId(id)) {
    return ROWAN_ATELIER_DEMO;
  }

  return null;
}
