"use client";

import { useEffect, useState } from "react";
import {
  activateWebsitePublicationAction,
  getWebsitePublicationAction,
  listWebsitePublicationsAction,
} from "@/lib/website-publications/actions";
import {
  formatPublicationPublishedAt,
  getPublishedWebsitePreviewPath,
  type WebsitePublicationSummary,
} from "@/lib/website-publications/types";
import type { WebsiteContent } from "@/lib/templates/types";

type PublicationHistoryPanelProps = {
  websiteId: string;
  open: boolean;
  refreshKey: number;
  onClose: () => void;
  onView: (
    publication: WebsitePublicationSummary,
    content: WebsiteContent,
  ) => void;
};

export function PublicationHistoryPanel({
  websiteId,
  open,
  refreshKey,
  onClose,
  onView,
}: PublicationHistoryPanelProps) {
  const [publications, setPublications] = useState<WebsitePublicationSummary[]>(
    [],
  );
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
      const result = await listWebsitePublicationsAction(websiteId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setPublications([]);
      } else {
        setPublications(result.publications);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, websiteId, refreshKey]);

  async function viewPublication(publication: WebsitePublicationSummary) {
    setBusyId(publication.id);
    setError(null);
    const result = await getWebsitePublicationAction(websiteId, publication.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onView(result.publication, result.content);
  }

  async function makeLive(publication: WebsitePublicationSummary) {
    if (publication.isActive) {
      return;
    }

    const confirmed = window.confirm(
      `Make Publication ${publication.publicationNumber} the live public site?\n\nThis does not change the draft. It switches the public hostname to this frozen snapshot.`,
    );
    if (!confirmed) {
      return;
    }

    setBusyId(publication.id);
    setError(null);
    const result = await activateWebsitePublicationAction(
      websiteId,
      publication.id,
    );
    if (!result.ok) {
      setBusyId(null);
      setError(result.error);
      return;
    }

    const list = await listWebsitePublicationsAction(websiteId);
    setBusyId(null);
    if (!list.ok) {
      setError(list.error);
      return;
    }
    setPublications(list.publications);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close publication history"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        aria-labelledby="publication-history-heading"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2
              id="publication-history-heading"
              className="text-base font-semibold text-foreground"
            >
              Publication History
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Frozen publication snapshots. Make live restores an older
              snapshot without copying the current draft.
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
            <p className="text-sm text-muted">Loading publications…</p>
          ) : error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : publications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No publications yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Publish creates an immutable snapshot and generated public HTML.
                Draft edits do not change the live site until you Publish again.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {publications.map((publication) => (
                <li
                  key={publication.id}
                  data-publication-number={publication.publicationNumber}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Publication {publication.publicationNumber}
                        {publication.isActive ? (
                          <span className="ml-2 text-xs font-medium text-accent">
                            Live
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatPublicationPublishedAt(publication.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-action="view-publication"
                      onClick={() => void viewPublication(publication)}
                      disabled={busyId === publication.id}
                      className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background disabled:opacity-60"
                    >
                      View
                    </button>
                    {publication.isActive ? (
                      <a
                        href={getPublishedWebsitePreviewPath(websiteId)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
                      >
                        Open live
                      </a>
                    ) : (
                      <button
                        type="button"
                        data-action="make-live-publication"
                        onClick={() => void makeLive(publication)}
                        disabled={busyId === publication.id}
                        className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background disabled:opacity-60"
                      >
                        Make live
                      </button>
                    )}
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
