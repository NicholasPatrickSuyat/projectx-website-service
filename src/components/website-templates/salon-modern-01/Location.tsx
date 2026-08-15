import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Location({ content }: { content: SalonWebsiteContent }) {
  const mapsQuery = encodeURIComponent(content.business.address);
  const mapsHref = content.business.address.trim()
    ? `https://maps.google.com/?q=${mapsQuery}`
    : null;

  return (
    <section id="location" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
            {content.sections.location.eyebrow}
          </p>
          <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
            {content.sections.location.heading}
          </h2>
          {content.sections.location.intro.trim() ? (
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--sa-muted)]">
              {content.sections.location.intro}
            </p>
          ) : null}
        </div>
        <div id="contact" className="scroll-mt-24 space-y-6 text-sm leading-7">
          {content.business.address ? (
            <p>
              <span className="block text-[11px] tracking-[0.2em] text-[var(--sa-muted)] uppercase">
                Address
              </span>
              {mapsHref ? (
                <a href={mapsHref} className="mt-1 inline-block underline-offset-4 hover:underline">
                  {content.business.address}
                </a>
              ) : (
                <span className="mt-1 block">{content.business.address}</span>
              )}
            </p>
          ) : null}
          {content.business.phone ? (
            <p>
              <span className="block text-[11px] tracking-[0.2em] text-[var(--sa-muted)] uppercase">
                Phone
              </span>
              <a href={`tel:${content.business.phone.replace(/\D/g, "")}`} className="mt-1 inline-block">
                {content.business.phone}
              </a>
            </p>
          ) : null}
          {content.business.email ? (
            <p>
              <span className="block text-[11px] tracking-[0.2em] text-[var(--sa-muted)] uppercase">
                Email
              </span>
              <a href={`mailto:${content.business.email}`} className="mt-1 inline-block">
                {content.business.email}
              </a>
            </p>
          ) : null}
          {content.business.businessHours.length > 0 ? (
            <p>
              <span className="block text-[11px] tracking-[0.2em] text-[var(--sa-muted)] uppercase">
                Hours
              </span>
              {content.business.businessHours.map((line) => (
                <span key={line} className="mt-1 block">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
