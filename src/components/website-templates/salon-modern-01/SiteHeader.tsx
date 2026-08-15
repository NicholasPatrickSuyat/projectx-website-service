"use client";

import { useState } from "react";
import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";
import {
  getBookingHref,
  getRenderableSalonNavigation,
} from "@/lib/templates/salon-content-utils";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";

function bookingAction(content: SalonWebsiteContent) {
  const href = getBookingHref(content);
  if (href) {
    return { label: content.booking.label, href };
  }
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  if (phoneDigits) {
    return { label: "Call Us", href: `tel:${phoneDigits}` };
  }
  return { label: content.booking.label, href: "#contact" };
}

export function SiteHeader({ content }: { content: SalonWebsiteContent }) {
  const [open, setOpen] = useState(false);
  const navigation = getRenderableSalonNavigation(content);
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  const book = bookingAction(content);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--sa-line)] bg-[color-mix(in_srgb,var(--sa-surface)_86%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          {content.business.logoSrc ? (
            <WebsiteImage
              src={content.business.logoSrc}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-11 min-w-11 items-center justify-center rounded-md border border-[var(--sa-primary)] px-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
              {content.business.logoText.slice(0, 4).toUpperCase() || "LOGO"}
            </span>
          )}
          <span className="min-w-0">
            <span className="sa01-display block truncate text-xl leading-none font-medium tracking-tight">
              {content.business.businessName}
            </span>
            {content.business.tagline ? (
              <span className="mt-1 hidden text-[10px] tracking-[0.22em] text-[var(--sa-muted)] uppercase sm:block">
                {content.business.tagline}
              </span>
            ) : null}
          </span>
        </a>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium tracking-wide text-[var(--sa-muted)] uppercase transition-colors hover:text-[var(--sa-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium"
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="hidden lg:inline">{content.business.phone}</span>
              <span className="lg:hidden">Call</span>
            </a>
          ) : null}
          <a
            href={book.href}
            className="hidden rounded-md bg-[var(--sa-primary)] px-4 py-2 text-sm font-medium text-[var(--sa-surface)] transition-opacity hover:opacity-90 md:inline-flex"
          >
            {book.label}
          </a>
          <button
            type="button"
            className="rounded-md p-2 xl:hidden"
            aria-expanded={open}
            aria-controls="salon-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="salon-mobile-nav"
          className="border-t border-[var(--sa-line)] px-4 py-3 xl:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
            <a
              href={book.href}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-[var(--sa-primary)] px-4 py-2.5 text-center text-sm font-medium text-[var(--sa-surface)]"
            >
              {book.label}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
