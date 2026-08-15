"use client";

import {
  LivePreview,
  PREVIEW_DEVICES,
  type PreviewDevice,
} from "@/components/website-editor/LivePreview";
import { renderTemplate } from "@/lib/templates/render";
import type { TemplateId, WebsiteContent } from "@/lib/templates/types";
import {
  formatPublicationPublishedAt,
  type WebsitePublicationSummary,
} from "@/lib/website-publications/types";

type HistoricalPublicationViewProps = {
  templateId: TemplateId;
  publication: WebsitePublicationSummary;
  content: WebsiteContent;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onBack: () => void;
};

export function HistoricalPublicationView({
  templateId,
  publication,
  content,
  device,
  onDeviceChange,
  onBack,
}: HistoricalPublicationViewProps) {
  const toolbarButton =
    "inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background";

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="historical-publication-heading"
                className="text-base font-semibold tracking-tight text-foreground sm:text-lg"
              >
                Viewing Publication {publication.publicationNumber}
              </h2>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-900">
                Frozen publication
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
              {formatPublicationPublishedAt(publication.publishedAt)}. This
              preview does not change the current editor or the saved website.
              Press Escape to return.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-lg border border-border bg-background p-0.5"
              role="group"
              aria-label="Preview device"
            >
              {PREVIEW_DEVICES.map((item) => {
                const active = device === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onDeviceChange(item.id)}
                    aria-pressed={active}
                    title={item.hint}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium sm:text-sm ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={onBack} className={toolbarButton}>
              Back to Publication History
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <section
          aria-label="Historical publication preview"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <LivePreview device={device}>
            {renderTemplate(templateId, content)}
          </LivePreview>
        </section>
      </div>
    </div>
  );
}
