export type DemoAsset = {
  src: string;
  label: string;
};

export const SERVICE_MODERN_01_DEMO_ASSETS: DemoAsset[] = [
  { src: "/templates/service-modern-01/hero.jpg", label: "Hero — outdoor AC service" },
  { src: "/templates/service-modern-01/about.jpg", label: "About — technician visit" },
  { src: "/templates/service-modern-01/gallery-1.jpg", label: "Gallery 1 — condenser install" },
  { src: "/templates/service-modern-01/gallery-2.jpg", label: "Gallery 2 — furnace service" },
  { src: "/templates/service-modern-01/gallery-3.jpg", label: "Gallery 3 — thermostat" },
  { src: "/templates/service-modern-01/gallery-4.jpg", label: "Gallery 4 — service van" },
];

export const RESTAURANT_MODERN_01_DEMO_ASSETS: DemoAsset[] = [
  { src: "/templates/restaurant-modern-01/hero.jpg", label: "Hero — dining room" },
  { src: "/templates/restaurant-modern-01/intro.jpg", label: "Intro — wood-fired branzino" },
  { src: "/templates/restaurant-modern-01/story.jpg", label: "Story — olive oil still life" },
  {
    src: "/templates/restaurant-modern-01/featured-branzino.jpg",
    label: "Featured — wood-fired branzino",
  },
  {
    src: "/templates/restaurant-modern-01/featured-lamb.jpg",
    label: "Featured — herb lamb shoulder",
  },
  {
    src: "/templates/restaurant-modern-01/featured-pasta.jpg",
    label: "Featured — saffron linguine",
  },
  { src: "/templates/restaurant-modern-01/gallery-patio.jpg", label: "Gallery — evening patio" },
  { src: "/templates/restaurant-modern-01/gallery-table.jpg", label: "Gallery — table setting" },
  { src: "/templates/restaurant-modern-01/gallery-dessert.jpg", label: "Gallery — olive oil cake" },
];

export const SALON_MODERN_01_DEMO_ASSETS: DemoAsset[] = [
  { src: "/templates/salon-modern-01/hero.jpg", label: "Hero — atelier interior" },
  { src: "/templates/salon-modern-01/intro.jpg", label: "Intro — tools still life" },
  { src: "/templates/salon-modern-01/story.jpg", label: "Story — waiting lounge" },
  { src: "/templates/salon-modern-01/team-mira.jpg", label: "Team — Mira Solano" },
  { src: "/templates/salon-modern-01/team-jonah.jpg", label: "Team — Jonah Hale" },
  { src: "/templates/salon-modern-01/team-amara.jpg", label: "Team — Amara Quinn" },
  { src: "/templates/salon-modern-01/gallery-cut.jpg", label: "Gallery — finished cut" },
  { src: "/templates/salon-modern-01/gallery-nails.jpg", label: "Gallery — studio manicure" },
  { src: "/templates/salon-modern-01/gallery-spa.jpg", label: "Gallery — treatment room" },
];

export function getTemplateDemoAssets(templateId: string): DemoAsset[] {
  if (templateId === "restaurant-modern-01") {
    return RESTAURANT_MODERN_01_DEMO_ASSETS;
  }
  if (templateId === "salon-modern-01") {
    return SALON_MODERN_01_DEMO_ASSETS;
  }

  return SERVICE_MODERN_01_DEMO_ASSETS;
}
