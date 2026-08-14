import type {
  SectionVisibilityKey,
  ServiceWebsiteContent,
} from "@/lib/templates/types";

export const DEFAULT_SECTION_VISIBILITY: Record<SectionVisibilityKey, true> = {
  trustStrip: true,
  whyChooseUs: true,
  about: true,
  gallery: true,
  testimonials: true,
  serviceAreas: true,
  faq: true,
  finalCta: true,
};

export function isSectionVisible(
  content: ServiceWebsiteContent,
  key: SectionVisibilityKey,
): boolean {
  return content.sectionVisibility?.[key] ?? DEFAULT_SECTION_VISIBILITY[key];
}

export function getRenderableNavigation(content: ServiceWebsiteContent) {
  return content.navigation.filter((item) => {
    if (item.href === "#about") {
      return isSectionVisible(content, "about");
    }
    if (item.href === "#gallery") {
      return isSectionVisible(content, "gallery") && content.gallery.length > 0;
    }
    if (item.href === "#testimonials") {
      return (
        isSectionVisible(content, "testimonials") &&
        content.testimonials.length > 0
      );
    }
    if (item.href === "#faq") {
      return isSectionVisible(content, "faq") && content.faq.length > 0;
    }
    return true;
  });
}

export function getRenderableSocialLinks(content: ServiceWebsiteContent) {
  return content.socialLinks.filter((link) => {
    const href = link.href.trim();
    const label = link.label.trim();
    return href.length > 0 && label.length > 0 && href !== "#";
  });
}
