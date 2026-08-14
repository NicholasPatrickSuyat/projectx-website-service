import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { SERVICE_ICONS } from "./icons";

export function Services({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
        {content.sections.services.eyebrow}
      </p>
      <h2 className="sm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
        {content.sections.services.heading}
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {content.services.map((service) => {
          const Icon = service.iconId ? SERVICE_ICONS[service.iconId] : SERVICE_ICONS.repair;

          return (
            <article
              key={service.id}
              className="rounded-[1.25rem] border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(20,32,51,0.04)] transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sm-secondary)] text-[var(--sm-primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {service.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--sm-muted)]">
                {service.shortDescription}
              </p>
              {service.href ? (
                <a
                  href={service.href}
                  className="mt-5 inline-flex text-sm font-semibold text-[var(--sm-primary)]"
                >
                  Request this service
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
