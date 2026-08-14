"use client";

import { Panel } from "@/components/ui/Panel";
import type { ServiceWebsiteContent } from "@/lib/templates/types";
import {
  AboutPanel,
  BrandingPanel,
  BusinessPanel,
  ContactPanel,
  FaqPanel,
  GalleryPanel,
  HeroPanel,
  ServiceAreasPanel,
  ServicesPanel,
  SocialPanel,
  TestimonialsPanel,
  VisibilityPanel,
  WhyChooseUsPanel,
  type EditorUpdate,
} from "./panels";

export type EditorPanelId =
  | "business"
  | "branding"
  | "hero"
  | "services"
  | "about"
  | "whyChooseUs"
  | "gallery"
  | "testimonials"
  | "serviceAreas"
  | "faq"
  | "contact"
  | "social"
  | "visibility";

export const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: EditorPanelId; label: string }>;
}> = [
  {
    label: "General",
    items: [
      { id: "business", label: "Business" },
      { id: "branding", label: "Branding" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "hero", label: "Hero" },
      { id: "services", label: "Services" },
      { id: "about", label: "About" },
      { id: "whyChooseUs", label: "Why choose us" },
      { id: "gallery", label: "Gallery" },
      { id: "testimonials", label: "Testimonials" },
      { id: "serviceAreas", label: "Service areas" },
      { id: "faq", label: "FAQ" },
    ],
  },
  {
    label: "Contact",
    items: [
      { id: "contact", label: "Contact info" },
      { id: "social", label: "Social links" },
    ],
  },
  {
    label: "Sections",
    items: [{ id: "visibility", label: "On / Off" }],
  },
];

export const PANEL_TITLES: Record<EditorPanelId, string> = {
  business: "Business",
  branding: "Branding",
  hero: "Hero",
  services: "Services",
  about: "About",
  whyChooseUs: "Why choose us",
  gallery: "Gallery",
  testimonials: "Testimonials",
  serviceAreas: "Service areas",
  faq: "FAQ",
  contact: "Contact info",
  social: "Social links",
  visibility: "Section visibility",
};

type EditorFormProps = {
  panel: EditorPanelId;
  content: ServiceWebsiteContent;
  errors: Record<string, string>;
  onUpdate: EditorUpdate;
  onPanelChange: (panel: EditorPanelId) => void;
};

export function EditorForm({
  panel,
  content,
  errors,
  onUpdate,
  onPanelChange,
}: EditorFormProps) {
  const navItems = NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[9rem_minmax(0,1fr)]">
      <nav aria-label="Editor sections" className="xl:sticky xl:top-0 xl:self-start">
        <div className="xl:hidden">
          <label htmlFor="editor-panel" className="sr-only">
            Editor section
          </label>
          <select
            id="editor-panel"
            value={panel}
            onChange={(event) => onPanelChange(event.target.value as EditorPanelId)}
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
          {NAV_GROUPS.map((group) => (
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
          {PANEL_TITLES[panel]}
        </h3>
        <div className="mt-4">
          {panel === "business" ? (
            <BusinessPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "branding" ? (
            <BrandingPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "hero" ? (
            <HeroPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "services" ? (
            <ServicesPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "about" ? (
            <AboutPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "whyChooseUs" ? (
            <WhyChooseUsPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "gallery" ? (
            <GalleryPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "testimonials" ? (
            <TestimonialsPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "serviceAreas" ? (
            <ServiceAreasPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "faq" ? (
            <FaqPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "contact" ? (
            <ContactPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "social" ? (
            <SocialPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
          {panel === "visibility" ? (
            <VisibilityPanel content={content} errors={errors} onUpdate={onUpdate} />
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
