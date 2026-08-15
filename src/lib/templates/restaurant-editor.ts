import type {
  RestaurantFeaturedDish,
  RestaurantMenuCategory,
  RestaurantMenuItem,
  RestaurantWebsiteContent,
} from "@/lib/templates/types";
import {
  createItemId,
  isValidActionHref,
  isValidHexColor,
  type EditorErrors,
} from "@/lib/templates/editor";

export const RESTAURANT_EDITOR_LIMITS = {
  menuCategories: 8,
  menuItemsPerCategory: 12,
  featuredDishes: 6,
  testimonials: 6,
  gallery: 8,
  faq: 8,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function syncRestaurantSharedFields(
  content: RestaurantWebsiteContent,
): RestaurantWebsiteContent {
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
    return `${label} needs a valid link, such as https://, tel:, mailto:, or #menu.`;
  }
  return undefined;
}

export function validateRestaurantContent(
  content: RestaurantWebsiteContent,
): EditorErrors {
  const errors: EditorErrors = {};

  if (!content.business.businessName.trim()) {
    errors["business.businessName"] = "Restaurant name is required.";
  }
  if (content.business.email.trim() && !EMAIL_PATTERN.test(content.business.email.trim())) {
    errors["business.email"] = "Enter a valid email address.";
  }
  if (content.business.phone.trim() && !/\d/.test(content.business.phone)) {
    errors["business.phone"] = "Enter a phone number that includes digits.";
  }

  if (!isValidHexColor(content.branding.primaryColor)) {
    errors["branding.primaryColor"] = "Use a hex color like #2a1f18.";
  }
  if (!isValidHexColor(content.branding.accentColor)) {
    errors["branding.accentColor"] = "Use a hex color like #c45c26.";
  }
  if (
    content.branding.secondaryColor?.trim() &&
    !isValidHexColor(content.branding.secondaryColor)
  ) {
    errors["branding.secondaryColor"] = "Use a hex color like #6b7f4a.";
  }
  if (!isValidHexColor(content.branding.backgroundColor)) {
    errors["branding.backgroundColor"] = "Use a hex color like #f7f1e8.";
  }
  if (!isValidHexColor(content.branding.surfaceColor)) {
    errors["branding.surfaceColor"] = "Use a hex color like #fffaf4.";
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

  if (content.menu.length === 0) {
    errors.menu = "Add at least one menu category.";
  }
  content.menu.forEach((category, categoryIndex) => {
    if (!category.name.trim()) {
      errors[`menu.${categoryIndex}.name`] = "Category name is required.";
    }
    category.items.forEach((item, itemIndex) => {
      if (!item.name.trim()) {
        errors[`menu.${categoryIndex}.items.${itemIndex}.name`] =
          "Dish name is required.";
      }
      if (!item.price.trim()) {
        errors[`menu.${categoryIndex}.items.${itemIndex}.price`] =
          "Price is required.";
      }
    });
  });
  const menuItemCount = content.menu.reduce(
    (count, category) => count + category.items.length,
    0,
  );
  if (content.menu.length > 0 && menuItemCount === 0) {
    errors.menu = "Add at least one menu item.";
  }

  content.featuredDishes.forEach((dish, index) => {
    if (!dish.name.trim()) {
      errors[`featuredDishes.${index}.name`] = "Dish name is required.";
    }
    if (!dish.description.trim()) {
      errors[`featuredDishes.${index}.description`] = "Description is required.";
    }
    if (!dish.price.trim()) {
      errors[`featuredDishes.${index}.price`] = "Price is required.";
    }
    if (!dish.imageAlt.trim()) {
      errors[`featuredDishes.${index}.imageAlt`] = "Alt text is required.";
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

  if (!content.reservation.label.trim()) {
    errors["reservation.label"] = "Reservation button label is required.";
  }
  const reservationHrefError = optionalHrefError(
    content.reservation.href,
    "Reservation link",
  );
  if (reservationHrefError) {
    errors["reservation.href"] = reservationHrefError;
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

export function createMenuCategory(): RestaurantMenuCategory {
  return {
    id: createItemId("category"),
    name: "",
    items: [],
  };
}

export function createMenuItem(): RestaurantMenuItem {
  return {
    id: createItemId("item"),
    name: "",
    description: "",
    price: "",
    tag: "",
  };
}

export function createFeaturedDish(
  imageSrc: string,
): RestaurantFeaturedDish {
  return {
    id: createItemId("featured"),
    name: "",
    description: "",
    price: "",
    imageSrc,
    imageAlt: "",
    tag: "",
  };
}
