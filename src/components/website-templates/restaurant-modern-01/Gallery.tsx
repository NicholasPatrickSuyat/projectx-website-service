import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Gallery({ content }: { content: RestaurantWebsiteContent }) {
  if (content.gallery.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.gallery.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.gallery.heading}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {content.gallery.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-[1.6rem]">
              <WebsiteImage
                src={item.imageSrc}
                alt={item.alt}
                width={1200}
                height={900}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
              {item.caption?.trim() ? (
                <p className="bg-[var(--rm-surface)] px-4 py-3 text-sm text-[var(--rm-muted)]">
                  {item.caption}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
