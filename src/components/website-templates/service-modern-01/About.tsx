import Image from "next/image";
import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function About({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section id="about" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[1.5rem]">
        <Image
          src={content.about.imageSrc}
          alt={content.about.imageAlt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 520px, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
          About
        </p>
        <h2 className="sm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
          {content.about.heading}
        </h2>
        <p className="mt-5 text-base leading-7 text-[var(--sm-muted)]">
          {content.about.text}
        </p>
        {content.about.highlights ? (
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {content.about.highlights.map((item) => (
              <div key={item.id}>
                <dt className="text-xs text-[var(--sm-muted)]">{item.label}</dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
