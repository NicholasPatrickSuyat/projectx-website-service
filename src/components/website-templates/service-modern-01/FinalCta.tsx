import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function FinalCta({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[1.5rem] bg-[var(--sm-primary)] px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="sm01-display text-3xl font-medium tracking-tight">
            {content.sections.finalCta.heading}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
            {content.sections.finalCta.text}
          </p>
        </div>
        <a
          href={content.hero.primaryCta.href}
          className="inline-flex shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--sm-primary)] transition-transform duration-200 hover:-translate-y-px"
        >
          {content.hero.primaryCta.label}
        </a>
      </div>
    </section>
  );
}
