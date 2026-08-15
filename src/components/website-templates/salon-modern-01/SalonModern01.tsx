"use client";

import { Figtree, Fraunces } from "next/font/google";
import type { CSSProperties } from "react";
import type { SalonWebsiteContent } from "@/lib/templates/types";
import { isSalonSectionVisible } from "@/lib/templates/salon-content-utils";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Intro } from "./Intro";
import { Location } from "./Location";
import { Services } from "./Services";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Story } from "./Story";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";
import "./salon-modern-01.css";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sa-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sa-display",
  display: "swap",
});

export function SalonModern01({
  content,
}: {
  content: SalonWebsiteContent;
}) {
  const brandStyle = {
    "--sa-primary": content.branding.primaryColor,
    "--sa-accent": content.branding.accentColor,
    "--sa-secondary": content.branding.secondaryColor ?? "#6d7a73",
    "--sa-background": content.branding.backgroundColor,
    "--sa-surface": content.branding.surfaceColor,
  } as CSSProperties;

  return (
    <div
      id="top"
      className={`sa01 ${sans.variable} ${display.variable}`}
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
        {isSalonSectionVisible(content, "intro") ? <Intro content={content} /> : null}
        {isSalonSectionVisible(content, "services") && content.services.length > 0 ? (
          <Services content={content} />
        ) : null}
        {isSalonSectionVisible(content, "about") ? <Story content={content} /> : null}
        {isSalonSectionVisible(content, "team") && content.team.length > 0 ? (
          <Team content={content} />
        ) : null}
        {isSalonSectionVisible(content, "gallery") && content.gallery.length > 0 ? (
          <Gallery content={content} />
        ) : null}
        {isSalonSectionVisible(content, "testimonials") &&
        content.testimonials.length > 0 ? (
          <Testimonials content={content} />
        ) : null}
        <Location content={content} />
        {isSalonSectionVisible(content, "faq") && content.faq.length > 0 ? (
          <Faq content={content} />
        ) : null}
        {isSalonSectionVisible(content, "finalCta") ? (
          <FinalCta content={content} />
        ) : null}
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
