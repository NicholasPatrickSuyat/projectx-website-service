import type { RestaurantSectionVisibilityKey } from "@/lib/templates/types";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export const DEFAULT_RESTAURANT_SECTION_VISIBILITY: Record<
  RestaurantSectionVisibilityKey,
  true
> = {
  intro: true,
  featured: true,
  about: true,
  gallery: true,
  testimonials: true,
  faq: true,
  finalCta: true,
};

export function isRestaurantSectionVisible(
  content: RestaurantWebsiteContent,
  key: RestaurantSectionVisibilityKey,
): boolean {
  return (
    content.sectionVisibility?.[key] ??
    DEFAULT_RESTAURANT_SECTION_VISIBILITY[key]
  );
}

export function getRenderableRestaurantNavigation(
  content: RestaurantWebsiteContent,
) {
  return content.navigation.filter((item) => {
    if (item.href === "#story") {
      return isRestaurantSectionVisible(content, "about");
    }
    if (item.href === "#gallery") {
      return (
        isRestaurantSectionVisible(content, "gallery") &&
        content.gallery.length > 0
      );
    }
    if (item.href === "#intro") {
      return isRestaurantSectionVisible(content, "intro");
    }
    return true;
  });
}

export function getRenderableRestaurantSocialLinks(
  content: RestaurantWebsiteContent,
) {
  return content.socialLinks.filter((link) => {
    const href = link.href.trim();
    const label = link.label.trim();
    return href.length > 0 && label.length > 0 && href !== "#";
  });
}

export function getReservationHref(content: RestaurantWebsiteContent): string | null {
  const href = content.reservation.href.trim();
  if (!href || href === "#") {
    return null;
  }
  return href;
}
