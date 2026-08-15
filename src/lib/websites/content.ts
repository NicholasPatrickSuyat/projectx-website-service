import type { Client } from "@/lib/clients/types";
import { DEFAULT_SECTION_VISIBILITY } from "@/lib/templates/content-utils";
import {
  cloneContent,
  syncSharedContactFields,
  validateContent,
  type EditorErrors,
} from "@/lib/templates/editor";
import {
  getTemplateDemoContent,
} from "@/lib/templates/registry";
import type {
  CtaAction,
  SectionVisibility,
  SectionVisibilityKey,
  ServiceIconId,
  ServiceWebsiteContent,
  TemplateId,
  WhyIconId,
} from "@/lib/templates/types";
import { isAllowedWebsiteImageSrc } from "@/lib/website-media/paths";

const SERVICE_ICON_IDS: ServiceIconId[] = [
  "repair",
  "heat",
  "install",
  "maintain",
  "air",
];
const WHY_ICON_IDS: WhyIconId[] = [
  "shield",
  "clock",
  "receipt",
  "home",
  "phone",
];
const SECTION_VISIBILITY_KEYS: SectionVisibilityKey[] = [
  "trustStrip",
  "whyChooseUs",
  "about",
  "gallery",
  "testimonials",
  "serviceAreas",
  "faq",
  "finalCta",
];

export type ParsedWebsiteContent =
  | { ok: true; content: ServiceWebsiteContent }
  | { ok: false; error: string };

export type SaveContentResult =
  | { ok: true; content: ServiceWebsiteContent; json: string }
  | { ok: false; error: string; fieldErrors?: EditorErrors };

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

function requiredString(
  value: unknown,
  path: string,
  errors: string[],
): string {
  const parsed = asString(value);
  if (parsed === null) {
    errors.push(`${path} must be a string.`);
    return "";
  }
  return parsed;
}

function optionalString(value: unknown, path: string, errors: string[]): string | undefined {
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

function parseServiceIcon(value: unknown): ServiceIconId | undefined {
  return typeof value === "string" && SERVICE_ICON_IDS.includes(value as ServiceIconId)
    ? (value as ServiceIconId)
    : undefined;
}

function parseWhyIcon(value: unknown): WhyIconId | undefined {
  return typeof value === "string" && WHY_ICON_IDS.includes(value as WhyIconId)
    ? (value as WhyIconId)
    : undefined;
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

export function parseServiceWebsiteContentValue(
  value: unknown,
): ParsedWebsiteContent {
  if (!isRecord(value)) {
    return { ok: false, error: "Website content must be a JSON object." };
  }

  const errors: string[] = [];
  const business = isRecord(value.business) ? value.business : null;
  const branding = isRecord(value.branding) ? value.branding : null;
  const hero = isRecord(value.hero) ? value.hero : null;
  const about = isRecord(value.about) ? value.about : null;
  const contact = isRecord(value.contact) ? value.contact : null;
  const sections = isRecord(value.sections) ? value.sections : null;

  if (!business) errors.push("business is required.");
  if (!branding) errors.push("branding is required.");
  if (!hero) errors.push("hero is required.");
  if (!about) errors.push("about is required.");
  if (!contact) errors.push("contact is required.");
  if (!sections) errors.push("sections is required.");

  if (
    !business ||
    !branding ||
    !hero ||
    !about ||
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
        : DEFAULT_SECTION_VISIBILITY[key],
    ]),
  ) as SectionVisibility;

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

  const content: ServiceWebsiteContent = {
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
    trustItems: parseArray(value.trustItems, "trustItems", errors, (item, path) => {
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return null;
      }
      return {
        id: requiredString(item.id, `${path}.id`, errors),
        label: requiredString(item.label, `${path}.label`, errors),
      };
    }),
    services: parseArray(value.services, "services", errors, (item, path) => {
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return null;
      }
      return {
        id: requiredString(item.id, `${path}.id`, errors),
        name: requiredString(item.name, `${path}.name`, errors),
        shortDescription: requiredString(
          item.shortDescription,
          `${path}.shortDescription`,
          errors,
        ),
        imageSrc: websiteImageSrc(item.imageSrc, `${path}.imageSrc`, errors, false),
        iconId: parseServiceIcon(item.iconId),
        href: optionalString(item.href, `${path}.href`, errors),
      };
    }),
    about: {
      heading: requiredString(about.heading, "about.heading", errors),
      text: requiredString(about.text, "about.text", errors),
      imageSrc: websiteImageSrc(about.imageSrc, "about.imageSrc", errors, true) ?? "",
      imageAlt: requiredString(about.imageAlt, "about.imageAlt", errors),
      highlights: parseArray(
        about.highlights,
        "about.highlights",
        errors,
        (item, path) => {
          if (!isRecord(item)) {
            errors.push(`${path} must be an object.`);
            return null;
          }
          return {
            id: requiredString(item.id, `${path}.id`, errors),
            value: requiredString(item.value, `${path}.value`, errors),
            label: requiredString(item.label, `${path}.label`, errors),
          };
        },
      ),
    },
    whyChooseUs: parseArray(
      value.whyChooseUs,
      "whyChooseUs",
      errors,
      (item, path) => {
        if (!isRecord(item)) {
          errors.push(`${path} must be an object.`);
          return null;
        }
        return {
          id: requiredString(item.id, `${path}.id`, errors),
          title: requiredString(item.title, `${path}.title`, errors),
          description: requiredString(
            item.description,
            `${path}.description`,
            errors,
          ),
          iconId: parseWhyIcon(item.iconId),
        };
      },
    ),
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
    serviceAreas: asStringArray(value.serviceAreas, "serviceAreas", errors),
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
      services: parseSectionHeading(
        sections.services,
        "sections.services",
        errors,
      ),
      whyChooseUs: parseSectionHeading(
        sections.whyChooseUs,
        "sections.whyChooseUs",
        errors,
      ),
      gallery: parseSectionHeading(sections.gallery, "sections.gallery", errors),
      testimonials: parseSectionHeading(
        sections.testimonials,
        "sections.testimonials",
        errors,
      ),
      serviceAreas: parseSectionHeading(
        sections.serviceAreas,
        "sections.serviceAreas",
        errors,
      ),
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
      contact: isRecord(sections.contact)
        ? {
            eyebrow: requiredString(
              sections.contact.eyebrow,
              "sections.contact.eyebrow",
              errors,
            ),
            heading: requiredString(
              sections.contact.heading,
              "sections.contact.heading",
              errors,
            ),
            intro: requiredString(
              sections.contact.intro,
              "sections.contact.intro",
              errors,
            ),
          }
        : (() => {
            errors.push("sections.contact must be an object.");
            return { eyebrow: "", heading: "", intro: "" };
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

  return { ok: true, content: syncSharedContactFields(content) };
}

export function parseWebsiteContentJson(raw: string): ParsedWebsiteContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error: "Saved website content could not be parsed as JSON.",
    };
  }

  return parseServiceWebsiteContentValue(parsed);
}

