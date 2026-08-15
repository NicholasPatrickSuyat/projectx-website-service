"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SERVICE_MODERN_01_DEMO_ASSETS } from "@/lib/templates/demo-assets";
import {
  listWebsiteMediaAction,
  uploadWebsiteMediaAction,
} from "@/lib/website-media/actions";
import { formatWebsiteMediaSize, type WebsiteMedia, WEBSITE_MEDIA_MAX_BYTES } from "@/lib/website-media/types";

type MediaLibraryModalProps = {
  websiteId: string;
  open: boolean;
  selectedSrc: string;
  onClose: () => void;
  onSelect: (src: string) => void;
};

export function MediaLibraryModal({
  websiteId,
  open,
  selectedSrc,
  onClose,
  onSelect,
}: MediaLibraryModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<WebsiteMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await listWebsiteMediaAction(websiteId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setMedia([]);
      } else {
        setMedia(result.media);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, websiteId]);

  const selectedLabel = useMemo(() => {
    const uploaded = media.find((item) => item.publicPath === selectedSrc);
    if (uploaded) {
      return uploaded.originalFilename;
    }
    return (
      SERVICE_MODERN_01_DEMO_ASSETS.find((asset) => asset.src === selectedSrc)
        ?.label ?? null
    );
  }, [media, selectedSrc]);

  async function onUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadWebsiteMediaAction(websiteId, formData);
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMedia((current) => [
      result.media,
      ...current.filter((item) => item.id !== result.media.id),
    ]);
    onSelect(result.media.publicPath);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close media library"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-library-heading"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
          <div>
            <h2
              id="media-library-heading"
              className="text-base font-semibold text-foreground"
            >
              Media Library
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Upload or reuse images for this website. JPEG, PNG, and WebP up to{" "}
              {formatWebsiteMediaSize(WEBSITE_MEDIA_MAX_BYTES)}. Removing an
              image from a field does not delete the upload.
            </p>
            {selectedLabel ? (
              <p className="mt-2 text-xs text-muted">
                Currently selected: {selectedLabel}
              </p>
            ) : null}
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
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void onUpload(event.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0] disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload image"}
            </button>
            <p className="text-xs text-muted">
              SVG, GIF, and non-image files are rejected.
            </p>
          </div>

          {error ? (
            <p
              className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-foreground">
              Uploaded images
            </h3>
            {loading ? (
              <p className="mt-3 text-sm text-muted">Loading uploaded images…</p>
            ) : media.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                No images uploaded for this website yet.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item) => {
                  const selected = item.publicPath === selectedSrc;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.publicPath)}
                        className={`w-full overflow-hidden rounded-xl border text-left ${
                          selected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.publicPath}
                          alt=""
                          className="h-28 w-full object-cover"
                        />
                        <span className="block truncate px-3 py-2 text-xs font-medium text-foreground">
                          {item.originalFilename}
                        </span>
                        <span className="block px-3 pb-2 text-[11px] text-muted">
                          {formatWebsiteMediaSize(item.fileSize)}
                          {selected ? " · Selected" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">
              Template images
            </h3>
            <p className="mt-1 text-xs text-muted">
              Bundled Service Modern 01 assets. Use these to restore a demo
              image without deleting uploads.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SERVICE_MODERN_01_DEMO_ASSETS.map((asset) => {
                const selected = asset.src === selectedSrc;
                return (
                  <li key={asset.src}>
                    <button
                      type="button"
                      onClick={() => onSelect(asset.src)}
                      className={`w-full overflow-hidden rounded-xl border text-left ${
                        selected
                          ? "border-accent ring-2 ring-accent/30"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.src}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                      <span className="block px-3 py-2 text-xs font-medium text-foreground">
                        {asset.label}
                        {selected ? " · Selected" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
