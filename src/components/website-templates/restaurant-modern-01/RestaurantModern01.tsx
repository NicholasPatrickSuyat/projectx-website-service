"use client";

import { Cormorant_Garamond, Outfit } from "next/font/google";
import type { CSSProperties } from "react";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import { isRestaurantSectionVisible } from "@/lib/templates/restaurant-content-utils";
import { Faq } from "./Faq";
import { Featured } from "./Featured";
import { FinalCta } from "./FinalCta";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Intro } from "./Intro";
import { Location } from "./Location";
import { Menu } from "./Menu";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Story } from "./Story";
import { Testimonials } from "./Testimonials";
import "./restaurant-modern-01.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-rm-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rm-display",
  display: "swap",
});

export function RestaurantModern01({
  content,
}: {
  content: RestaurantWebsiteContent;
}) {
  const brandStyle = {
    "--rm-primary": content.branding.primaryColor,
    "--rm-accent": content.branding.accentColor,
    "--rm-secondary": content.branding.secondaryColor ?? "#6b7f4a",
    "--rm-background": content.branding.backgroundColor,
    "--rm-surface": content.branding.surfaceColor,
  } as CSSProperties;

  return (
    <div
      id="top"
      className={`rm01 ${sans.variable} ${display.variable}`}
      style={brandStyle}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <SiteHeader content={content} />
      <main id="main">
        <Hero content={content} />
        {isRestaurantSectionVisible(content, "intro") ? (
          <Intro content={content} />
        ) : null}
        {isRestaurantSectionVisible(content, "featured") ? (
          <Featured content={content} />
        ) : null}
        <Menu content={content} />
        {isRestaurantSectionVisible(content, "about") ? (
          <Story content={content} />
        ) : null}
        {isRestaurantSectionVisible(content, "gallery") &&
        content.gallery.length > 0 ? (
          <Gallery content={content} />
        ) : null}
        {isRestaurantSectionVisible(content, "testimonials") &&
        content.testimonials.length > 0 ? (
          <Testimonials content={content} />
        ) : null}
        <Location content={content} />
        {isRestaurantSectionVisible(content, "faq") && content.faq.length > 0 ? (
          <Faq content={content} />
        ) : null}
        {isRestaurantSectionVisible(content, "finalCta") ? (
          <FinalCta content={content} />
        ) : null}
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
