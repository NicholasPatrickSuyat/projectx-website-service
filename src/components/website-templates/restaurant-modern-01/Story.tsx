import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Story({ content }: { content: RestaurantWebsiteContent }) {
  return (
    <section
      id="story"
      className="scroll-mt-24 bg-[var(--rm-surface)] px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:order-2">
          <div className="overflow-hidden rounded-[2rem]">
            <WebsiteImage
              src={content.about.imageSrc}
              alt={content.about.imageAlt}
              width={1400}
              height={1050}
              sizes="(min-width: 1024px) 520px, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
            {content.sections.about.eyebrow}
          </p>
          <h2 className="rm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
            {content.about.heading || content.sections.about.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--rm-muted)]">
            {content.about.text}
          </p>
        </div>
      </div>
    </section>
  );
}
