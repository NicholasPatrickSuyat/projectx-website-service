import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { WHY_ICONS } from "./icons";

export function WhyChooseUs({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section className="bg-[var(--sm-primary)] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
          {content.sections.whyChooseUs.eyebrow}
        </p>
        <h2 className="sm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
          {content.sections.whyChooseUs.heading}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {content.whyChooseUs.map((item) => {
            const Icon = item.iconId ? WHY_ICONS[item.iconId] : WHY_ICONS.shield;

            return (
              <article
                key={item.id}
                className="rounded-[1.25rem] bg-white/6 p-6 ring-1 ring-white/10"
              >
                <Icon className="h-6 w-6 text-[var(--sm-accent)]" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
