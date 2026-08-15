import type { SalonWebsiteContent } from "@/lib/templates/types";

export const ROWAN_ATELIER_DEMO: SalonWebsiteContent = {
  business: {
    businessName: "Rowan Atelier",
    logoText: "Rowan",
    tagline: "Hair · Skin · Barbering",
    phone: "(480) 555-0142",
    email: "hello@rowanatelier.example",
    address: "418 W Lime Street, Tempe, AZ 85281",
    businessHours: [
      "Tue–Fri 9:00am–7:00pm",
      "Sat 9:00am–4:00pm",
      "Sun–Mon closed",
    ],
  },
  branding: {
    primaryColor: "#1c1917",
    accentColor: "#9a6b4f",
    secondaryColor: "#6d7a73",
    backgroundColor: "#f3efe8",
    surfaceColor: "#fbf8f3",
    theme: "light",
  },
  seo: {
    title: "Rowan Atelier | Fictional Salon Demo",
    description:
      "Fictional demo salon website for Project X Website Service. Hair, skin, and barbering content for template review only.",
  },
  hero: {
    eyebrow: "Tempe, Arizona · By appointment",
    headline: "Quiet rooms. Precise work. A studio that lets the cut speak.",
    subheadline:
      "Rowan Atelier is a fictional neighborhood studio for Project X Website Service. Come for hair, color, skin, and barbering in a calm, unhurried room.",
    primaryCta: { label: "Book Appointment", href: "#book" },
    secondaryCta: { label: "View Services", href: "#services" },
    imageSrc: "/templates/salon-modern-01/hero.jpg",
    imageAlt:
      "A fictional modern salon interior with greige plaster walls, oak millwork, and empty styling chairs in daylight.",
    supportingItem: {
      label: "Studio hours",
      value: "Tue–Sat",
    },
  },
  intro: {
    heading: "A neighborhood atelier for hair, skin, and the chair in between.",
    text: "Rowan Atelier is fictional demo content for a Tempe studio. The rooms are imagined as quiet, the tools are kept simple, and the menu stays readable — hair, color, nails, skin, and barbering without locking the template to one niche.",
    imageSrc: "/templates/salon-modern-01/intro.jpg",
    imageAlt:
      "Editorial still life of shears, a wooden comb, linen, and a ceramic bowl on limestone.",
  },
  services: [
    {
      id: "svc-cut",
      name: "Precision Cut",
      description: "Consultation, shape, and finish for any length. Built around bone structure, not a trend sheet.",
      price: "$68",
      duration: "45 min",
      category: "Hair",
    },
    {
      id: "svc-color",
      name: "Lived-in Color",
      description: "Soft dimension and gloss designed to grow out cleanly. Starting price; formula time varies.",
      price: "From $145",
      duration: "2 hr",
      category: "Color",
    },
    {
      id: "svc-nails",
      name: "Studio Manicure",
      description: "Shape, care, and a quiet polish. Short, natural finishes preferred.",
      price: "$42",
      duration: "40 min",
      category: "Nails",
    },
    {
      id: "svc-skin",
      name: "Skin Reset Facial",
      description: "A calm, treatment-led facial for tired city skin. No spa-menu theatrics.",
      price: "$95",
      duration: "50 min",
      category: "Skin",
    },
    {
      id: "svc-shave",
      name: "Classic Shave",
      description: "Hot towel, close shave, and a clean finish. For beards or a full reset.",
      price: "$38",
      duration: "30 min",
      category: "Barbering",
    },
  ],
  about: {
    heading: "Our story, written for this demo.",
    text: "Rowan Atelier is not a real business. It exists so Project X can show a salon-and-beauty template: editorial type, image-forward rooms, structured services, and a booking link that never becomes a scheduler.",
    imageSrc: "/templates/salon-modern-01/story.jpg",
    imageAlt:
      "A fictional waiting lounge with an oak bench, stone table, linen towels, and a tall plant in daylight.",
  },
  team: [
    {
      id: "team-mira",
      name: "Mira Solano",
      role: "Creative Director",
      bio: "Fictional stylist. Cuts, consultations, and the quiet decisions that keep a room feeling unhurried.",
      imageSrc: "/templates/salon-modern-01/team-mira.jpg",
      imageAlt: "Portrait of Mira Solano, a fictional creative director in a charcoal linen shirt.",
    },
    {
      id: "team-jonah",
      name: "Jonah Hale",
      role: "Barber & Texture",
      bio: "Fictional barber. Fades, shaves, and texture work for clients who want the chair, not a trend reel.",
      imageSrc: "/templates/salon-modern-01/team-jonah.jpg",
      imageAlt: "Portrait of Jonah Hale, a fictional barber in a black overshirt.",
    },
    {
      id: "team-amara",
      name: "Amara Quinn",
      role: "Color & Skin",
      bio: "Fictional colorist. Lived-in color and treatment-led skin work, written as demo staff only.",
      imageSrc: "/templates/salon-modern-01/team-amara.jpg",
      imageAlt: "Portrait of Amara Quinn, a fictional colorist in a taupe knit top.",
    },
  ],
  gallery: [
    {
      id: "gal-cut",
      imageSrc: "/templates/salon-modern-01/gallery-cut.jpg",
      alt: "Close-up of freshly cut dark hair with soft bronze dimension, fictional demo photography.",
      caption: "A finished cut, imagined for the chair.",
    },
    {
      id: "gal-nails",
      imageSrc: "/templates/salon-modern-01/gallery-nails.jpg",
      alt: "Short natural nails on linen beside a ceramic dish, fictional manicure still life.",
      caption: "Quiet polish. No glitter required.",
    },
    {
      id: "gal-spa",
      imageSrc: "/templates/salon-modern-01/gallery-spa.jpg",
      alt: "Rolled linen towels and a stone basin in a fictional treatment room.",
      caption: "The treatment room, between appointments.",
    },
  ],
  testimonials: [
    {
      id: "t-1",
      customerName: "Elena V.",
      quote:
        "Fictional review: the room felt calm, the cut was precise, and nobody tried to sell me a membership.",
      rating: 5,
      sourceLabel: "Demo review",
    },
    {
      id: "t-2",
      customerName: "Marcus T.",
      quote:
        "Fictional review: a proper shave and a conversation that stayed on the work. I’ll be back on Tuesdays.",
      rating: 5,
      sourceLabel: "Demo review",
    },
    {
      id: "t-3",
      customerName: "Priya N.",
      quote:
        "Fictional review: color that looks like my hair, not a filter. The studio feels grown, not loud.",
      rating: 5,
      sourceLabel: "Demo review",
    },
  ],
  faq: [
    {
      id: "faq-book",
      question: "How do I book?",
      answer:
        "This demo uses a booking button only. Add the client’s Fresha, Square, or other external link later — Project X does not run appointments.",
    },
    {
      id: "faq-new",
      question: "Do you take new guests?",
      answer:
        "In this fictional studio, yes — by appointment. Real clients should replace this answer with their own policy.",
    },
    {
      id: "faq-contact",
      question: "Is Rowan Atelier a real salon?",
      answer:
        "No. Rowan Atelier is fictional demo content for Project X Website Service.",
    },
  ],
  booking: {
    label: "Book Appointment",
    href: "",
  },
  contact: {
    phone: "(480) 555-0142",
    email: "hello@rowanatelier.example",
    address: "418 W Lime Street, Tempe, AZ 85281",
    hours: [
      "Tue–Fri 9:00am–7:00pm",
      "Sat 9:00am–4:00pm",
      "Sun–Mon closed",
    ],
    cta: { label: "Call the Studio", href: "tel:+14805550142" },
  },
  socialLinks: [
    { id: "instagram", label: "Instagram", href: "" },
    { id: "facebook", label: "Facebook", href: "" },
  ],
  navigation: [
    { label: "Studio", href: "#intro" },
    { label: "Services", href: "#services" },
    { label: "Story", href: "#story" },
    { label: "Team", href: "#team" },
    { label: "Gallery", href: "#gallery" },
    { label: "Visit", href: "#location" },
  ],
  sections: {
    intro: { eyebrow: "The studio", heading: "Made for the chair, not the feed." },
    services: { eyebrow: "The menu", heading: "Hair, color, skin, nails, and the razor." },
    about: { eyebrow: "Our story", heading: "A room with better light." },
    team: { eyebrow: "The chair", heading: "People who keep the work quiet." },
    gallery: { eyebrow: "The work", heading: "Texture, finish, and the room between." },
    testimonials: { eyebrow: "Notes", heading: "What guests might say." },
    location: {
      eyebrow: "Visit",
      heading: "Lime Street, by appointment.",
      intro:
        "Rowan Atelier is a fictional Tempe address used only for this template demo.",
    },
    faq: { eyebrow: "Details", heading: "A few practical answers." },
    finalCta: {
      heading: "Save a chair.",
      text: "Add an external booking link when the client has one, or call the studio.",
    },
  },
  footerNote:
    "Rowan Atelier is fictional demo content for Project X Website Service.",
  sectionVisibility: {
    intro: true,
    services: true,
    about: true,
    team: true,
    gallery: true,
    testimonials: true,
    faq: true,
    finalCta: true,
  },
};
