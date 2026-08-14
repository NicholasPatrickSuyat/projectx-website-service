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
import {
  WEBSITE_RECORD_STATUS_LABELS,
  getWebsiteStatusTransitions,
  type WebsiteRecordStatus,
} from "@/lib/domain";
import {
  saveWebsiteDraftAction,
  updateWebsiteStatusAction,
} from "@/lib/websites/actions";
import { EditorForm, type EditorPanelId } from "./EditorForm";
import {
  LivePreview,
  PREVIEW_DEVICES,
  type PreviewDevice,
} from "./LivePreview";
import type { EditorUpdate } from "./panels";
import { UnsavedChangesGuard } from "./UnsavedChangesGuard";

type WorkspacePane = "editor" | "preview";
type SaveUiState = "saved" | "dirty" | "saving" | "failed";

export type WebsiteEditorPersistence = {
  websiteId: string;
  websiteName: string;
  status: WebsiteRecordStatus;
  resetContent: ServiceWebsiteContent;
};

type WebsiteEditorProps = {
  template: TemplateDefinition;
  initialContent: ServiceWebsiteContent;
  persistence?: WebsiteEditorPersistence;
};

function snapshot(content: ServiceWebsiteContent): string {
  return JSON.stringify(syncSharedContactFields(content));
}

export function WebsiteEditor({
  template,
  initialContent,
  persistence,
}: WebsiteEditorProps) {
  const persisted = Boolean(persistence);
  const [content, setContent] = useState(() =>
    syncSharedContactFields(cloneContent(initialContent)),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshot(initialContent),
  );
  const [status, setStatus] = useState<WebsiteRecordStatus>(
    persistence?.status ?? "DRAFT",
  );
  const [panel, setPanel] = useState<EditorPanelId>("business");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [workspacePane, setWorkspacePane] = useState<WorkspacePane>("editor");
  const [focusPreview, setFocusPreview] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [saveState, setSaveState] = useState<SaveUiState>("saved");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const errors = validateContent(content);
  const errorCount = Object.keys(errors).length;
  const isDirty = snapshot(content) !== savedSnapshot;
  const displayState: SaveUiState =
    saveState === "saving" || saveState === "failed"
      ? saveState
      : isDirty
        ? "dirty"
        : "saved";

  const onUpdate: EditorUpdate = (updater) => {
    setContent((current) => {
      const next = cloneContent(current);
      updater(next);
      return syncSharedContactFields(next);
    });
    setResetNotice(false);
    setSaveMessage(null);
    if (saveState === "failed") {
      setSaveState("dirty");
    }
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

  function resetEditor() {
    const confirmed = window.confirm(
      persisted
        ? "Replace the current editor content with a fresh template, keeping this client's business name and contact details? This does not change the saved draft until you click Save Draft."
        : "Reset all editor fields back to the original demo content? Current session changes will be discarded.",
    );
    if (!confirmed) {
      return;
    }
    const source = persistence?.resetContent ?? initialContent;
    setContent(syncSharedContactFields(cloneContent(source)));
    setResetNotice(true);
    setFocusPreview(false);
    setSaveMessage(null);
    if (persisted) {
      setSaveState("dirty");
    }
  }

  async function saveDraft() {
    if (!persistence) {
      return;
    }

    const currentErrors = validateContent(content);
    if (Object.keys(currentErrors).length > 0) {
      setSaveState("failed");
      setSaveMessage("Fix the highlighted fields before saving.");
      return;
    }

    setSaveState("saving");
    setSaveMessage(null);

    const result = await saveWebsiteDraftAction(
      persistence.websiteId,
      JSON.stringify(content),
    );

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.error);
      return;
    }

    setSavedSnapshot(snapshot(content));
    setStatus(result.status);
    setSaveState("saved");
    setSaveMessage("Draft saved.");
    setResetNotice(false);
  }

  async function onStatusChange(nextStatus: WebsiteRecordStatus) {
    if (!persistence || nextStatus === status) {
      return;
    }

    if (isDirty) {
      setSaveMessage("Save draft before changing status.");
      return;
    }

    const result = await updateWebsiteStatusAction(
      persistence.websiteId,
      nextStatus,
    );
    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.error);
      return;
    }

    setStatus(result.status);
    setSaveMessage(`Status updated to ${WEBSITE_RECORD_STATUS_LABELS[result.status]}. This is not a public live website.`);
  }

  const toolbarButton =
    "inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background";
  const toolbarButtonPrimary =
    "inline-flex items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ef0]";

  const statusOptions: WebsiteRecordStatus[] = [
    status,
    ...getWebsiteStatusTransitions(status).filter((item) => item !== status),
  ];

  const saveBadgeClass =
    displayState === "saved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : displayState === "saving"
        ? "border-slate-200 bg-slate-50 text-slate-800"
        : displayState === "failed"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-amber-200 bg-amber-50 text-amber-900";

  const saveBadgeLabel =
    displayState === "saved"
      ? "Saved"
      : displayState === "saving"
        ? "Saving..."
        : displayState === "failed"
          ? "Save failed"
          : "Unsaved changes";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-background ${
        focusPreview ? "fixed inset-0 z-[70]" : "h-full"
      }`}
    >
      {persisted ? <UnsavedChangesGuard enabled={isDirty} /> : null}

      <div className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {focusPreview
                  ? "Preview"
                  : persisted
                    ? persistence?.websiteName ?? "Website Editor"
                    : "Website Editor"}
              </h2>
              {persisted ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${saveBadgeClass}`}
                >
                  {saveBadgeLabel}
                </span>
              ) : (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                  Session only
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
              {focusPreview
                ? `Showing current unsaved ${template.displayName} edits. Press Escape or Back to editor to return.`
                : persisted
                  ? `Editing saved ${template.displayName} content. The live preview updates immediately. Save Draft writes to local D1. Ready to publish is an internal status only — this website is not public.`
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

            {focusPreview ? null : persisted ? (
              <>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <span className="whitespace-nowrap">Status</span>
                  <select
                    value={status}
                    disabled={isDirty || saveState === "saving"}
                    onChange={(event) =>
                      void onStatusChange(
                        event.target.value as WebsiteRecordStatus,
                      )
                    }
                    className="rounded-lg border border-border bg-card px-2 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Website status"
                    title={
                      isDirty
                        ? "Save draft before changing status"
                        : "Internal status only. This website is not public."
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {WEBSITE_RECORD_STATUS_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void saveDraft()}
                  disabled={saveState === "saving"}
                  className={`${toolbarButtonPrimary} disabled:opacity-60`}
                >
                  {saveState === "saving" ? "Saving..." : "Save Draft"}
                </button>
                <button type="button" onClick={resetEditor} className={toolbarButton}>
                  Reset to template
                </button>
              </>
            ) : (
              <>
                <Link href={template.previewPath} className={toolbarButton}>
                  Open demo preview
                </Link>
                <button type="button" onClick={resetEditor} className={toolbarButton}>
                  Reset to demo
                </button>
              </>
            )}
          </div>
        </div>

        {resetNotice ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {persisted
              ? "Editor was reset to a fresh template with this client's identity. Save Draft to keep it."
              : "Editor restored to the original demo content."}
          </p>
        ) : null}

        {saveMessage && displayState === "failed" ? (
          <p
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
            role="alert"
          >
            {saveMessage}
          </p>
        ) : null}

        {saveMessage && displayState !== "failed" && persisted ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {saveMessage}
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
