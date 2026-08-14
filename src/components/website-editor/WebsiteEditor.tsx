"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ServiceModern01 } from "@/components/website-templates/service-modern-01/ServiceModern01";
import {
  cloneContent,
  syncSharedContactFields,
  validateContent,
} from "@/lib/templates/editor";
import type {
  ServiceWebsiteContent,
  TemplateDefinition,
} from "@/lib/templates/types";
import { EditorForm, type EditorPanelId } from "./EditorForm";
import {
  LivePreview,
  PREVIEW_DEVICES,
  type PreviewDevice,
} from "./LivePreview";
import type { EditorUpdate } from "./panels";

type WorkspacePane = "editor" | "preview";

type WebsiteEditorProps = {
  template: TemplateDefinition;
  initialContent: ServiceWebsiteContent;
};

export function WebsiteEditor({ template, initialContent }: WebsiteEditorProps) {
  const [content, setContent] = useState(() =>
    syncSharedContactFields(cloneContent(initialContent)),
  );
  const [panel, setPanel] = useState<EditorPanelId>("business");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [workspacePane, setWorkspacePane] = useState<WorkspacePane>("editor");
  const [focusPreview, setFocusPreview] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const errors = validateContent(content);
  const errorCount = Object.keys(errors).length;

  const onUpdate: EditorUpdate = (updater) => {
    setContent((current) => {
      const next = cloneContent(current);
      updater(next);
      return syncSharedContactFields(next);
    });
    setResetNotice(false);
  };

  useEffect(() => {
    if (!focusPreview) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusPreview(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusPreview]);

  function resetToDemo() {
    const confirmed = window.confirm(
      "Reset all editor fields back to the original demo content? Current session changes will be discarded.",
    );
    if (!confirmed) {
      return;
    }
    setContent(syncSharedContactFields(cloneContent(initialContent)));
    setResetNotice(true);
    setFocusPreview(false);
  }

  const toolbarButton =
    "inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background";
  const toolbarButtonPrimary =
    "inline-flex items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0]";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-background ${
        focusPreview ? "fixed inset-0 z-[70]" : "h-full"
      }`}
    >
      <div className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {focusPreview ? "Preview" : "Website Editor"}
              </h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                Session only
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
              {focusPreview
                ? `Showing current unsaved ${template.displayName} edits. Press Escape or Back to editor to return.`
                : `Editing ${template.displayName}. Changes update the live preview immediately and are not saved. Refreshing restores the demo.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {focusPreview ? null : (
              <div className="flex rounded-lg border border-border bg-background p-0.5 xl:hidden">
                {(["editor", "preview"] as const).map((pane) => {
                  const active = workspacePane === pane;
                  return (
                    <button
                      key={pane}
                      type="button"
                      onClick={() => setWorkspacePane(pane)}
                      aria-pressed={active}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        active
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {pane === "editor" ? "Edit" : "Preview"}
                    </button>
                  );
                })}
              </div>
            )}

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
                    onClick={() => setDevice(item.id)}
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

            {focusPreview ? (
              <button
                type="button"
                onClick={() => setFocusPreview(false)}
                className={toolbarButtonPrimary}
              >
                Back to editor
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFocusPreview(true)}
                className={toolbarButtonPrimary}
              >
                Expand preview
              </button>
            )}

            {focusPreview ? null : (
              <>
                <Link href={template.previewPath} className={toolbarButton}>
                  Open demo preview
                </Link>
                <button type="button" onClick={resetToDemo} className={toolbarButton}>
                  Reset to demo
                </button>
              </>
            )}
          </div>
        </div>

        {resetNotice ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Editor restored to the original demo content.
          </p>
        ) : null}

        {errorCount > 0 ? (
          <p className="mt-3 text-xs text-muted" role="status">
            {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
            . The live preview still updates.
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <section
          aria-label="Website editor"
          className={
            focusPreview
              ? "hidden"
              : `min-h-0 min-w-0 flex-col overflow-hidden border-border ${
                  workspacePane === "editor" ? "flex flex-1" : "hidden"
                } xl:flex xl:w-[28rem] xl:flex-none xl:border-r 2xl:w-[32rem]`
          }
        >
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4">
            <EditorForm
              panel={panel}
              content={content}
              errors={errors}
              onUpdate={onUpdate}
              onPanelChange={setPanel}
            />
          </div>
        </section>

        <section
          aria-label="Live website preview"
          className={`min-h-0 min-w-0 flex-col ${
            focusPreview || workspacePane === "preview" ? "flex flex-1" : "hidden"
          } xl:flex xl:min-w-0 xl:flex-1`}
        >
          <LivePreview device={device}>
            <ServiceModern01 content={content} />
          </LivePreview>
        </section>
      </div>
    </div>
  );
}
