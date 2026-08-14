import type { ServiceWebsiteContent } from "@/lib/templates/types";
import {
  getRenderableNavigation,
  getRenderableSocialLinks,
} from "@/lib/templates/content-utils";

export function SiteFooter({ content }: { content: ServiceWebsiteContent }) {
  const year = new Date().getFullYear();
  const navigation = getRenderableNavigation(content);
  const socialLinks = getRenderableSocialLinks(content);

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold tracking-tight">
            {content.business.businessName}
          </p>
          {content.footerNote ? (
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--sm-muted)]">
              {content.footerNote}
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--sm-muted)] uppercase">
            Pages
          </p>
          <ul className="mt-3 space-y-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm text-[var(--sm-ink)]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {socialLinks.length > 0 ? (
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--sm-muted)] uppercase">
              Connect
            </p>
            <ul className="mt-3 space-y-2">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--sm-ink)]"
                    rel="noreferrer noopener"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-black/5 px-4 py-5 text-center text-xs text-[var(--sm-muted)] sm:px-6">
        © {year} {content.business.businessName}. Demo content only.
      </div>
    </footer>
  );
}
