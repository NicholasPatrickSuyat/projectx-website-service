import type { RestaurantWebsiteContent } from "@/lib/templates/types";

function formatPrice(price: string) {
  const trimmed = price.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("$")) {
    return trimmed;
  }
  return `$${trimmed}`;
}

export function Menu({ content }: { content: RestaurantWebsiteContent }) {
  if (content.menu.length === 0) {
    return null;
  }

  return (
    <section id="menu" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.menu.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.menu.heading}
        </h2>
      </div>
      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        {content.menu.map((category) => (
          <section key={category.id} aria-labelledby={`menu-${category.id}`}>
            <h3
              id={`menu-${category.id}`}
              className="rm01-display border-b border-[var(--rm-primary)]/10 pb-3 text-2xl"
            >
              {category.name}
            </h3>
            <ul className="mt-6 space-y-5">
              {category.items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline gap-3">
                    <p className="text-base font-semibold tracking-tight">
                      {item.name}
                    </p>
                    <span
                      aria-hidden
                      className="min-w-6 flex-1 border-b border-dotted border-[var(--rm-primary)]/20"
                    />
                    <p className="text-sm font-semibold text-[var(--rm-accent)]">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {item.description.trim() ? (
                      <p className="text-sm leading-6 text-[var(--rm-muted)]">
                        {item.description}
                      </p>
                    ) : null}
                    {item.tag?.trim() ? (
                      <span className="rounded-full bg-[var(--rm-secondary)]/12 px-2 py-0.5 text-[11px] font-medium tracking-wide text-[var(--rm-secondary)]">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
