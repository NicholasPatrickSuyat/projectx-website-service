import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function Gallery({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section id="gallery" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
        {content.sections.gallery.eyebrow}
      </p>
      <h2 className="sm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
        {content.sections.gallery.heading}
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {content.gallery.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-[1.25rem] bg-[var(--sm-surface)]">
            <WebsiteImage
              src={item.imageSrc}
              alt={item.alt}
              width={1200}
              height={900}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-64 w-full object-cover transition-transform duration-700 hover:scale-[1.04] sm:h-72"
            />
            {item.caption ? (
              <p className="px-4 py-3 text-sm font-medium text-[var(--sm-muted)]">
                {item.caption}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