export function serializeWebsiteContent(
  content: ServiceWebsiteContent,
): string {
  return JSON.stringify(syncSharedContactFields(content));
}

export function prepareWebsiteContentForSave(
  input: unknown,
): SaveContentResult {
  const parsed =
    typeof input === "string"
      ? parseWebsiteContentJson(input)
      : parseServiceWebsiteContentValue(input);

  if (!parsed.ok) {
    return parsed;
  }

  const fieldErrors = validateContent(parsed.content);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please correct the highlighted fields before saving.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    content: parsed.content,
    json: serializeWebsiteContent(parsed.content),
  };
}

export function websiteContentJsonEquals(
  left: string,
  right: string,
): boolean {
  const parsedLeft = parseWebsiteContentJson(left);
  const parsedRight = parseWebsiteContentJson(right);

  if (!parsedLeft.ok || !parsedRight.ok) {
    return left === right;
  }

  return (
    serializeWebsiteContent(parsedLeft.content) ===
    serializeWebsiteContent(parsedRight.content)
  );
}

export function formatClientAddress(client: Client): string {
  return [client.addressLine1, client.city, client.state, client.postalCode]
    .filter(Boolean)
    .join(", ");
}

function deriveLogoText(businessName: string): string {
  const firstWord = businessName.trim().split(/\s+/)[0] ?? businessName;
  return firstWord.slice(0, 16);
}

function toTelHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `tel:+1${digits}`;
  }
  if (digits.length >= 11) {
    return `tel:+${digits}`;
  }
  return null;
}

function replacePeakIdentity(text: string, businessName: string): string {
  return text
    .replace(/Peak Heating & Air/gi, businessName)
    .replace(
      /\s*This is a fictional demo business for Project X Website Service\.?/gi,
      "",
    )
    .replace(
      /\s*Peak Heating & Air is fictional demo content[^.]*\./gi,
      "",
    )
    .trim();
}

export function initializeWebsiteContent(
  client: Client,
  templateId: TemplateId,
): ServiceWebsiteContent {
  const demo = getTemplateDemoContent(templateId);
  if (!demo) {
    throw new Error("That template does not have demo content.");
  }

  const content = cloneContent(demo);
  const phone = client.phone?.trim() ?? "";
  const email = client.email?.trim() ?? "";
  const address = formatClientAddress(client);
  const telHref = phone ? toTelHref(phone) : null;

  content.business.businessName = client.businessName;
  content.business.logoText = deriveLogoText(client.businessName);
  content.business.phone = phone;
  content.business.email = email;
  content.business.address = address;

  content.seo = {
    title: `${client.businessName} Website`,
    description: `Website draft for ${client.businessName}.`,
  };

  content.hero.subheadline = replacePeakIdentity(
    content.hero.subheadline,
    client.businessName,
  );
  if (phone && telHref) {
    content.hero.secondaryCta = {
      label: `Call ${phone}`,
      href: telHref,
    };
  } else {
    content.hero.secondaryCta = {
      label: "Contact",
      href: "#contact",
    };
  }

  content.about.text = `${client.businessName} website draft. Update this About section with the client's own story.`;

  const peakFaqIndex = content.faq.findIndex((item) =>
    /peak heating/i.test(`${item.question} ${item.answer}`),
  );
  if (peakFaqIndex >= 0) {
    content.faq[peakFaqIndex] = {
      id: content.faq[peakFaqIndex]?.id ?? "faq-contact",
      question: "How can I get in touch?",
      answer: "Call, email, or use the request form on this page.",
    };
  }

  content.contact.cta = {
    label: content.contact.cta.label || "Request Service",
    href: telHref ?? "#contact",
  };

  content.socialLinks = content.socialLinks.map((link) => ({
    ...link,
    href: "",
  }));

  content.sections.contact.intro =
    "Call, email, or request service using the details on this page.";
  content.footerNote = `Website draft for ${client.businessName}.`;

  return syncSharedContactFields(content);
}
