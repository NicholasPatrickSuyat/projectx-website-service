import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Intro({ content }: { content: RestaurantWebsiteContent }) {
  return (
    <section id="intro" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="overflow-hidden rounded-[2rem] shadow-[0_24px_50px_rgba(42,31,24,0.12)]">
          <WebsiteImage
            src={content.intro.imageSrc}
            alt={content.intro.imageAlt}
            width={1400}
            height={1050}
            sizes="(min-width: 1024px) 480px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
            {content.sections.intro.eyebrow}
          </p>
          <h2 className="rm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
            {content.intro.heading || content.sections.intro.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--rm-muted)]">
            {content.intro.text}
          </p>
        </div>
      </div>
    </section>
  );
}
