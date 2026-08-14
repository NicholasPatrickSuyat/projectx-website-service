import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function ServiceAreas({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section id="areas" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
        {content.sections.serviceAreas.eyebrow}
      </p>
      <h2 className="sm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
        {content.sections.serviceAreas.heading}
      </h2>
      <ul className="mt-8 flex flex-wrap gap-2">
        {content.serviceAreas.map((area) => (
          <li
            key={area}
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-[var(--sm-primary)]"
          >
            {area}
          </li>
        ))}
      </ul>
    </section>
  );
}
