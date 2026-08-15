import type { SalonWebsiteContent } from "@/lib/templates/types";
import { getBookingHref } from "@/lib/templates/salon-content-utils";

export function FinalCta({ content }: { content: SalonWebsiteContent }) {
  const bookingHref = getBookingHref(content);
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  const href = bookingHref ?? (phoneDigits ? `tel:${phoneDigits}` : "#contact");
  const label = bookingHref
    ? content.booking.label
    : phoneDigits
      ? "Call Us"
      : content.contact.cta.label || "Contact";

  return (
    <section id="book" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="sa01-display text-4xl leading-tight font-medium sm:text-6xl">
          {content.sections.finalCta.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--sa-muted)]">
          {content.sections.finalCta.text}
        </p>
        <a
          href={href}
          className="mt-8 inline-flex rounded-md bg-[var(--sa-primary)] px-6 py-3 text-sm font-medium text-[var(--sa-surface)]"
        >
          {label}
        </a>
      </div>
    </section>
  );
}
