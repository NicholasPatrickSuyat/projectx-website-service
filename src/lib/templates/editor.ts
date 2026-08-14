import type {
  ServiceIconId,
  ServiceWebsiteContent,
  WhyIconId,
} from "@/lib/templates/types";

export const EDITOR_LIMITS = {
  services: 6,
  whyChooseUs: 6,
  testimonials: 6,
  gallery: 8,
  faq: 8,
  serviceAreas: 16,
  aboutHighlights: 4,
} as const;

export const SERVICE_ICON_OPTIONS: Array<{ value: ServiceIconId; label: string }> =
  [
    { value: "repair", label: "Repair" },
    { value: "heat", label: "Heating" },
    { value: "install", label: "Installation" },
    { value: "maintain", label: "Maintenance" },
    { value: "air", label: "Air / comfort" },
  ];

export const WHY_ICON_OPTIONS: Array<{ value: WhyIconId; label: string }> = [
  { value: "shield", label: "Shield" },
  { value: "clock", label: "Clock" },
  { value: "receipt", label: "Receipt" },
  { value: "home", label: "Home" },
  { value: "phone", label: "Phone" },
];

export type EditorErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function cloneContent(
  content: ServiceWebsiteContent,
): ServiceWebsiteContent {
  return structuredClone(content);
}

export function createItemId(prefix: string): string {
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${unique}`;
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const current = next[index];
  const swap = next[nextIndex];
  if (current === undefined || swap === undefined) {
    return items;
  }
  next[index] = swap;
  next[nextIndex] = current;
  return next;
}

export function syncSharedContactFields(
  content: ServiceWebsiteContent,
): ServiceWebsiteContent {
  return {
    ...content,
    contact: {
      ...content.contact,
      phone: content.business.phone,
      email: content.business.email,
      address: content.business.address,
      hours: [...content.business.businessHours],
    },
  };
}

export function isValidHexColor(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

export function isValidActionHref(value: string): boolean {
  const href = value.trim();
  if (!href) {
    return false;
  }
  if (href.startsWith("#") && href.length > 1) {
    return true;
  }
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return href.length > 5;
  }
  if (href.startsWith("/")) {
    return href.length > 1;
  }
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function optionalHrefError(value: string | undefined, label: string): string | undefined {
  const href = value?.trim() ?? "";
  if (!href) {
    return undefined;
  }
  if (!isValidActionHref(href)) {
    return `${label} needs a valid link, such as https://, tel:, mailto:, or #contact.`;
  }
  return undefined;
}

