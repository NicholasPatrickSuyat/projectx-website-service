import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Gallery({ content }: { content: SalonWebsiteContent }) {
  return (
    <section id="gallery" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
          {content.sections.gallery.eyebrow}
        </p>
        <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
          {content.sections.gallery.heading}
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {content.gallery.map((item, index) => (
            <li
              key={item.id}
              className={index === 0 ? "sm:col-span-2" : undefined}
            >
              <figure>
                <div className={`sa01-image ${index === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
                  <WebsiteImage
                    src={item.imageSrc}
                    alt={item.alt}
                    width={1400}
                    height={933}
                    sizes={index === 0 ? "(min-width: 1024px) 1100px, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                    className="h-full w-full object-cover"
                  />
                </div>
                {item.caption ? (
                  <figcaption className="mt-3 text-center text-sm text-[var(--sa-muted)]">
                    {item.caption}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
