import { DEFAULT_RESTAURANT_SECTION_VISIBILITY } from "@/lib/templates/restaurant-content-utils";
import { syncRestaurantSharedFields } from "@/lib/templates/restaurant-editor";
import type {
  CtaAction,
  RestaurantSectionVisibility,
  RestaurantSectionVisibilityKey,
  RestaurantWebsiteContent,
} from "@/lib/templates/types";
import { isAllowedWebsiteImageSrc } from "@/lib/website-media/paths";

export type ParsedRestaurantContent =
  | { ok: true; content: RestaurantWebsiteContent }
  | { ok: false; error: string };

const SECTION_VISIBILITY_KEYS: RestaurantSectionVisibilityKey[] = [
  "intro",
  "featured",
  "about",
  "gallery",
  "testimonials",
  "faq",
  "finalCta",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (value == null) {
    return "";
  }
  return null;
}

function requiredString(value: unknown, path: string, errors: string[]): string {
  const parsed = asString(value);
  if (parsed === null) {
    errors.push(`${path} must be a string.`);
    return "";
  }
  return parsed;
}

function optionalString(
  value: unknown,
  path: string,
  errors: string[],
): string | undefined {
  if (value == null) {
    return undefined;
  }
  const parsed = asString(value);
  if (parsed === null) {
    errors.push(`${path} must be a string.`);
    return undefined;
  }
  return parsed;
}

function websiteImageSrc(
  value: unknown,
  path: string,
  errors: string[],
  required: boolean,
): string | undefined {
  if (required) {
    const src = requiredString(value, path, errors);
    if (src && !isAllowedWebsiteImageSrc(src)) {
      errors.push(`${path} is not a valid website image reference.`);
    }
    return src;
  }

  const src = optionalString(value, path, errors);
  if (src && !isAllowedWebsiteImageSrc(src)) {
    errors.push(`${path} is not a valid website image reference.`);
  }
  return src;
}

function asStringArray(value: unknown, path: string, errors: string[]): string[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return [];
  }
  return value.map((item, index) => requiredString(item, `${path}[${index}]`, errors));
}

function parseCta(
  value: unknown,
  path: string,
  errors: string[],
  required: boolean,
): CtaAction | undefined {
  if (value == null) {
    if (required) {
      errors.push(`${path} is required.`);
    }
    return required ? { label: "", href: "" } : undefined;
  }
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
    return required ? { label: "", href: "" } : undefined;
  }
  return {
    label: requiredString(value.label, `${path}.label`, errors),
    href: requiredString(value.href, `${path}.href`, errors),
  };
}

function parseRating(value: unknown): 1 | 2 | 3 | 4 | 5 | undefined {
  const numeric = typeof value === "number" ? value : Number(value);
  if (numeric === 1 || numeric === 2 || numeric === 3 || numeric === 4 || numeric === 5) {
    return numeric;
  }
  return undefined;
}

function parseArray<T>(
  value: unknown,
  path: string,
  errors: string[],
  mapItem: (item: unknown, itemPath: string) => T | null,
): T[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return [];
  }
  return value.flatMap((item, index) => {
    const parsed = mapItem(item, `${path}[${index}]`);
    return parsed ? [parsed] : [];
  });
}

function parseSectionHeading(
  value: unknown,
  path: string,
  errors: string[],
): { eyebrow: string; heading: string } {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
    return { eyebrow: "", heading: "" };
  }
  return {
    eyebrow: requiredString(value.eyebrow, `${path}.eyebrow`, errors),
    heading: requiredString(value.heading, `${path}.heading`, errors),
  };
}

