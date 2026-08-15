import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Story({ content }: { content: SalonWebsiteContent }) {
  return (
    <section id="story" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="sa01-image order-2 aspect-[4/3] lg:order-1">
          <WebsiteImage
            src={content.about.imageSrc}
            alt={content.about.imageAlt}
            width={1400}
            height={933}
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
            {content.sections.about.eyebrow}
          </p>
          <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
            {content.about.heading}
          </h2>
          <p className="mt-6 text-base leading-7 text-[var(--sa-muted)]">{content.about.text}</p>
        </div>
      </div>
    </section>
  );
}
