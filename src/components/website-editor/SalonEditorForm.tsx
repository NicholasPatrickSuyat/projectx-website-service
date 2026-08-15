"use client";

import { Panel } from "@/components/ui/Panel";
import type { SalonWebsiteContent } from "@/lib/templates/types";
import {
  SalonBrandingPanel,
  SalonBusinessPanel,
  SalonContactPanel,
  SalonFaqPanel,
  SalonGalleryPanel,
  SalonHeroPanel,
  SalonIntroPanel,
  SalonServicesPanel,
  SalonSocialPanel,
  SalonStoryPanel,
  SalonTeamPanel,
  SalonTestimonialsPanel,
  SalonVisibilityPanel,
  type SalonEditorUpdate,
} from "./salon-panels";

export type SalonEditorPanelId =
  | "business"
  | "branding"
  | "hero"
  | "intro"
  | "services"
  | "about"
  | "team"
  | "gallery"
  | "testimonials"
  | "faq"
  | "contact"
  | "social"
  | "visibility";

export const SALON_NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: SalonEditorPanelId; label: string }>;
}> = [
  {
    label: "General",
    items: [
      { id: "business", label: "Studio" },
      { id: "branding", label: "Branding" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "hero", label: "Hero" },
      { id: "intro", label: "Introduction" },
      { id: "services", label: "Services" },
      { id: "about", label: "Our Story" },
      { id: "team", label: "Team" },
      { id: "gallery", label: "Gallery" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
    ],
  },
  {
    label: "Visit",
    items: [
      { id: "contact", label: "Location & Booking" },
      { id: "social", label: "Social links" },
    ],
  },
  {
    label: "Sections",
    items: [{ id: "visibility", label: "On / Off" }],
  },
];

export const SALON_PANEL_TITLES: Record<SalonEditorPanelId, string> = {
  business: "Studio info",
  branding: "Branding",
  hero: "Hero",
  intro: "Introduction",
  services: "Services",
  about: "Our Story",
  team: "Team / stylists",
  gallery: "Gallery",
  testimonials: "Testimonials",
  faq: "FAQ",
  contact: "Location, hours & booking CTA",
  social: "Social links",
  visibility: "Section visibility",
};

type SalonEditorFormProps = {
  panel: SalonEditorPanelId;
  content: SalonWebsiteContent;
  errors: Record<string, string>;
  onUpdate: SalonEditorUpdate;
  onPanelChange: (panel: SalonEditorPanelId) => void;
};

export function SalonEditorForm({
  panel,
  content,
  errors,
  onUpdate,
  onPanelChange,
}: SalonEditorFormProps) {
  const navItems = SALON_NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[9rem_minmax(0,1fr)]">
      <nav aria-label="Editor sections" className="xl:sticky xl:top-0 xl:self-start">
        <div className="xl:hidden">
          <label htmlFor="salon-editor-panel" className="sr-only">
            Editor section
          </label>
          <select
            id="salon-editor-panel"
            value={panel}
            onChange={(event) =>
              onPanelChange(event.target.value as SalonEditorPanelId)
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
          {SALON_NAV_GROUPS.map((group) => (
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
          {SALON_PANEL_TITLES[panel]}
        </h3>
        <div className="mt-4">
          {panel === "business" ? (
            <SalonBusinessPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "branding" ? (
            <SalonBrandingPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "hero" ? (
            <SalonHeroPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "intro" ? (
            <SalonIntroPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "services" ? (
            <SalonServicesPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "about" ? (
            <SalonStoryPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "team" ? (
            <SalonTeamPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "gallery" ? (
            <SalonGalleryPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "testimonials" ? (
            <SalonTestimonialsPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "faq" ? (
            <SalonFaqPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "contact" ? (
            <SalonContactPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "social" ? (
            <SalonSocialPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "visibility" ? (
            <SalonVisibilityPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
