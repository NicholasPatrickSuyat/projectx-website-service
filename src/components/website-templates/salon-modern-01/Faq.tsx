"use client";

import { useId, useState } from "react";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Faq({ content }: { content: SalonWebsiteContent }) {
  const [openId, setOpenId] = useState<string | null>(content.faq[0]?.id ?? null);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 bg-[var(--sa-surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
          {content.sections.faq.eyebrow}
        </p>
        <h2 className="sa01-display mt-4 text-3xl leading-tight font-medium sm:text-5xl">
          {content.sections.faq.heading}
        </h2>
        <div className="mt-8 divide-y divide-[var(--sa-line)] border-y border-[var(--sa-line)]">
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
                    <span aria-hidden className="text-lg text-[var(--sa-muted)]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-5 text-sm leading-6 text-[var(--sa-muted)]"
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
