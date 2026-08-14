import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function Testimonials({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section id="testimonials" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
          {content.sections.testimonials.eyebrow}
        </p>
        <h2 className="sm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
          {content.sections.testimonials.heading}
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.testimonials.map((item) => (
            <blockquote
              key={item.id}
              className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-6"
            >
              {item.rating ? (
                <p className="text-xs font-medium tracking-wide text-[var(--sm-accent)]">
                  {`${item.rating} of 5`}
                  {item.sourceLabel ? ` · ${item.sourceLabel}` : ""}
                </p>
              ) : null}
              <p className="mt-3 text-[15px] leading-7 text-[var(--sm-ink)]">
                “{item.quote}”
              </p>
              <footer className="mt-5 text-sm font-semibold">{item.customerName}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
