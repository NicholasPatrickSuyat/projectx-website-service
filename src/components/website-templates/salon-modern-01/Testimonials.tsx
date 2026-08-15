import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Testimonials({ content }: { content: SalonWebsiteContent }) {
  return (
    <section className="bg-[var(--sa-surface)] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
          {content.sections.testimonials.eyebrow}
        </p>
        <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
          {content.sections.testimonials.heading}
        </h2>
        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {content.testimonials.map((item) => (
            <li
              key={item.id}
              className="border-t border-[var(--sa-primary)] pt-6"
            >
              <blockquote className="sa01-display text-xl leading-8 font-medium">
                “{item.quote}”
              </blockquote>
              <p className="mt-5 text-sm font-semibold">{item.customerName}</p>
              {item.sourceLabel ? (
                <p className="mt-1 text-xs tracking-[0.16em] text-[var(--sa-muted)] uppercase">
                  {item.sourceLabel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
