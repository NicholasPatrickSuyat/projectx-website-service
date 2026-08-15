import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Services({ content }: { content: SalonWebsiteContent }) {
  return (
    <section
      id="services"
      className="scroll-mt-24 bg-[var(--sa-surface)] px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
          {content.sections.services.eyebrow}
        </p>
        <h2 className="sa01-display mt-4 max-w-2xl text-3xl leading-tight font-medium sm:text-5xl">
          {content.sections.services.heading}
        </h2>
        <ol className="mt-12 divide-y divide-[var(--sa-line)] border-y border-[var(--sa-line)]">
          {content.services.map((service, index) => (
            <li
              key={service.id}
              className="grid gap-3 py-6 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-start sm:gap-8"
            >
              <span className="text-xs tracking-[0.2em] text-[var(--sa-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="sa01-display text-2xl font-medium tracking-tight">
                    {service.name}
                  </h3>
                  {service.category ? (
                    <span className="text-[11px] tracking-[0.18em] text-[var(--sa-secondary)] uppercase">
                      {service.category}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sa-muted)]">
                  {service.description}
                </p>
                {service.duration ? (
                  <p className="mt-2 text-xs text-[var(--sa-muted)]">{service.duration}</p>
                ) : null}
              </div>
              <p className="text-sm font-semibold tracking-wide sm:pt-1 sm:text-right">
                {service.price}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
