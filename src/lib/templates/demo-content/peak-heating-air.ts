import type { ServiceWebsiteContent } from "@/lib/templates/types";

export const PEAK_HEATING_AIR_DEMO: ServiceWebsiteContent = {
  business: {
    businessName: "Peak Heating & Air",
    logoText: "Peak",
    tagline: "Residential HVAC",
    phone: "(480) 555-0142",
    email: "hello@peakheatingair.example",
    address: "2140 Baseline Rd, Mesa, AZ 85204",
    businessHours: [
      "Monday–Friday: 7:00 AM – 6:00 PM",
      "Saturday: 8:00 AM – 2:00 PM",
      "Sunday: Emergency service only",
      "24/7 emergency heating and cooling",
    ],
  },
  branding: {
    primaryColor: "#16324f",
    accentColor: "#c2783a",
    secondaryColor: "#eef3f7",
    theme: "light",
  },
  seo: {
    title: "Peak Heating & Air | Mesa HVAC Demo",
    description:
      "Fictional Mesa HVAC company used to preview the Service Modern 01 website template.",
  },
  hero: {
    eyebrow: "Mesa, Arizona · HVAC",
    headline: "Comfort you can count on, every season.",
    subheadline:
      "Honest diagnostics, clean workmanship, and clear pricing for homes across the East Valley. This is a fictional demo business for Project X Website Service.",
    primaryCta: {
      label: "Request Service",
      href: "#contact",
    },
    secondaryCta: {
      label: "Call (480) 555-0142",
      href: "tel:+14805550142",
    },
    imageSrc: "/templates/service-modern-01/hero.jpg",
    imageAlt:
      "HVAC technician inspecting an outdoor air conditioning unit at a modern home",
    supportingItem: {
      label: "Typical arrival window",
      value: "Same-day",
    },
  },
  trustItems: [
    { id: "licensed", label: "Licensed & Insured" },
    { id: "local", label: "East Valley Local" },
    { id: "experience", label: "15+ Years Experience" },
    { id: "response", label: "Fast Response" },
  ],
  services: [
    {
      id: "ac-repair",
      name: "AC Repair",
      shortDescription:
        "Fast diagnosis and repair for weak cooling, strange noises, and unexpected shutdowns.",
      iconId: "repair",
      href: "#contact",
    },
    {
      id: "heating-repair",
      name: "Heating Repair",
      shortDescription:
        "Furnace and heat pump service to restore reliable warmth before the next cold night.",
      iconId: "heat",
      href: "#contact",
    },
    {
      id: "installation",
      name: "HVAC Installation",
      shortDescription:
        "Right-sized system replacements with a clean install and a walkthrough before we leave.",
      iconId: "install",
      href: "#contact",
    },
    {
      id: "maintenance",
      name: "Preventive Maintenance",
      shortDescription:
        "Seasonal tune-ups that keep efficiency up, repair surprises down, and warranties intact.",
      iconId: "maintain",
      href: "#contact",
    },
  ],
  about: {
    heading: "A local crew that treats your home like our own.",
    text: "Peak Heating & Air is a fictional East Valley shop built to demonstrate this template. The story is simple: show up on time, explain the issue in plain language, and leave the workspace cleaner than we found it. No scare tactics. No mystery fees. Just careful HVAC work for homeowners who want it done once.",
    imageSrc: "/templates/service-modern-01/about.jpg",
    imageAlt: "Technician speaking with a homeowner in a bright, modern kitchen",
    highlights: [
      { id: "homes", value: "2,400+", label: "Homes serviced" },
      { id: "rating", value: "4.9", label: "Demo review average" },
      { id: "emergency", value: "24/7", label: "Emergency line" },
    ],
  },
  whyChooseUs: [
    {
      id: "upfront",
      title: "Upfront pricing",
      description:
        "You’ll see the recommended repair and the total before any work begins.",
      iconId: "receipt",
    },
    {
      id: "same-day",
      title: "Same-day availability",
      description:
        "Most repair calls are scheduled the same day when you reach us before noon.",
      iconId: "clock",
    },
    {
      id: "local",
      title: "Neighborhood technicians",
      description:
        "The same East Valley team handles diagnostics, repair, and follow-up.",
      iconId: "home",
    },
    {
      id: "respect",
      title: "Respect for the home",
      description:
        "Shoe covers, drop cloths, and a full cleanup are part of every visit.",
      iconId: "shield",
    },
  ],
  gallery: [
    {
      id: "gallery-1",
      imageSrc: "/templates/service-modern-01/gallery-1.jpg",
      alt: "Outdoor condenser installation beside a stucco home",
      caption: "System replacement",
    },
    {
      id: "gallery-2",
      imageSrc: "/templates/service-modern-01/gallery-2.jpg",
      alt: "Technician servicing a furnace in a clean mechanical room",
      caption: "Heating service",
    },
    {
      id: "gallery-3",
      imageSrc: "/templates/service-modern-01/gallery-3.jpg",
      alt: "Smart thermostat on a modern interior wall",
      caption: "Comfort controls",
    },
    {
      id: "gallery-4",
      imageSrc: "/templates/service-modern-01/gallery-4.jpg",
      alt: "Service van parked in a residential driveway",
      caption: "On-site support",
    },
  ],
  testimonials: [
    {
      id: "t1",
      customerName: "Marisol V.",
      quote:
        "They diagnosed the issue in minutes, explained the options, and had the AC cooling again the same afternoon.",
      rating: 5,
      sourceLabel: "Mesa homeowner",
    },
    {
      id: "t2",
      customerName: "Daniel K.",
      quote:
        "No pressure to replace the whole system. They repaired what was needed and left the garage spotless.",
      rating: 5,
      sourceLabel: "Gilbert homeowner",
    },
    {
      id: "t3",
      customerName: "Priya S.",
      quote:
        "Clear arrival window, respectful technicians, and a maintenance plan that actually makes sense.",
      rating: 5,
      sourceLabel: "Tempe homeowner",
    },
  ],
  serviceAreas: [
    "Mesa",
    "Tempe",
    "Chandler",
    "Gilbert",
    "Scottsdale",
    "Queen Creek",
  ],
  faq: [
    {
      id: "faq-1",
      question: "Do you offer same-day service?",
      answer:
        "Yes. For most repair calls placed before noon, we schedule a same-day visit. After-hours heating and cooling emergencies are handled through our 24/7 line.",
    },
    {
      id: "faq-2",
      question: "Will I get pricing before the work starts?",
      answer:
        "Always. After diagnosis, we walk through the recommended repair, the total, and any optional upgrades before we begin.",
    },
    {
      id: "faq-3",
      question: "What brands do you service?",
      answer:
        "We service all major residential HVAC brands. If a part needs to be ordered, we’ll tell you the timeline before you decide.",
    },
    {
      id: "faq-4",
      question: "Is this a real HVAC company?",
      answer:
        "No. Peak Heating & Air is fictional demo content used to preview the Service Modern 01 template for Project X Website Service.",
    },
  ],
  contact: {
    phone: "(480) 555-0142",
    email: "hello@peakheatingair.example",
    address: "2140 Baseline Rd, Mesa, AZ 85204",
    hours: [
      "Monday–Friday: 7:00 AM – 6:00 PM",
      "Saturday: 8:00 AM – 2:00 PM",
      "24/7 emergency service",
    ],
    cta: {
      label: "Request Service",
      href: "tel:+14805550142",
    },
  },
  socialLinks: [
    {
      id: "facebook",
      label: "Facebook",
      href: "https://facebook.com/peakheatingair-demo",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://instagram.com/peakheatingair-demo",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com/company/peakheatingair-demo",
    },
  ],
  navigation: [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#gallery" },
    { label: "Reviews", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  sections: {
    services: {
      eyebrow: "Services",
      heading: "Home comfort, handled with care.",
    },
    whyChooseUs: {
      eyebrow: "Why choose us",
      heading: "Straightforward service. No runaround.",
    },
    gallery: {
      eyebrow: "Recent work",
      heading: "Quiet installs. Clean job sites.",
    },
    testimonials: {
      eyebrow: "Neighbors",
      heading: "What homeowners tell us after the job.",
    },
    serviceAreas: {
      eyebrow: "Service areas",
      heading: "East Valley coverage, one crew at a time.",
    },
    faq: {
      eyebrow: "FAQ",
      heading: "Straight answers before we roll out.",
    },
    finalCta: {
      heading: "Need a technician this week?",
      text: "Tell us what is going on with the system. We will confirm a visit window and send a licensed tech — no surprise add-ons.",
    },
    contact: {
      eyebrow: "Contact",
      heading: "Reach the shop before the next heat wave.",
      intro:
        "Call, email, or request service. Peak Heating & Air is fictional demo content — the contact details below are not a real business.",
    },
  },
  footerNote:
    "Fictional demo website for Project X Website Service. Not a real HVAC company.",
};
