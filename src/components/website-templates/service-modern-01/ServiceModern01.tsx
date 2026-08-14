import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { CSSProperties } from "react";
import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { About } from "./About";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { ServiceAreas } from "./ServiceAreas";
import { Services } from "./Services";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Testimonials } from "./Testimonials";
import { TrustStrip } from "./TrustStrip";
import { WhyChooseUs } from "./WhyChooseUs";
import "./service-modern-01.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sm-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-sm-display",
  display: "swap",
});

export function ServiceModern01({ content }: { content: ServiceWebsiteContent }) {
  const brandStyle = {
    "--sm-primary": content.branding.primaryColor,
    "--sm-accent": content.branding.accentColor,
    "--sm-secondary": content.branding.secondaryColor ?? "#eef3f7",
  } as CSSProperties;

  return (
    <div
      id="top"
      className={`sm01 ${sans.variable} ${display.variable}`}
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
        <TrustStrip content={content} />
        <Services content={content} />
        <WhyChooseUs content={content} />
        <About content={content} />
        <Gallery content={content} />
        <Testimonials content={content} />
        <ServiceAreas content={content} />
        <Faq content={content} />
        <FinalCta content={content} />
        <Contact content={content} />
      </main>
      <SiteFooter content={content} />
    </div>
  );
}
