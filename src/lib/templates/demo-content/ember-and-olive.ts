import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export const EMBER_AND_OLIVE_DEMO: RestaurantWebsiteContent = {
  business: {
    businessName: "Ember & Olive",
    logoText: "Ember",
    tagline: "Neighborhood Mediterranean",
    phone: "(480) 555-0177",
    email: "hello@emberandolive.example",
    address: "418 W Cinder Lane, Mesa, AZ 85201",
    businessHours: [
      "Tuesday–Thursday: 5:00 PM – 9:00 PM",
      "Friday–Saturday: 5:00 PM – 10:00 PM",
      "Sunday: 4:00 PM – 8:00 PM",
      "Closed Monday",
    ],
  },
  branding: {
    primaryColor: "#2a1f18",
    accentColor: "#c45c26",
    secondaryColor: "#6b7f4a",
    backgroundColor: "#f7f1e8",
    surfaceColor: "#fffaf4",
    theme: "light",
  },
  seo: {
    title: "Ember & Olive | Mesa Mediterranean Demo",
    description:
      "Fictional Mesa restaurant used to preview the Restaurant Modern 01 website template. Not a real business.",
  },
  hero: {
    eyebrow: "Mesa, Arizona · Dinner",
    headline: "Wood fire, olive oil, and a table that feels like home.",
    subheadline:
      "Ember & Olive is a fictional Mediterranean neighborhood restaurant for Project X Website Service. Come for slow-cooked lamb, citrus-bright seafood, and a glass at the counter.",
    primaryCta: {
      label: "Reserve a Table",
      href: "#reserve",
    },
    secondaryCta: {
      label: "View Menu",
      href: "#menu",
    },
    imageSrc: "/templates/restaurant-modern-01/hero.jpg",
    imageAlt:
      "Warm candlelit dining room with espresso wood tables and cream plaster walls",
    supportingItem: {
      label: "Dinner service",
      value: "Tue–Sun",
    },
  },
  intro: {
    heading: "A neighborhood table with a Mediterranean hearth.",
    text: "Ember & Olive is fictional demo content, imagined as a small Mesa dining room built around wood fire, citrus, herbs, and olive oil. The kitchen is meant to feel generous rather than formal — the kind of place you return to on a weeknight.",
    imageSrc: "/templates/restaurant-modern-01/intro.jpg",
    imageAlt: "Wood-fired branzino with lemon, herbs, and olive oil on a ceramic platter",
  },
  featuredDishes: [
    {
      id: "featured-branzino",
      name: "Wood-Fired Branzino",
      description:
        "Whole fish, charred lemon, wild oregano, and a pour of olive oil at the table.",
      price: "38",
      imageSrc: "/templates/restaurant-modern-01/featured-branzino.jpg",
      imageAlt: "Plated wood-fired branzino with lemon and herbs",
      tag: "Popular",
    },
    {
      id: "featured-lamb",
      name: "Herb Lamb Shoulder",
      description:
        "Slow-cooked until it yields, finished with salsa verde and roasted vegetables.",
      price: "42",
      imageSrc: "/templates/restaurant-modern-01/featured-lamb.jpg",
      imageAlt: "Herb-crusted lamb shoulder with salsa verde",
      tag: "Chef's pick",
    },
    {
      id: "featured-pasta",
      name: "Saffron Linguine",
      description:
        "Silk pasta, coastal seafood, and a saffron broth brightened with citrus.",
      price: "29",
      imageSrc: "/templates/restaurant-modern-01/featured-pasta.jpg",
      imageAlt: "Saffron linguine with seafood in a ceramic bowl",
    },
  ],
  menu: [
    {
      id: "menu-starters",
      name: "Starters",
      items: [
        {
          id: "starter-feta",
          name: "Whipped Feta",
          description: "Chili honey, toasted sesame, and warm flatbread.",
          price: "14",
          tag: "Vegetarian",
        },
        {
          id: "starter-octopus",
          name: "Charred Octopus",
          description: "Fingerling potatoes, smoked paprika, and lemon.",
          price: "21",
          tag: "Popular",
        },
        {
          id: "starter-olives",
          name: "Citrus Olives",
          description: "Warm Castelvetrano olives, orange peel, and rosemary.",
          price: "9",
          tag: "Vegetarian",
        },
      ],
    },
    {
      id: "menu-mains",
      name: "Mains",
      items: [
        {
          id: "main-branzino",
          name: "Wood-Fired Branzino",
          description: "Whole fish, charred lemon, oregano, olive oil.",
          price: "38",
          tag: "Popular",
        },
        {
          id: "main-lamb",
          name: "Herb Lamb Shoulder",
          description: "Salsa verde, roasted carrots, and pan juices.",
          price: "42",
        },
        {
          id: "main-chicken",
          name: "Citrus Chicken",
          description: "Half chicken, fennel pollen, and grilled lemon.",
          price: "28",
        },
      ],
    },
    {
      id: "menu-pasta",
      name: "Pasta",
      items: [
        {
          id: "pasta-saffron",
          name: "Saffron Linguine",
          description: "Mussels, shrimp, and a citrus saffron broth.",
          price: "29",
        },
        {
          id: "pasta-ragu",
          name: "Lamb Ragù Paccheri",
          description: "Slow lamb, tomato, and pecorino.",
          price: "27",
        },
      ],
    },
    {
      id: "menu-desserts",
      name: "Desserts",
      items: [
        {
          id: "dessert-cake",
          name: "Olive Oil Cake",
          description: "Citrus zest, honey, and crushed pistachio.",
          price: "12",
          tag: "Vegetarian",
        },
        {
          id: "dessert-panna",
          name: "Burnt Honey Panna Cotta",
          description: "Vanilla bean and a thin bitter-caramel edge.",
          price: "11",
        },
      ],
    },
    {
      id: "menu-drinks",
      name: "Drinks",
      items: [
        {
          id: "drink-spritz",
          name: "House Spritz",
          description: "Bitter orange, sparkling wine, and olive leaf.",
          price: "14",
        },
        {
          id: "drink-negroni",
          name: "Cedar Negroni",
          description: "Gin, vermouth, and a smoked orange peel. Fictional house cocktail.",
          price: "16",
        },
        {
          id: "drink-citrus",
          name: "Sparkling Citrus Cooler",
          description: "Grapefruit, thyme, and soda. Non-alcoholic.",
          price: "8",
        },
      ],
    },
  ],
  about: {
    heading: "Our story, imagined for this demo.",
    text: "Ember & Olive is not a real restaurant. This story exists so Project X can show a restaurant-specific website: a small room, a wood oven, and a menu that changes with the citrus season. Replace this copy with a Client's own history before any sales conversation becomes a real site.",
    imageSrc: "/templates/restaurant-modern-01/story.jpg",
    imageAlt:
      "Marble counter still life with olive oil, green olives, rosemary, and rustic bread",
  },
  gallery: [
    {
      id: "gallery-patio",
      imageSrc: "/templates/restaurant-modern-01/gallery-patio.jpg",
      alt: "Evening patio with string lights and terracotta olive planters",
      caption: "The Cinder Lane patio, imagined after sunset.",
    },
    {
      id: "gallery-table",
      imageSrc: "/templates/restaurant-modern-01/gallery-table.jpg",
      alt: "Candlelit table setting with cream linen and terracotta-rimmed plates",
      caption: "A quiet table before service.",
    },
    {
      id: "gallery-dessert",
      imageSrc: "/templates/restaurant-modern-01/gallery-dessert.jpg",
      alt: "Olive oil cake with honey, citrus zest, and pistachios",
      caption: "Olive oil cake, plated for the pass.",
    },
    {
      id: "gallery-pasta",
      imageSrc: "/templates/restaurant-modern-01/featured-pasta.jpg",
      alt: "Saffron linguine in a shallow ceramic bowl",
      caption: "Saffron linguine from the pasta station.",
    },
  ],
  testimonials: [
    {
      id: "quote-mara",
      customerName: "Mara Ellison",
      quote:
        "If this were a real neighborhood spot, we would already have a usual table. The room feels warm without trying too hard.",
      rating: 5,
      sourceLabel: "Fictional guest note",
    },
    {
      id: "quote-julian",
      customerName: "Julian Peck",
      quote:
        "The branzino and the olive oil cake are the kind of dishes you remember on the drive home. Demo copy, but the mood is right.",
      rating: 5,
      sourceLabel: "Fictional guest note",
    },
    {
      id: "quote-nia",
      customerName: "Nia Calder",
      quote:
        "We came for a weeknight and stayed for another round at the counter. Friendly, unfussy, and clearly food-first.",
      rating: 4,
      sourceLabel: "Fictional guest note",
    },
  ],
  faq: [
    {
      id: "faq-reservations",
      question: "Do you take reservations?",
      answer:
        "This demo uses a Reserve a Table link only. There is no real booking system, OpenTable, or Resy integration. A live restaurant would point that button at a phone number or an external URL.",
    },
    {
      id: "faq-dietary",
      question: "Can the kitchen help with vegetarian or spicy requests?",
      answer:
        "Menu tags such as Vegetarian, Popular, and Spicy are display-only. In a real restaurant, the kitchen would confirm allergens when you call.",
    },
    {
      id: "faq-parking",
      question: "Is there parking?",
      answer:
        "The fictional Cinder Lane address is imagined with street parking and a small lot behind the dining room. Replace this with the Client's real parking notes.",
    },
    {
      id: "faq-demo",
      question: "Is Ember & Olive a real restaurant?",
      answer:
        "No. Ember & Olive is fictional demo content created for Project X Website Service. Do not treat the name, menu, reviews, photos, or address as a real business.",
    },
  ],
  reservation: {
    label: "Reserve a Table",
    href: "",
  },
  contact: {
    phone: "(480) 555-0177",
    email: "hello@emberandolive.example",
    address: "418 W Cinder Lane, Mesa, AZ 85201",
    hours: [
      "Tuesday–Thursday: 5:00 PM – 9:00 PM",
      "Friday–Saturday: 5:00 PM – 10:00 PM",
      "Sunday: 4:00 PM – 8:00 PM",
      "Closed Monday",
    ],
    cta: {
      label: "Call Us",
      href: "tel:+14805550177",
    },
  },
  socialLinks: [
    {
      id: "instagram",
      label: "Instagram",
      href: "https://instagram.example/emberandolive-demo",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "",
    },
  ],
  navigation: [
    { label: "Home", href: "#top" },
    { label: "Menu", href: "#menu" },
    { label: "Our Story", href: "#story" },
    { label: "Gallery", href: "#gallery" },
    { label: "Location", href: "#location" },
  ],
  sections: {
    intro: { eyebrow: "Welcome", heading: "Come in, sit down, stay awhile." },
    featured: { eyebrow: "From the hearth", heading: "Dishes we are known for." },
    menu: { eyebrow: "The menu", heading: "Tonight at Ember & Olive." },
    about: { eyebrow: "Our story", heading: "Built around fire and olive oil." },
    gallery: { eyebrow: "The room", heading: "A look around the dining room." },
    testimonials: {
      eyebrow: "From the table",
      heading: "What guests say in this demo.",
    },
    location: {
      eyebrow: "Visit",
      heading: "Location & hours",
      intro:
        "A fictional Mesa address for this template. Replace it with the Client's real street, hours, and phone.",
    },
    faq: { eyebrow: "Questions", heading: "Before you visit." },
    finalCta: {
      heading: "Save a table for tonight.",
      text: "This demo does not book reservations. Use Call Us, or add an external reserve link when the Client has one.",
    },
  },
  footerNote:
    "Ember & Olive is fictional demo content for Project X Website Service. Not a real restaurant.",
  sectionVisibility: {
    intro: true,
    featured: true,
    about: true,
    gallery: true,
    testimonials: true,
    faq: true,
    finalCta: true,
  },
};
