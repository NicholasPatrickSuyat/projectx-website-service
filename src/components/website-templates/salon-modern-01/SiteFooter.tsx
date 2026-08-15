import type { SalonWebsiteContent } from "@/lib/templates/types";
import { getRenderableSalonSocialLinks } from "@/lib/templates/salon-content-utils";

export function SiteFooter({ content }: { content: SalonWebsiteContent }) {
  const links = getRenderableSalonSocialLinks(content);

  return (
    <footer className="border-t border-[var(--sa-line)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="sa01-display text-xl font-medium">{content.business.businessName}</p>
          {content.footerNote ? (
            <p className="mt-2 max-w-lg text-xs leading-5 text-[var(--sa-muted)]">
              {content.footerNote}
            </p>
          ) : null}
        </div>
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="hover:underline">
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