export function parseRestaurantWebsiteContentValue(
  value: unknown,
): ParsedRestaurantContent {
  if (!isRecord(value)) {
    return { ok: false, error: "Website content must be a JSON object." };
  }

  const errors: string[] = [];
  const business = isRecord(value.business) ? value.business : null;
  const branding = isRecord(value.branding) ? value.branding : null;
  const hero = isRecord(value.hero) ? value.hero : null;
  const intro = isRecord(value.intro) ? value.intro : null;
  const about = isRecord(value.about) ? value.about : null;
  const reservation = isRecord(value.reservation) ? value.reservation : null;
  const contact = isRecord(value.contact) ? value.contact : null;
  const sections = isRecord(value.sections) ? value.sections : null;

  if (!business) errors.push("business is required.");
  if (!branding) errors.push("branding is required.");
  if (!hero) errors.push("hero is required.");
  if (!intro) errors.push("intro is required.");
  if (!about) errors.push("about is required.");
  if (!reservation) errors.push("reservation is required.");
  if (!contact) errors.push("contact is required.");
  if (!sections) errors.push("sections is required.");

  if (
    !business ||
    !branding ||
    !hero ||
    !intro ||
    !about ||
    !reservation ||
    !contact ||
    !sections ||
    errors.length > 0
  ) {
    return {
      ok: false,
      error: `Saved website content is incompatible: ${errors.join(" ")}`,
    };
  }

  const theme = branding.theme === "dark" ? "dark" : "light";
  const visibilitySource = isRecord(value.sectionVisibility)
    ? value.sectionVisibility
    : {};
  const sectionVisibility = Object.fromEntries(
    SECTION_VISIBILITY_KEYS.map((key) => [
      key,
      typeof visibilitySource[key] === "boolean"
        ? visibilitySource[key]
        : DEFAULT_RESTAURANT_SECTION_VISIBILITY[key],
    ]),
  ) as RestaurantSectionVisibility;

  const seo = isRecord(value.seo)
    ? {
        title: requiredString(value.seo.title, "seo.title", errors),
        description: requiredString(
          value.seo.description,
          "seo.description",
          errors,
        ),
      }
    : undefined;

  const supportingItem = isRecord(hero.supportingItem)
    ? {
        label: requiredString(
          hero.supportingItem.label,
          "hero.supportingItem.label",
          errors,
        ),
        value: requiredString(
          hero.supportingItem.value,
          "hero.supportingItem.value",
          errors,
        ),
      }
    : undefined;

  const content: RestaurantWebsiteContent = {
    business: {
      businessName: requiredString(
        business.businessName,
        "business.businessName",
        errors,
      ),
      logoSrc: websiteImageSrc(business.logoSrc, "business.logoSrc", errors, false),
      logoText: requiredString(business.logoText, "business.logoText", errors),
      tagline: optionalString(business.tagline, "business.tagline", errors),
      phone: requiredString(business.phone, "business.phone", errors),
      email: requiredString(business.email, "business.email", errors),
      address: requiredString(business.address, "business.address", errors),
      businessHours: asStringArray(
        business.businessHours,
        "business.businessHours",
        errors,
      ),
    },
    branding: {
      primaryColor: requiredString(
        branding.primaryColor,
        "branding.primaryColor",
        errors,
      ),
      accentColor: requiredString(
        branding.accentColor,
        "branding.accentColor",
        errors,
      ),
      secondaryColor: optionalString(
        branding.secondaryColor,
        "branding.secondaryColor",
        errors,
      ),
      backgroundColor: requiredString(
        branding.backgroundColor,
        "branding.backgroundColor",
        errors,
      ),
      surfaceColor: requiredString(
        branding.surfaceColor,
        "branding.surfaceColor",
        errors,
      ),
      theme,
    },
    seo,
    hero: {
      eyebrow: optionalString(hero.eyebrow, "hero.eyebrow", errors),
      headline: requiredString(hero.headline, "hero.headline", errors),
      subheadline: requiredString(hero.subheadline, "hero.subheadline", errors),
      primaryCta: parseCta(hero.primaryCta, "hero.primaryCta", errors, true)!,
      secondaryCta: parseCta(
        hero.secondaryCta,
        "hero.secondaryCta",
        errors,
        false,
      ),
      imageSrc: websiteImageSrc(hero.imageSrc, "hero.imageSrc", errors, true) ?? "",
      imageAlt: requiredString(hero.imageAlt, "hero.imageAlt", errors),
      supportingItem,
    },
    intro: {
      heading: requiredString(intro.heading, "intro.heading", errors),
      text: requiredString(intro.text, "intro.text", errors),
      imageSrc: websiteImageSrc(intro.imageSrc, "intro.imageSrc", errors, true) ?? "",
      imageAlt: requiredString(intro.imageAlt, "intro.imageAlt", errors),
    },
    featuredDishes: parseArray(
      value.featuredDishes,
      "featuredDishes",
      errors,
      (item, path) => {
        if (!isRecord(item)) {
          errors.push(`${path} must be an object.`);
          return null;
        }
        return {
          id: requiredString(item.id, `${path}.id`, errors),
          name: requiredString(item.name, `${path}.name`, errors),
          description: requiredString(
            item.description,
            `${path}.description`,
            errors,
          ),
          price: requiredString(item.price, `${path}.price`, errors),
          imageSrc:
            websiteImageSrc(item.imageSrc, `${path}.imageSrc`, errors, true) ?? "",
          imageAlt: requiredString(item.imageAlt, `${path}.imageAlt`, errors),
          tag: optionalString(item.tag, `${path}.tag`, errors),
        };
      },
    ),
    menu: parseArray(value.menu, "menu", errors, (item, path) => {
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return null;
      }
      return {
        id: requiredString(item.id, `${path}.id`, errors),
        name: requiredString(item.name, `${path}.name`, errors),
        items: parseArray(item.items, `${path}.items`, errors, (menuItem, itemPath) => {
          if (!isRecord(menuItem)) {
            errors.push(`${itemPath} must be an object.`);
            return null;
          }
          return {
            id: requiredString(menuItem.id, `${itemPath}.id`, errors),
            name: requiredString(menuItem.name, `${itemPath}.name`, errors),
            description: requiredString(
              menuItem.description,
              `${itemPath}.description`,
              errors,
            ),
            price: requiredString(menuItem.price, `${itemPath}.price`, errors),
            tag: optionalString(menuItem.tag, `${itemPath}.tag`, errors),
          };
        }),
      };
    }),
    about: {
      heading: requiredString(about.heading, "about.heading", errors),
      text: requiredString(about.text, "about.text", errors),
      imageSrc: websiteImageSrc(about.imageSrc, "about.imageSrc", errors, true) ?? "",
      imageAlt: requiredString(about.imageAlt, "about.imageAlt", errors),
    },
    gallery: parseArray(value.gallery, "gallery", errors, (item, path) => {
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return null;
      }
      return {
        id: requiredString(item.id, `${path}.id`, errors),
        imageSrc: websiteImageSrc(item.imageSrc, `${path}.imageSrc`, errors, true) ?? "",
        alt: requiredString(item.alt, `${path}.alt`, errors),
        caption: optionalString(item.caption, `${path}.caption`, errors),
      };
    }),
    testimonials: parseArray(
      value.testimonials,
      "testimonials",
      errors,
      (item, path) => {
        if (!isRecord(item)) {
          errors.push(`${path} must be an object.`);
          return null;
        }
        return {
          id: requiredString(item.id, `${path}.id`, errors),
          customerName: requiredString(
            item.customerName,
            `${path}.customerName`,
            errors,
          ),
          quote: requiredString(item.quote, `${path}.quote`, errors),
          rating: parseRating(item.rating),
          sourceLabel: optionalString(
            item.sourceLabel,
            `${path}.sourceLabel`,
            errors,
          ),
        };
      },
    ),
    faq: parseArray(value.faq, "faq", errors, (item, path) => {
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return null;
      }
      return {
        id: requiredString(item.id, `${path}.id`, errors),
        question: requiredString(item.question, `${path}.question`, errors),
        answer: requiredString(item.answer, `${path}.answer`, errors),
      };
    }),
    reservation: parseCta(reservation, "reservation", errors, true)!,
    contact: {
      phone: requiredString(contact.phone, "contact.phone", errors),
      email: requiredString(contact.email, "contact.email", errors),
      address: requiredString(contact.address, "contact.address", errors),
      hours: asStringArray(contact.hours, "contact.hours", errors),
      cta: parseCta(contact.cta, "contact.cta", errors, true)!,
    },
    socialLinks: parseArray(
      value.socialLinks,
      "socialLinks",
      errors,
      (item, path) => {
        if (!isRecord(item)) {
          errors.push(`${path} must be an object.`);
          return null;
        }
        return {
          id: requiredString(item.id, `${path}.id`, errors),
          label: requiredString(item.label, `${path}.label`, errors),
          href: requiredString(item.href, `${path}.href`, errors),
        };
      },
    ),
    navigation: parseArray(
      value.navigation,
      "navigation",
      errors,
      (item, path) => {
        if (!isRecord(item)) {
          errors.push(`${path} must be an object.`);
          return null;
        }
        return {
          label: requiredString(item.label, `${path}.label`, errors),
          href: requiredString(item.href, `${path}.href`, errors),
        };
      },
    ),
    sections: {
      intro: parseSectionHeading(sections.intro, "sections.intro", errors),
      featured: parseSectionHeading(
        sections.featured,
        "sections.featured",
        errors,
      ),
      menu: parseSectionHeading(sections.menu, "sections.menu", errors),
      about: parseSectionHeading(sections.about, "sections.about", errors),
      gallery: parseSectionHeading(sections.gallery, "sections.gallery", errors),
      testimonials: parseSectionHeading(
        sections.testimonials,
        "sections.testimonials",
        errors,
      ),
      location: isRecord(sections.location)
        ? {
            eyebrow: requiredString(
              sections.location.eyebrow,
              "sections.location.eyebrow",
              errors,
            ),
            heading: requiredString(
              sections.location.heading,
              "sections.location.heading",
              errors,
            ),
            intro: requiredString(
              sections.location.intro,
              "sections.location.intro",
              errors,
            ),
          }
        : (() => {
            errors.push("sections.location must be an object.");
            return { eyebrow: "", heading: "", intro: "" };
          })(),
      faq: parseSectionHeading(sections.faq, "sections.faq", errors),
      finalCta: isRecord(sections.finalCta)
        ? {
            heading: requiredString(
              sections.finalCta.heading,
              "sections.finalCta.heading",
              errors,
            ),
            text: requiredString(
              sections.finalCta.text,
              "sections.finalCta.text",
              errors,
            ),
          }
        : (() => {
            errors.push("sections.finalCta must be an object.");
            return { heading: "", text: "" };
          })(),
    },
    footerNote: optionalString(value.footerNote, "footerNote", errors),
    sectionVisibility,
  };

  if (errors.length > 0) {
    return {
      ok: false,
      error: `Saved website content is incompatible: ${errors.slice(0, 8).join(" ")}`,
    };
  }

  return { ok: true, content: syncRestaurantSharedFields(content) };
}
