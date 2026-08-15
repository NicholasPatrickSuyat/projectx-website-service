import type { SalonSectionVisibilityKey, SalonWebsiteContent } from "@/lib/templates/types";

export const DEFAULT_SALON_SECTION_VISIBILITY: Record<
  SalonSectionVisibilityKey,
  true
> = {
  intro: true,
  services: true,
  about: true,
  team: true,
  gallery: true,
  testimonials: true,
  faq: true,
  finalCta: true,
};

export function isSalonSectionVisible(
  content: SalonWebsiteContent,
  key: SalonSectionVisibilityKey,
): boolean {
  return content.sectionVisibility?.[key] ?? DEFAULT_SALON_SECTION_VISIBILITY[key];
}

export function getRenderableSalonNavigation(content: SalonWebsiteContent) {
  return content.navigation.filter((item) => {
    if (item.href === "#intro") {
      return isSalonSectionVisible(content, "intro");
    }
    if (item.href === "#services") {
      return isSalonSectionVisible(content, "services") && content.services.length > 0;
    }
    if (item.href === "#story") {
      return isSalonSectionVisible(content, "about");
    }
    if (item.href === "#team") {
      return isSalonSectionVisible(content, "team") && content.team.length > 0;
    }
    if (item.href === "#gallery") {
      return isSalonSectionVisible(content, "gallery") && content.gallery.length > 0;
    }
    return true;
  });
}

export function getRenderableSalonSocialLinks(content: SalonWebsiteContent) {
  return content.socialLinks.filter((link) => {
    const href = link.href.trim();
    const label = link.label.trim();
    return href.length > 0 && label.length > 0 && href !== "#";
  });
}

export function getBookingHref(content: SalonWebsiteContent): string | null {
  const href = content.booking.href.trim();
  if (!href || href === "#") {
    return null;
  }
  return href;
}
