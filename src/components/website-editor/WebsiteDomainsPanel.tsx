"use client";

import { useEffect, useState } from "react";
import {
  addWebsiteDomainAction,
  listWebsiteDomainsAction,
  removeWebsiteDomainAction,
} from "@/lib/website-domains/actions";
import type { WebsiteDomain } from "@/lib/website-domains/types";

type WebsiteDomainsPanelProps = {
  websiteId: string;
  open: boolean;
  onClose: () => void;
};

export function WebsiteDomainsPanel({
  websiteId,
  open,
  onClose,
}: WebsiteDomainsPanelProps) {
  const [domains, setDomains] = useState<WebsiteDomain[]>([]);
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await listWebsiteDomainsAction(websiteId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setDomains([]);
      } else {
        setDomains(result.domains);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, websiteId]);

  async function addHostname() {
    setBusy(true);
    setError(null);
    const result = await addWebsiteDomainAction(websiteId, hostname);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDomains(result.domains);
    setHostname("");
  }

  async function removeHostname(domain: WebsiteDomain) {
    const confirmed = window.confirm(
      `Remove hostname ${domain.hostname} from this website?\n\nThis only changes internal routing configuration. It does not change DNS, certificates, versions, publications, status, or Client Review.`,
    );
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    const result = await removeWebsiteDomainAction(websiteId, domain.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDomains(result.domains);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close hostnames"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        aria-labelledby="website-domains-heading"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2
              id="website-domains-heading"
              className="text-base font-semibold text-foreground"
            >
              Hostnames
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Internal routing configuration only. This does not create DNS
              records, certificates, or a live public deployment.
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
            <p className="text-sm text-muted">Loading hostnames…</p>
          ) : (
            <div className="space-y-5">
              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              ) : null}

              <label className="block space-y-2">
                <span className="text-xs font-medium tracking-wide text-muted uppercase">
                  Add hostname
                </span>
                <input
                  type="text"
                  value={hostname}
                  onChange={(event) => setHostname(event.target.value)}
                  placeholder="cedar.localhost"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <button
                type="button"
                onClick={() => void addHostname()}
                disabled={busy || !hostname.trim()}
                className="inline-flex rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0] disabled:opacity-60"
              >
                {busy ? "Saving…" : "Add hostname"}
              </button>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Assigned hostnames
                </h3>
                {domains.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    No hostnames assigned yet. Local test hostnames such as
                    cedar.localhost can be added here.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {domains.map((domain) => (
                      <li
                        key={domain.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="break-all text-sm font-medium text-foreground">
                            {domain.hostname}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Internal routing only. Not DNS.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeHostname(domain)}
                          disabled={busy}
                          className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-card disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
