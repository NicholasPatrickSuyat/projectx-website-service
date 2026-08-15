import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Hero({ content }: { content: RestaurantWebsiteContent }) {
  const { hero } = content;

  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden">
      <WebsiteImage
        src={hero.imageSrc}
        alt={hero.imageAlt}
        width={1920}
        height={1080}
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,16,12,0.28)_0%,rgba(24,16,12,0.55)_48%,rgba(24,16,12,0.78)_100%)]" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-20">
        <div className="rm01-reveal max-w-2xl text-white">
          {hero.eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.22em] text-white/80 uppercase">
              {hero.eyebrow}
            </p>
          ) : null}
          <h1 className="rm01-display mt-4 text-[2.7rem] leading-[1.08] font-medium tracking-tight sm:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-[17px]">
            {hero.subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--rm-accent)] px-6 py-3 text-sm font-semibold text-white"
            >
              {hero.primaryCta.label}
            </a>
            {hero.secondaryCta?.label.trim() && hero.secondaryCta.href.trim() ? (
              <a
                href={hero.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm"
              >
                {hero.secondaryCta.label}
              </a>
            ) : null}
          </div>
        </div>
        {hero.supportingItem ? (
          <div className="rm01-reveal mt-10 w-fit rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white backdrop-blur-sm">
            <p className="text-[11px] tracking-[0.16em] text-white/70 uppercase">
              {hero.supportingItem.label}
            </p>
            <p className="rm01-display text-xl">{hero.supportingItem.value}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
