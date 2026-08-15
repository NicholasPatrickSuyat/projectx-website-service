"use client";

import { useId, useState } from "react";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";

export function Faq({ content }: { content: RestaurantWebsiteContent }) {
  const [openId, setOpenId] = useState<string | null>(content.faq[0]?.id ?? null);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 bg-[var(--rm-surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--rm-accent)] uppercase">
          {content.sections.faq.eyebrow}
        </p>
        <h2 className="rm01-display mt-3 text-3xl leading-tight font-medium tracking-tight sm:text-5xl">
          {content.sections.faq.heading}
        </h2>
        <div className="mt-8 divide-y divide-[var(--rm-primary)]/10 border-y border-[var(--rm-primary)]/10">
          {content.faq.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `${baseId}-${item.id}`;
            const buttonId = `${panelId}-button`;

            return (
              <div key={item.id}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold tracking-tight"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    {item.question}
                    <span aria-hidden className="text-lg text-[var(--rm-muted)]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-5 text-sm leading-6 text-[var(--rm-muted)]"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
