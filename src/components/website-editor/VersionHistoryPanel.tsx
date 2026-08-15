"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getWebsiteVersionAction,
  listWebsiteVersionsAction,
} from "@/lib/website-versions/actions";
import {
  formatVersionSavedAt,
  type WebsiteVersionSummary,
} from "@/lib/website-versions/types";
import type { WebsiteContent } from "@/lib/templates/types";

type VersionHistoryPanelProps = {
  websiteId: string;
  open: boolean;
  isDirty: boolean;
  refreshKey: number;
  onClose: () => void;
  onView: (
    version: WebsiteVersionSummary,
    content: WebsiteContent,
  ) => void;
  onRestore: (
    version: WebsiteVersionSummary,
    content: WebsiteContent,
  ) => void;
};

export function VersionHistoryPanel({
  websiteId,
  open,
  isDirty,
  refreshKey,
  onClose,
  onView,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<WebsiteVersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await listWebsiteVersionsAction(websiteId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setVersions([]);
      } else {
        setVersions(result.versions);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, websiteId, refreshKey]);

  async function loadVersion(version: WebsiteVersionSummary) {
    setBusyId(version.id);
    setError(null);
    const result = await getWebsiteVersionAction(websiteId, version.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    return result;
  }

  async function viewVersion(version: WebsiteVersionSummary) {
    const result = await loadVersion(version);
    if (!result) {
      return;
    }
    onView(result.version, result.content);
  }

  async function restoreVersion(version: WebsiteVersionSummary) {
    const confirmed = window.confirm(
      isDirty
        ? `You have unsaved changes. Restore Version ${version.versionNumber} and replace the current editor content? This does not change the saved draft until you click Save Draft.`
        : `Load Version ${version.versionNumber} into the editor? This does not change the saved draft until you click Save Draft.`,
    );
    if (!confirmed) {
      return;
    }

    const result = await loadVersion(version);
    if (!result) {
      return;
    }
    onRestore(result.version, result.content);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close version history"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        aria-labelledby="version-history-heading"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2
              id="version-history-heading"
              className="text-base font-semibold text-foreground"
            >
              Version History
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Saved checkpoints for recovery. Viewing a version does not change
              the current website.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-muted">Loading saved versions…</p>
          ) : error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No saved versions yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                The next successful Save Draft that changes this website will
                create Version 1.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Version {version.versionNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatVersionSavedAt(version.createdAt)}
                      </p>
                    </div>
                    <StatusBadge
                      kind="websiteRecord"
                      value={version.websiteStatus}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void viewVersion(version)}
                      disabled={busyId === version.id}
                      className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background disabled:opacity-60"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => void restoreVersion(version)}
                      disabled={busyId === version.id}
                      className="inline-flex items-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2f6ef0] disabled:opacity-60"
                    >
                      Restore
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}
