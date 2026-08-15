"use client";

import { ServiceModern01 } from "@/components/website-templates/service-modern-01/ServiceModern01";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  LivePreview,
  PREVIEW_DEVICES,
  type PreviewDevice,
} from "@/components/website-editor/LivePreview";
import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { formatVersionSavedAt } from "@/lib/website-versions/types";
import type { WebsiteVersionSummary } from "@/lib/website-versions/types";

type HistoricalVersionViewProps = {
  version: WebsiteVersionSummary;
  content: ServiceWebsiteContent;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onBack: () => void;
  onRestore: () => void;
};

export function HistoricalVersionView({
  version,
  content,
  device,
  onDeviceChange,
  onBack,
  onRestore,
}: HistoricalVersionViewProps) {
  const toolbarButton =
    "inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background";
  const toolbarButtonPrimary =
    "inline-flex items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0]";

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Viewing Version {version.versionNumber}
              </h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                Historical snapshot
              </span>
              <StatusBadge kind="websiteRecord" value={version.websiteStatus} />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
              {formatVersionSavedAt(version.createdAt)}. This preview does not
              change the current editor or the saved website. Press Escape to
              return.
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
              Back to Version History
            </button>
            <button
              type="button"
              onClick={onRestore}
              className={toolbarButtonPrimary}
            >
              Restore this version
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <section
          aria-label="Historical website preview"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <LivePreview device={device}>
            <ServiceModern01 content={content} />
          </LivePreview>
        </section>
      </div>
    </div>
  );
}
