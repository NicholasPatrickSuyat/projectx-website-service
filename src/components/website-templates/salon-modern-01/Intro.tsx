import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Intro({ content }: { content: SalonWebsiteContent }) {
  return (
    <section id="intro" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
            {content.sections.intro.eyebrow}
          </p>
          <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
            {content.intro.heading}
          </h2>
          <div className="mt-6 h-px w-16 bg-[var(--sa-accent)]" />
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--sa-muted)]">
            {content.intro.text}
          </p>
        </div>
        <div className="sa01-image aspect-[4/3]">
          <WebsiteImage
            src={content.intro.imageSrc}
            alt={content.intro.imageAlt}
            width={1400}
            height={933}
            sizes="(min-width: 1024px) 420px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
