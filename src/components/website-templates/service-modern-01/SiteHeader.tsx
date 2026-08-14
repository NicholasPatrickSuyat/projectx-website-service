"use client";

import { useState } from "react";
import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";

export function SiteHeader({ content }: { content: ServiceWebsiteContent }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[color-mix(in_srgb,var(--sm-surface)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sm-primary)] text-[11px] font-semibold tracking-[0.14em] text-white">
            {content.business.logoText.slice(0, 4).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-[var(--sm-ink)]">
              {content.business.businessName}
            </span>
            {content.business.tagline ? (
              <span className="hidden text-[11px] text-[var(--sm-muted)] sm:block">
                {content.business.tagline}
              </span>
            ) : null}
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {content.navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--sm-muted)] transition-colors hover:text-[var(--sm-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${content.business.phone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--sm-primary)] transition-colors hover:bg-black/4"
          >
            <PhoneIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{content.business.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
          <a
            href={content.hero.primaryCta.href}
            className="hidden rounded-full bg-[var(--sm-primary)] px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-px md:inline-flex"
          >
            {content.hero.primaryCta.label}
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--sm-ink)] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-black/5 px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {content.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sm-ink)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
