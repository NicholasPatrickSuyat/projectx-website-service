import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import { getReservationHref } from "@/lib/templates/restaurant-content-utils";

export function FinalCta({ content }: { content: RestaurantWebsiteContent }) {
  const reservationHref = getReservationHref(content);
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  const primaryHref = reservationHref ?? (phoneDigits ? `tel:${phoneDigits}` : "#location");
  const primaryLabel = reservationHref
    ? content.reservation.label
    : content.contact.cta.label;

  return (
    <section
      id="reserve"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-[var(--rm-primary)] px-6 py-12 text-center text-[var(--rm-surface)] sm:px-12">
        <h2 className="rm01-display text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.finalCta.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--rm-surface)]/75">
          {content.sections.finalCta.text}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-full bg-[var(--rm-accent)] px-6 py-3 text-sm font-semibold text-white"
          >
            {primaryLabel}
          </a>
          <a
            href="#menu"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold"
          >
            View Menu
          </a>
        </div>
      </div>
    </section>
  );
}
