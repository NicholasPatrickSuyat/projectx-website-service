import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { MailIcon, MapPinIcon, PhoneIcon } from "./icons";

export function Contact({ content }: { content: ServiceWebsiteContent }) {
  const phone = content.business.phone;
  const email = content.business.email;
  const address = content.business.address;
  const hours = content.business.businessHours.filter((row) => row.trim());
  const { contact } = content;
  const phoneDigits = phone.replace(/\D/g, "");

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--sm-accent)] uppercase">
        {content.sections.contact.eyebrow}
      </p>
      <h2 className="sm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
        {content.sections.contact.heading}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-[var(--sm-muted)]">
        {content.sections.contact.intro}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {phone ? (
          phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-5"
            >
              <PhoneIcon className="h-5 w-5 text-[var(--sm-accent)]" />
              <p className="mt-3 text-xs font-medium tracking-wide text-[var(--sm-muted)] uppercase">
                Phone
              </p>
              <p className="mt-1 text-sm font-semibold">{phone}</p>
            </a>
          ) : (
            <div className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-5">
              <PhoneIcon className="h-5 w-5 text-[var(--sm-accent)]" />
              <p className="mt-3 text-xs font-medium tracking-wide text-[var(--sm-muted)] uppercase">
                Phone
              </p>
              <p className="mt-1 text-sm font-semibold">{phone}</p>
            </div>
          )
        ) : null}
        {email ? (
          <a
            href={`mailto:${email}`}
            className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-5"
          >
            <MailIcon className="h-5 w-5 text-[var(--sm-accent)]" />
            <p className="mt-3 text-xs font-medium tracking-wide text-[var(--sm-muted)] uppercase">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-semibold">{email}</p>
          </a>
        ) : null}
        {address ? (
          <div className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-5">
            <MapPinIcon className="h-5 w-5 text-[var(--sm-accent)]" />
            <p className="mt-3 text-xs font-medium tracking-wide text-[var(--sm-muted)] uppercase">
              Address
            </p>
            <p className="mt-1 text-sm font-semibold">{address}</p>
          </div>
        ) : null}
        {hours.length > 0 ? (
          <div className="rounded-[1.25rem] border border-black/5 bg-[var(--sm-surface)] p-5">
            <p className="text-xs font-medium tracking-wide text-[var(--sm-muted)] uppercase">
              Hours
            </p>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--sm-ink)]">
              {hours.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <a
        href={contact.cta.href}
        className="mt-8 inline-flex rounded-full bg-[var(--sm-primary)] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-px"
      >
        {contact.cta.label}
      </a>
    </section>
  );
}
