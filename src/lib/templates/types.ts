export type TemplateId = "service-modern-01";

export type TemplateCategory = "SERVICE_BUSINESS";

export type TemplateStatus = "Available";

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
    iconId?: "repair" | "heat" | "install" | "maintain" | "air";
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
    iconId?: "shield" | "clock" | "receipt" | "home" | "phone";
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
};

export type TemplateDefinition = {
  id: TemplateId;
  displayName: string;
  category: TemplateCategory;
  categoryLabel: string;
  description: string;
  status: TemplateStatus;
  previewPath: string;
  capabilities: string[];
};