export function validateContent(content: ServiceWebsiteContent): EditorErrors {
  const errors: EditorErrors = {};

  if (!content.business.businessName.trim()) {
    errors["business.businessName"] = "Business name is required.";
  }
  if (content.business.email.trim() && !EMAIL_PATTERN.test(content.business.email.trim())) {
    errors["business.email"] = "Enter a valid email address.";
  }
  if (content.business.phone.trim() && !/\d/.test(content.business.phone)) {
    errors["business.phone"] = "Enter a phone number that includes digits.";
  }

  if (!isValidHexColor(content.branding.primaryColor)) {
    errors["branding.primaryColor"] = "Use a hex color like #16324f.";
  }
  if (!isValidHexColor(content.branding.accentColor)) {
    errors["branding.accentColor"] = "Use a hex color like #c2783a.";
  }
  if (
    content.branding.secondaryColor?.trim() &&
    !isValidHexColor(content.branding.secondaryColor)
  ) {
    errors["branding.secondaryColor"] = "Use a hex color like #eef3f7.";
  }

  if (!content.hero.headline.trim()) {
    errors["hero.headline"] = "Headline is required.";
  }
  if (!content.hero.primaryCta.label.trim()) {
    errors["hero.primaryCta.label"] = "Primary CTA label is required.";
  }
  const primaryHrefError = optionalHrefError(
    content.hero.primaryCta.href,
    "Primary CTA destination",
  );
  if (!content.hero.primaryCta.href.trim()) {
    errors["hero.primaryCta.href"] = "Primary CTA destination is required.";
  } else if (primaryHrefError) {
    errors["hero.primaryCta.href"] = primaryHrefError;
  }
  if (content.hero.secondaryCta?.label.trim() || content.hero.secondaryCta?.href.trim()) {
    if (!content.hero.secondaryCta?.label.trim()) {
      errors["hero.secondaryCta.label"] = "Add a label or clear the secondary CTA.";
    }
    const secondaryHrefError = optionalHrefError(
      content.hero.secondaryCta?.href,
      "Secondary CTA destination",
    );
    if (!content.hero.secondaryCta?.href.trim()) {
      errors["hero.secondaryCta.href"] = "Add a destination or clear the secondary CTA.";
    } else if (secondaryHrefError) {
      errors["hero.secondaryCta.href"] = secondaryHrefError;
    }
  }

  if (content.services.length === 0) {
    errors.services = "Add at least one service.";
  }
  content.services.forEach((service, index) => {
    if (!service.name.trim()) {
      errors[`services.${index}.name`] = "Service name is required.";
    }
    if (!service.shortDescription.trim()) {
      errors[`services.${index}.shortDescription`] = "Short description is required.";
    }
    const hrefError = optionalHrefError(service.href, "Service link");
    if (hrefError) {
      errors[`services.${index}.href`] = hrefError;
    }
  });

  if (!content.about.heading.trim()) {
    errors["about.heading"] = "About heading is required.";
  }
  if (!content.about.text.trim()) {
    errors["about.text"] = "About text is required.";
  }

  content.whyChooseUs.forEach((item, index) => {
    if (!item.title.trim()) {
      errors[`whyChooseUs.${index}.title`] = "Title is required.";
    }
    if (!item.description.trim()) {
      errors[`whyChooseUs.${index}.description`] = "Description is required.";
    }
  });

  content.gallery.forEach((item, index) => {
    if (!item.alt.trim()) {
      errors[`gallery.${index}.alt`] = "Alt text is required.";
    }
  });

  content.testimonials.forEach((item, index) => {
    if (!item.customerName.trim()) {
      errors[`testimonials.${index}.customerName`] = "Customer name is required.";
    }
    if (!item.quote.trim()) {
      errors[`testimonials.${index}.quote`] = "Quote is required.";
    }
    if (item.rating != null && (item.rating < 1 || item.rating > 5)) {
      errors[`testimonials.${index}.rating`] = "Rating must be between 1 and 5.";
    }
  });

  content.faq.forEach((item, index) => {
    if (!item.question.trim()) {
      errors[`faq.${index}.question`] = "Question is required.";
    }
    if (!item.answer.trim()) {
      errors[`faq.${index}.answer`] = "Answer is required.";
    }
  });

  if (!content.contact.cta.label.trim()) {
    errors["contact.cta.label"] = "Contact CTA label is required.";
  }
  if (!content.contact.cta.href.trim()) {
    errors["contact.cta.href"] = "Contact CTA destination is required.";
  } else {
    const ctaHrefError = optionalHrefError(content.contact.cta.href, "Contact CTA destination");
    if (ctaHrefError) {
      errors["contact.cta.href"] = ctaHrefError;
    }
  }

  content.socialLinks.forEach((link, index) => {
    if (!link.href.trim()) {
      return;
    }
    if (!isValidActionHref(link.href)) {
      errors[`socialLinks.${index}.href`] = "Use a full https:// URL.";
    }
  });

  content.serviceAreas.forEach((area, index) => {
    if (!area.trim()) {
      errors[`serviceAreas.${index}`] = "Area name cannot be blank.";
    }
  });

  return errors;
}

export function createServiceItem(): ServiceWebsiteContent["services"][number] {
  return {
    id: createItemId("service"),
    name: "",
    shortDescription: "",
    iconId: "repair",
    href: "#contact",
  };
}

export function createWhyItem(): ServiceWebsiteContent["whyChooseUs"][number] {
  return {
    id: createItemId("why"),
    title: "",
    description: "",
    iconId: "shield",
  };
}

export function createTestimonialItem(): ServiceWebsiteContent["testimonials"][number] {
  return {
    id: createItemId("testimonial"),
    customerName: "",
    quote: "",
    rating: 5,
    sourceLabel: "",
  };
}

export function createGalleryItem(
  imageSrc: string,
): ServiceWebsiteContent["gallery"][number] {
  return {
    id: createItemId("gallery"),
    imageSrc,
    alt: "",
    caption: "",
  };
}

export function createFaqItem(): ServiceWebsiteContent["faq"][number] {
  return {
    id: createItemId("faq"),
    question: "",
    answer: "",
  };
}

export function createHighlightItem(): NonNullable<
  ServiceWebsiteContent["about"]["highlights"]
>[number] {
  return {
    id: createItemId("highlight"),
    value: "",
    label: "",
  };
}
