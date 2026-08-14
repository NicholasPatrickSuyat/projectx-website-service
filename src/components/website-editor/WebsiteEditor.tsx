"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ServiceModern01 } from "@/components/website-templates/service-modern-01/ServiceModern01";
import { Panel } from "@/components/ui/Panel";
import {
  cloneContent,
  syncSharedContactFields,
  validateContent,
} from "@/lib/templates/editor";
import type {
  ServiceWebsiteContent,
  TemplateDefinition,
} from "@/lib/templates/types";
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

type EditorPanelId =
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

const NAV_GROUPS: Array<{
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

const PANEL_TITLES: Record<EditorPanelId, string> = {
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

type WebsiteEditorProps = {
  template: TemplateDefinition;
  initialContent: ServiceWebsiteContent;
};

export function WebsiteEditor({ template, initialContent }: WebsiteEditorProps) {
  const [content, setContent] = useState(() =>
    syncSharedContactFields(cloneContent(initialContent)),
  );
  const [panel, setPanel] = useState<EditorPanelId>("business");
  const [showErrors, setShowErrors] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const errors = showErrors ? validateContent(content) : {};

  const onUpdate: EditorUpdate = (updater) => {
    setContent((current) => {
      const next = cloneContent(current);
      updater(next);
      return syncSharedContactFields(next);
    });
    setResetNotice(false);
  };

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen]);

  const navItems = useMemo(
    () => NAV_GROUPS.flatMap((group) => group.items),
    [],
  );

  function openPreview() {
    setShowErrors(true);
    const nextErrors = validateContent(content);
    if (Object.keys(nextErrors).length > 0) {
      setPreviewOpen(false);
      return;
    }
    setPreviewOpen(true);
  }

  function resetToDemo() {
    const confirmed = window.confirm(
      "Reset all editor fields back to the Peak Heating & Air demo content? Current session changes will be discarded.",
    );
    if (!confirmed) {
      return;
    }
    setContent(syncSharedContactFields(cloneContent(initialContent)));
    setShowErrors(false);
    setPreviewOpen(false);
    setResetNotice(true);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Website Editor
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Editing {template.displayName} with structured demo content. Changes
            stay in this tab only and are not saved to the database. Refreshing
            restores the demo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f6ef0]"
          >
            Preview current changes
          </button>
          <Link
            href={template.previewPath}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
          >
            Open demo preview
          </Link>
          <button
            type="button"
            onClick={resetToDemo}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
          >
            Reset to demo
          </button>
        </div>
      </div>

      {resetNotice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Editor restored to the original demo content.
        </p>
      ) : null}

      {errorCount > 0 ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          Fix {errorCount === 1 ? "1 field" : `${errorCount} fields`} before
          previewing current changes.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <nav aria-label="Editor sections" className="lg:sticky lg:top-0 lg:self-start">
          <div className="lg:hidden">
            <label htmlFor="editor-panel" className="sr-only">
              Editor section
            </label>
            <select
              id="editor-panel"
              value={panel}
              onChange={(event) => setPanel(event.target.value as EditorPanelId)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden space-y-4 lg:block">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {group.label}
                </p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = panel === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setPanel(item.id)}
                          aria-current={active ? "page" : undefined}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
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

        <Panel className="p-5 sm:p-6">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {PANEL_TITLES[panel]}
          </h3>
          <div className="mt-5">
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

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 sm:p-6"
          role="presentation"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-preview-title"
            className="relative my-4 w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
              <div>
                <h2 id="editor-preview-title" className="text-sm font-semibold">
                  Current changes preview
                </h2>
                <p className="text-xs text-muted">
                  Session only. This is not the Milestone 6 live split-screen preview.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto">
              <ServiceModern01 content={content} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
