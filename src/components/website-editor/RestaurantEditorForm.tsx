"use client";

import { Panel } from "@/components/ui/Panel";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import {
  RestaurantBrandingPanel,
  RestaurantBusinessPanel,
  RestaurantContactPanel,
  RestaurantFaqPanel,
  RestaurantFeaturedPanel,
  RestaurantGalleryPanel,
  RestaurantHeroPanel,
  RestaurantIntroPanel,
  RestaurantMenuPanel,
  RestaurantSocialPanel,
  RestaurantStoryPanel,
  RestaurantTestimonialsPanel,
  RestaurantVisibilityPanel,
  type RestaurantEditorUpdate,
} from "./restaurant-panels";

export type RestaurantEditorPanelId =
  | "business"
  | "branding"
  | "hero"
  | "intro"
  | "featured"
  | "menu"
  | "about"
  | "gallery"
  | "testimonials"
  | "faq"
  | "contact"
  | "social"
  | "visibility";

export const RESTAURANT_NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: RestaurantEditorPanelId; label: string }>;
}> = [
  {
    label: "General",
    items: [
      { id: "business", label: "Restaurant" },
      { id: "branding", label: "Branding" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "hero", label: "Hero" },
      { id: "intro", label: "Introduction" },
      { id: "featured", label: "Featured dishes" },
      { id: "menu", label: "Menu" },
      { id: "about", label: "Our Story" },
      { id: "gallery", label: "Gallery" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
    ],
  },
  {
    label: "Visit",
    items: [
      { id: "contact", label: "Location & CTA" },
      { id: "social", label: "Social links" },
    ],
  },
  {
    label: "Sections",
    items: [{ id: "visibility", label: "On / Off" }],
  },
];

export const RESTAURANT_PANEL_TITLES: Record<RestaurantEditorPanelId, string> = {
  business: "Restaurant info",
  branding: "Branding",
  hero: "Hero",
  intro: "Introduction",
  featured: "Featured dishes",
  menu: "Menu",
  about: "Our Story",
  gallery: "Gallery",
  testimonials: "Testimonials",
  faq: "FAQ",
  contact: "Location, hours & reservation CTA",
  social: "Social links",
  visibility: "Section visibility",
};

type RestaurantEditorFormProps = {
  panel: RestaurantEditorPanelId;
  content: RestaurantWebsiteContent;
  errors: Record<string, string>;
  onUpdate: RestaurantEditorUpdate;
  onPanelChange: (panel: RestaurantEditorPanelId) => void;
};

export function RestaurantEditorForm({
  panel,
  content,
  errors,
  onUpdate,
  onPanelChange,
}: RestaurantEditorFormProps) {
  const navItems = RESTAURANT_NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[9rem_minmax(0,1fr)]">
      <nav aria-label="Editor sections" className="xl:sticky xl:top-0 xl:self-start">
        <div className="xl:hidden">
          <label htmlFor="restaurant-editor-panel" className="sr-only">
            Editor section
          </label>
          <select
            id="restaurant-editor-panel"
            value={panel}
            onChange={(event) =>
              onPanelChange(event.target.value as RestaurantEditorPanelId)
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden space-y-3 xl:block">
          {RESTAURANT_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {group.label}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const active = panel === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onPanelChange(item.id)}
                        aria-current={active ? "page" : undefined}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium ${
                          active
                            ? "bg-accent/10 text-foreground"
                            : "text-muted hover:bg-card hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <Panel className="p-4 sm:p-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {RESTAURANT_PANEL_TITLES[panel]}
        </h3>
        <div className="mt-4">
          {panel === "business" ? (
            <RestaurantBusinessPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "branding" ? (
            <RestaurantBrandingPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "hero" ? (
            <RestaurantHeroPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "intro" ? (
            <RestaurantIntroPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "featured" ? (
            <RestaurantFeaturedPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "menu" ? (
            <RestaurantMenuPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "about" ? (
            <RestaurantStoryPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "gallery" ? (
            <RestaurantGalleryPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "testimonials" ? (
            <RestaurantTestimonialsPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "faq" ? (
            <RestaurantFaqPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "contact" ? (
            <RestaurantContactPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "social" ? (
            <RestaurantSocialPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "visibility" ? (
            <RestaurantVisibilityPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
