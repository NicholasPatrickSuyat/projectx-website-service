import Image from "next/image";
import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function Hero({ content }: { content: ServiceWebsiteContent }) {
  const { hero } = content;

  return (
    <section className="sm01-reveal mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
      <div>
        {hero.eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
            {hero.eyebrow}
          </p>
        ) : null}
        <h1 className="sm01-display mt-4 max-w-xl text-[2.35rem] leading-[1.12] font-medium tracking-tight text-[var(--sm-ink)] sm:text-5xl">
          {hero.headline}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-[var(--sm-muted)] sm:text-[17px]">
          {hero.subheadline}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-[var(--sm-primary)] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-px"
          >
            {hero.primaryCta.label}
          </a>
          {hero.secondaryCta?.label.trim() && hero.secondaryCta.href.trim() ? (
            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border border-[var(--sm-primary)]/15 bg-white px-5 py-3 text-sm font-semibold text-[var(--sm-primary)]"
            >
              {hero.secondaryCta.label}
            </a>
          ) : null}
        </div>
      </div>

      <div className="relative pb-8">
        <div className="overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_rgba(20,32,51,0.16)]">
          <Image
            src={hero.imageSrc}
            alt={hero.imageAlt}
            width={1600}
            height={900}
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
        {hero.supportingItem ? (
          <div className="absolute -bottom-4 left-4 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-lg sm:left-6">
            <p className="text-[11px] font-medium tracking-wide text-[var(--sm-muted)] uppercase">
              {hero.supportingItem.label}
            </p>
            <p className="text-lg font-semibold text-[var(--sm-ink)]">
              {hero.supportingItem.value}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
