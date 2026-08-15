"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export const PREVIEW_DEVICES: Array<{
  id: PreviewDevice;
  label: string;
  width: number | null;
  hint: string;
}> = [
  { id: "desktop", label: "Desktop", width: null, hint: "Full preview width" },
  { id: "tablet", label: "Tablet", width: 768, hint: "768px canvas" },
  { id: "mobile", label: "Mobile", width: 390, hint: "390px canvas" },
];

const SRC_DOC =
  "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'></head><body></body></html>";

function syncIframeAssets(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument;
  if (!doc?.head || !doc.body) {
    return;
  }

  const existing = new Set(
    [...doc.head.querySelectorAll("style, link[rel='stylesheet']")].map(
      (node) => node.outerHTML,
    ),
  );

  document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
    if (!existing.has(node.outerHTML)) {
      doc.head.appendChild(node.cloneNode(true));
    }
  });

  doc.documentElement.className = document.documentElement.className;
  doc.documentElement.lang = "en";
  doc.body.style.margin = "0";
  doc.body.style.background = "transparent";
}

function isSafePreviewHref(href: string) {
  return (
    href.startsWith("#") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:")
  );
}

type LivePreviewProps = {
  children: ReactNode;
  device: PreviewDevice;
};

export function LivePreview({ children, device }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const selected =
    PREVIEW_DEVICES.find((item) => item.id === device) ?? PREVIEW_DEVICES[0]!;

  const attach = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc?.body) {
      return;
    }

    syncIframeAssets(iframe);
    setMountNode(doc.body);
  }, []);

  useEffect(() => {
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [attach]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !mountNode) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || isSafePreviewHref(href)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (/^https?:/i.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };

    doc.addEventListener("click", onClick, true);
    return () => doc.removeEventListener("click", onClick, true);
  }, [mountNode]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#dfe6ef]">
      <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-hidden p-3 sm:p-4">
        <div
          className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] ${
            selected.width ? "max-w-full" : "w-full min-w-0"
          }`}
          style={
            selected.width
              ? { width: `min(100%, ${selected.width}px)` }
              : undefined
          }
        >
          <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
            <p className="ml-2 truncate text-[11px] font-medium text-slate-500">
              Live preview · {selected.label}
              {selected.width ? ` · ${selected.width}px` : ""}
            </p>
          </div>
          <iframe
            ref={iframeRef}
            title="Live website preview"
            srcDoc={SRC_DOC}
            width="100%"
            height="100%"
            className="block h-full min-h-0 w-full min-w-0 flex-1 border-0 bg-white"
            onLoad={attach}
          />
        </div>
      </div>
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}
