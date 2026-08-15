import type {
  SalonService,
  SalonTeamMember,
  SalonWebsiteContent,
} from "@/lib/templates/types";
import {
  createItemId,
  isValidActionHref,
  isValidHexColor,
  type EditorErrors,
} from "@/lib/templates/editor";

export const SALON_EDITOR_LIMITS = {
  services: 12,
  team: 8,
  testimonials: 6,
  gallery: 8,
  faq: 8,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function syncSalonSharedFields(
  content: SalonWebsiteContent,
): SalonWebsiteContent {
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

export function validateSalonContent(content: SalonWebsiteContent): EditorErrors {
  const errors: EditorErrors = {};

  if (!content.business.businessName.trim()) {
    errors["business.businessName"] = "Studio name is required.";
  }
  if (content.business.email.trim() && !EMAIL_PATTERN.test(content.business.email.trim())) {
    errors["business.email"] = "Enter a valid email address.";
  }
  if (content.business.phone.trim() && !/\d/.test(content.business.phone)) {
    errors["business.phone"] = "Enter a phone number that includes digits.";
  }

  if (!isValidHexColor(content.branding.primaryColor)) {
    errors["branding.primaryColor"] = "Use a hex color like #1c1917.";
  }
  if (!isValidHexColor(content.branding.accentColor)) {
    errors["branding.accentColor"] = "Use a hex color like #9a6b4f.";
  }
  if (
    content.branding.secondaryColor?.trim() &&
    !isValidHexColor(content.branding.secondaryColor)
  ) {
    errors["branding.secondaryColor"] = "Use a hex color like #6d7a73.";
  }
  if (!isValidHexColor(content.branding.backgroundColor)) {
    errors["branding.backgroundColor"] = "Use a hex color like #f3efe8.";
  }
  if (!isValidHexColor(content.branding.surfaceColor)) {
    errors["branding.surfaceColor"] = "Use a hex color like #fbf8f3.";
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

  if (!content.intro.heading.trim()) {
    errors["intro.heading"] = "Introduction heading is required.";
  }
  if (!content.intro.text.trim()) {
    errors["intro.text"] = "Introduction text is required.";
  }

  if (!content.about.heading.trim()) {
    errors["about.heading"] = "Story heading is required.";
  }
  if (!content.about.text.trim()) {
    errors["about.text"] = "Story text is required.";
  }

  if (content.services.length === 0) {
    errors.services = "Add at least one service.";
  }
  content.services.forEach((service, index) => {
    if (!service.name.trim()) {
      errors[`services.${index}.name`] = "Service name is required.";
    }
    if (!service.description.trim()) {
      errors[`services.${index}.description`] = "Description is required.";
    }
    if (!service.price.trim()) {
      errors[`services.${index}.price`] = "Price or starting-at text is required.";
    }
    if (service.imageSrc?.trim() && !service.imageAlt?.trim()) {
      errors[`services.${index}.imageAlt`] = "Alt text is required when an image is set.";
    }
  });

  content.team.forEach((member, index) => {
    if (!member.name.trim()) {
      errors[`team.${index}.name`] = "Name is required.";
    }
    if (!member.role.trim()) {
      errors[`team.${index}.role`] = "Role is required.";
    }
    if (!member.bio.trim()) {
      errors[`team.${index}.bio`] = "Bio is required.";
    }
    if (!member.imageAlt.trim()) {
      errors[`team.${index}.imageAlt`] = "Alt text is required.";
    }
  });

  content.gallery.forEach((item, index) => {
    if (!item.alt.trim()) {
      errors[`gallery.${index}.alt`] = "Alt text is required.";
    }
  });

  content.testimonials.forEach((item, index) => {
    if (!item.customerName.trim()) {
      errors[`testimonials.${index}.customerName`] = "Guest name is required.";
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

  if (!content.booking.label.trim()) {
    errors["booking.label"] = "Booking button label is required.";
  }
  const bookingHrefError = optionalHrefError(content.booking.href, "Booking link");
  if (bookingHrefError) {
    errors["booking.href"] = bookingHrefError;
  }

  if (!content.contact.cta.label.trim()) {
    errors["contact.cta.label"] = "Contact CTA label is required.";
  }
  if (!content.contact.cta.href.trim()) {
    errors["contact.cta.href"] = "Contact CTA destination is required.";
  } else {
    const ctaHrefError = optionalHrefError(
      content.contact.cta.href,
      "Contact CTA destination",
    );
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

  return errors;
}

export function createSalonService(): SalonService {
  return {
    id: createItemId("service"),
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  };
}

export function createSalonTeamMember(imageSrc: string): SalonTeamMember {
  return {
    id: createItemId("team"),
    name: "",
    role: "",
    bio: "",
    imageSrc,
    imageAlt: "",
  };
}
