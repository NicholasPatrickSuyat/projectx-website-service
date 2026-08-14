import type { ServiceWebsiteContent } from "@/lib/templates/types";

export function TrustStrip({ content }: { content: ServiceWebsiteContent }) {
  return (
    <section aria-label="Credentials" className="border-y border-black/5 bg-[var(--sm-surface)]">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 py-6 sm:grid-cols-4 sm:px-6">
        {content.trustItems.map((item) => (
          <li
            key={item.id}
            className="px-3 py-2 text-center text-sm font-medium text-[var(--sm-primary)]"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
