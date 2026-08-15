export type TemplateId = "service-modern-01" | "restaurant-modern-01";

export type TemplateCategory = "SERVICE_BUSINESS" | "RESTAURANT_FOOD";

export type TemplateStatus = "Available";

export type ServiceIconId = "repair" | "heat" | "install" | "maintain" | "air";

export type WhyIconId = "shield" | "clock" | "receipt" | "home" | "phone";

export type SectionVisibilityKey =
  | "trustStrip"
  | "whyChooseUs"
  | "about"
  | "gallery"
  | "testimonials"
  | "serviceAreas"
  | "faq"
  | "finalCta";

export type SectionVisibility = Record<SectionVisibilityKey, boolean>;

export type CtaAction = {
  label: string;
  href: string;
};

export type ServiceWebsiteContent = {
  business: {
    businessName: string;
    logoSrc?: string;
    logoText: string;
    tagline?: string;
    phone: string;
    email: string;
    address: string;
    businessHours: string[];
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    secondaryColor?: string;
    backgroundColor: string;
    surfaceColor: string;
    theme: "light" | "dark";
  };
  seo?: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow?: string;
    headline: string;
    subheadline: string;
    primaryCta: CtaAction;
    secondaryCta?: CtaAction;
    imageSrc: string;
    imageAlt: string;
    supportingItem?: {
      label: string;
      value: string;
    };
  };
  trustItems: Array<{
    id: string;
    label: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    shortDescription: string;
    imageSrc?: string;
    iconId?: ServiceIconId;
    href?: string;
  }>;
  about: {
    heading: string;
    text: string;
    imageSrc: string;
    imageAlt: string;
    highlights?: Array<{
      id: string;
      value: string;
      label: string;
    }>;
  };
  whyChooseUs: Array<{
    id: string;
    title: string;
    description: string;
    iconId?: WhyIconId;
  }>;
  gallery: Array<{
    id: string;
    imageSrc: string;
    alt: string;
    caption?: string;
  }>;
  testimonials: Array<{
    id: string;
    customerName: string;
    quote: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    sourceLabel?: string;
  }>;
  serviceAreas: string[];
  faq: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  contact: {
    phone: string;
    email: string;
    address: string;
    hours: string[];
    cta: CtaAction;
  };
  socialLinks: Array<{
    id: string;
    label: string;
    href: string;
  }>;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  sections: {
    services: { eyebrow: string; heading: string };
    whyChooseUs: { eyebrow: string; heading: string };
    gallery: { eyebrow: string; heading: string };
    testimonials: { eyebrow: string; heading: string };
    serviceAreas: { eyebrow: string; heading: string };
    faq: { eyebrow: string; heading: string };
    finalCta: { heading: string; text: string };
    contact: { eyebrow: string; heading: string; intro: string };
  };
  footerNote?: string;
  sectionVisibility: SectionVisibility;
};

export type RestaurantSectionVisibilityKey =
  | "intro"
  | "featured"
  | "about"
  | "gallery"
  | "testimonials"
  | "faq"
  | "finalCta";

export type RestaurantSectionVisibility = Record<
  RestaurantSectionVisibilityKey,
  boolean
>;

export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  tag?: string;
};

export type RestaurantMenuCategory = {
  id: string;
  name: string;
  items: RestaurantMenuItem[];
};

export type RestaurantFeaturedDish = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  tag?: string;
};

export type RestaurantWebsiteContent = {
  business: ServiceWebsiteContent["business"];
  branding: ServiceWebsiteContent["branding"];
  seo?: ServiceWebsiteContent["seo"];
  hero: ServiceWebsiteContent["hero"];
  intro: {
    heading: string;
    text: string;
    imageSrc: string;
    imageAlt: string;
  };
  featuredDishes: RestaurantFeaturedDish[];
  menu: RestaurantMenuCategory[];
  about: {
    heading: string;
    text: string;
    imageSrc: string;
    imageAlt: string;
  };
  gallery: ServiceWebsiteContent["gallery"];
  testimonials: ServiceWebsiteContent["testimonials"];
  faq: ServiceWebsiteContent["faq"];
  reservation: CtaAction;
  contact: ServiceWebsiteContent["contact"];
  socialLinks: ServiceWebsiteContent["socialLinks"];
  navigation: ServiceWebsiteContent["navigation"];
  sections: {
    intro: { eyebrow: string; heading: string };
    featured: { eyebrow: string; heading: string };
    menu: { eyebrow: string; heading: string };
    about: { eyebrow: string; heading: string };
    gallery: { eyebrow: string; heading: string };
    testimonials: { eyebrow: string; heading: string };
    location: { eyebrow: string; heading: string; intro: string };
    faq: { eyebrow: string; heading: string };
    finalCta: { heading: string; text: string };
  };
  footerNote?: string;
  sectionVisibility: RestaurantSectionVisibility;
};

export type WebsiteContent = ServiceWebsiteContent | RestaurantWebsiteContent;

export function isRestaurantWebsiteContent(
  content: WebsiteContent,
): content is RestaurantWebsiteContent {
  return "menu" in content && Array.isArray(content.menu);
}

export function isServiceWebsiteContent(
  content: WebsiteContent,
): content is ServiceWebsiteContent {
  return "services" in content && Array.isArray(content.services);
}

export type TemplateDefinition = {
  id: TemplateId;
  displayName: string;
  category: TemplateCategory;
  categoryLabel: string;
  description: string;
  status: TemplateStatus;
  previewPath: string;
  editPath: string;
  capabilities: string[];
};
