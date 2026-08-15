import { WebsiteImage } from "@/components/media/WebsiteImage";
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

export function Featured({ content }: { content: RestaurantWebsiteContent }) {
  if (content.featuredDishes.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--rm-surface)] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.featured.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.featured.heading}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.featuredDishes.map((dish) => (
            <article key={dish.id} className="group">
              <div className="overflow-hidden rounded-[1.6rem]">
                <WebsiteImage
                  src={dish.imageSrc}
                  alt={dish.imageAlt}
                  width={900}
                  height={700}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  {dish.tag?.trim() ? (
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--rm-secondary)] uppercase">
                      {dish.tag}
                    </p>
                  ) : null}
                  <h3 className="rm01-display mt-1 text-2xl leading-tight">
                    {dish.name}
                  </h3>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[var(--rm-accent)]">
                  {formatPrice(dish.price)}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--rm-muted)]">
                {dish.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
