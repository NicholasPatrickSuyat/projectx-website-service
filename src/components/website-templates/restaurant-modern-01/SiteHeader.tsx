"use client";

import { useState } from "react";
import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import {
  getRenderableRestaurantNavigation,
  getReservationHref,
} from "@/lib/templates/restaurant-content-utils";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";

function reservationAction(content: RestaurantWebsiteContent) {
  const href = getReservationHref(content);
  if (href) {
    return { label: content.reservation.label, href };
  }
  return { label: content.reservation.label, href: "#reserve" };
}

export function SiteHeader({ content }: { content: RestaurantWebsiteContent }) {
  const [open, setOpen] = useState(false);
  const navigation = getRenderableRestaurantNavigation(content);
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  const reserve = reservationAction(content);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rm-primary)]/8 bg-[color-mix(in_srgb,var(--rm-surface)_90%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          {content.business.logoSrc ? (
            <WebsiteImage
              src={content.business.logoSrc}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rm-primary)] text-[11px] font-semibold tracking-[0.16em] text-[var(--rm-surface)]">
              {content.business.logoText.slice(0, 4).toUpperCase() || "LOGO"}
            </span>
          )}
          <span className="min-w-0">
            <span className="rm01-display block truncate text-[1.05rem] font-semibold tracking-tight text-[var(--rm-ink)]">
              {content.business.businessName}
            </span>
            {content.business.tagline ? (
              <span className="hidden text-[11px] tracking-[0.14em] text-[var(--rm-muted)] uppercase sm:block">
                {content.business.tagline}
              </span>
            ) : null}
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--rm-muted)] transition-colors hover:text-[var(--rm-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--rm-primary)]"
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{content.business.phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
          ) : null}
          <a
            href={reserve.href}
            className="hidden rounded-full bg-[var(--rm-accent)] px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-px md:inline-flex"
          >
            {reserve.label}
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--rm-ink)] lg:hidden"
            aria-expanded={open}
            aria-controls="restaurant-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        id="restaurant-mobile-nav"
        className="border-t border-[var(--rm-primary)]/8 px-4 py-3 lg:hidden"
        aria-label="Mobile"
        hidden={!open}
      >
        <div className="flex flex-col gap-1">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--rm-ink)]"
            >
              {item.label}
            </a>
          ))}
          <a
            href={reserve.href}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-[var(--rm-accent)] px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            {reserve.label}
          </a>
        </div>
      </nav>
    </header>
  );
}
