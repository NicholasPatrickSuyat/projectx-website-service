import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Hero({ content }: { content: SalonWebsiteContent }) {
  return (
    <section className="px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          {content.hero.eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
              {content.hero.eyebrow}
            </p>
          ) : null}
          <h1 className="sa01-display mt-5 max-w-xl text-4xl leading-[1.05] font-medium tracking-tight sm:text-6xl lg:text-[4.4rem]">
            {content.hero.headline}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--sa-muted)]">
            {content.hero.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={content.hero.primaryCta.href.trim() || "#book"}
              className="rounded-md bg-[var(--sa-primary)] px-5 py-3 text-sm font-medium text-[var(--sa-surface)]"
            >
              {content.hero.primaryCta.label}
            </a>
            {content.hero.secondaryCta?.label ? (
              <a
                href={content.hero.secondaryCta.href || "#services"}
                className="rounded-md border border-[var(--sa-primary)] px-5 py-3 text-sm font-medium"
              >
                {content.hero.secondaryCta.label}
              </a>
            ) : null}
          </div>
          {content.hero.supportingItem ? (
            <p className="mt-8 text-xs tracking-[0.2em] text-[var(--sa-muted)] uppercase">
              {content.hero.supportingItem.label} · {content.hero.supportingItem.value}
            </p>
          ) : null}
        </div>
        <div className="sa01-image relative aspect-[4/5] max-h-[38rem] lg:justify-self-end">
          <WebsiteImage
            src={content.hero.imageSrc}
            alt={content.hero.imageAlt}
            width={1536}
            height={1024}
            priority
            sizes="(min-width: 1024px) 480px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
