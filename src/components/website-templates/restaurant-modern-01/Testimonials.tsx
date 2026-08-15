import type { RestaurantWebsiteContent } from "@/lib/templates/types";

function Stars({ rating }: { rating: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <p className="text-[var(--rm-accent)]" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-[var(--rm-primary)]/20">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

export function Testimonials({ content }: { content: RestaurantWebsiteContent }) {
  if (content.testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--rm-surface)] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.testimonials.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.testimonials.heading}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {content.testimonials.map((item) => (
            <li
              key={item.id}
              className="rounded-[1.6rem] border border-[var(--rm-primary)]/8 bg-[var(--rm-background)] px-6 py-6"
            >
              {item.rating ? <Stars rating={item.rating} /> : null}
              <blockquote className="rm01-display mt-3 text-xl leading-8">
                {item.quote}
              </blockquote>
              <p className="mt-4 text-sm font-semibold">{item.customerName}</p>
              {item.sourceLabel?.trim() ? (
                <p className="mt-1 text-xs text-[var(--rm-muted)]">
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
