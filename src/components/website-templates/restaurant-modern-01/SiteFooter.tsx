import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import { getRenderableRestaurantSocialLinks } from "@/lib/templates/restaurant-content-utils";

export function SiteFooter({ content }: { content: RestaurantWebsiteContent }) {
  const social = getRenderableRestaurantSocialLinks(content);

  return (
    <footer className="border-t border-[var(--rm-primary)]/8 bg-[var(--rm-surface)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="rm01-display text-xl">{content.business.businessName}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--rm-muted)]">
            {content.business.address}
          </p>
          {content.footerNote ? (
            <p className="mt-3 max-w-lg text-xs leading-5 text-[var(--rm-muted)]">
              {content.footerNote}
            </p>
          ) : null}
        </div>
        {social.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {social.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-[var(--rm-ink)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
