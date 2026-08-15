import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Location({ content }: { content: RestaurantWebsiteContent }) {
  const phoneDigits = content.business.phone.replace(/\D/g, "");
  const email = content.business.email.trim();

  return (
    <section id="location" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.location.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.location.heading}
        </h2>
        {content.sections.location.intro.trim() ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--rm-muted)]">
            {content.sections.location.intro}
          </p>
        ) : null}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.6rem] bg-[var(--rm-surface)] px-6 py-6">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-[var(--rm-accent)] uppercase">
              Address
            </h3>
            <p className="mt-3 text-base leading-7">{content.business.address}</p>
          </article>
          <article className="rounded-[1.6rem] bg-[var(--rm-surface)] px-6 py-6">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-[var(--rm-accent)] uppercase">
              Hours
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6">
              {content.business.businessHours.filter((line) => line.trim()).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[1.6rem] bg-[var(--rm-surface)] px-6 py-6">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-[var(--rm-accent)] uppercase">
              Contact
            </h3>
            <div className="mt-3 space-y-2 text-sm leading-6">
              {phoneDigits ? (
                <p>
                  <a href={`tel:${phoneDigits}`}>{content.business.phone}</a>
                </p>
              ) : null}
              {email ? (
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              ) : null}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
