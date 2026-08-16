"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cloneContent,
} from "@/lib/templates/editor";
import { isRestaurantTemplateId, isSalonTemplateId, isServiceTemplateId } from "@/lib/templates/registry";
import { renderTemplate } from "@/lib/templates/render";
import type {
  TemplateDefinition,
  WebsiteContent,
} from "@/lib/templates/types";
import {
  isRestaurantWebsiteContent,
  isSalonWebsiteContent,
  isServiceWebsiteContent,
} from "@/lib/templates/types";
import {
  syncWebsiteContent,
  validateWebsiteContent,
} from "@/lib/templates/website-content";
import {
  WEBSITE_RECORD_STATUS_LABELS,
  canPublishWebsite,
  getWebsiteStatusTransitions,
  type WebsiteRecordStatus,
} from "@/lib/domain";
import {
  saveWebsiteDraftAction,
  updateWebsiteStatusAction,
} from "@/lib/websites/actions";
import { getSavedWebsitePreviewPath } from "@/lib/websites/types";
import { publishWebsiteAction, listWebsitePublicationsAction } from "@/lib/website-publications/actions";
import {
  formatPublicationPublishedAt,
  getPublishedWebsitePreviewPath,
  type WebsitePublicationSummary,
} from "@/lib/website-publications/types";
import type { WebsiteVersionSummary } from "@/lib/website-versions/types";
import { EditorForm, type EditorPanelId } from "./EditorForm";
import {
  RestaurantEditorForm,
  type RestaurantEditorPanelId,
} from "./RestaurantEditorForm";
import {
  SalonEditorForm,
  type SalonEditorPanelId,
} from "./SalonEditorForm";
import { HistoricalPublicationView } from "./HistoricalPublicationView";
import { HistoricalVersionView } from "./HistoricalVersionView";
import {
  LivePreview,
  PREVIEW_DEVICES,
  type PreviewDevice,
} from "./LivePreview";
import type { EditorUpdate } from "./panels";
import type { RestaurantEditorUpdate } from "./restaurant-panels";
import type { SalonEditorUpdate } from "./salon-panels";
import { UnsavedChangesGuard } from "./UnsavedChangesGuard";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { ClientReviewPanel } from "./ClientReviewPanel";
import { PublicationHistoryPanel } from "./PublicationHistoryPanel";
import { WebsiteDomainsPanel } from "./WebsiteDomainsPanel";
import { WebsiteMediaProvider } from "./WebsiteMediaContext";

type WorkspacePane = "editor" | "preview";
type SaveUiState = "saved" | "dirty" | "saving" | "failed";

export type WebsiteEditorPersistence = {
  websiteId: string;
  websiteName: string;
  status: WebsiteRecordStatus;
  resetContent: WebsiteContent;
};

type WebsiteEditorProps = {
  template: TemplateDefinition;
  initialContent: WebsiteContent;
  persistence?: WebsiteEditorPersistence;
};

function snapshot(templateId: TemplateDefinition["id"], content: WebsiteContent): string {
  return JSON.stringify(syncWebsiteContent(templateId, content));
}

export function WebsiteEditor({
  template,
  initialContent,
  persistence,
}: WebsiteEditorProps) {
  const persisted = Boolean(persistence);
  const [content, setContent] = useState(() =>
    syncWebsiteContent(template.id, cloneContent(initialContent)),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshot(template.id, initialContent),
  );
  const [status, setStatus] = useState<WebsiteRecordStatus>(
    persistence?.status ?? "DRAFT",
  );
  const [panel, setPanel] = useState<
    EditorPanelId | RestaurantEditorPanelId | SalonEditorPanelId
  >("business");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [workspacePane, setWorkspacePane] = useState<WorkspacePane>("editor");
  const [focusPreview, setFocusPreview] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [saveState, setSaveState] = useState<SaveUiState>("saved");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [publicationsOpen, setPublicationsOpen] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [publicationRefreshKey, setPublicationRefreshKey] = useState(0);
  const [latestPublication, setLatestPublication] =
    useState<WebsitePublicationSummary | null>(null);
  const [viewingVersion, setViewingVersion] = useState<{
    version: WebsiteVersionSummary;
    content: WebsiteContent;
  } | null>(null);
  const [viewingPublication, setViewingPublication] = useState<{
    publication: WebsitePublicationSummary;
    content: WebsiteContent;
  } | null>(null);

  const errors = validateWebsiteContent(template.id, content);
  const errorCount = Object.keys(errors).length;
  const isDirty = snapshot(template.id, content) !== savedSnapshot;
  const displayState: SaveUiState =
    saveState === "saving" || saveState === "failed"
      ? saveState
      : isDirty
        ? "dirty"
        : "saved";

  const onUpdate = (updater: (draft: WebsiteContent) => void) => {
    setContent((current) => {
      const next = cloneContent(current);
      updater(next);
      return syncWebsiteContent(template.id, next);
    });
    setResetNotice(false);
    setSaveMessage(null);
    if (saveState === "failed") {
      setSaveState("dirty");
    }
  };

  useEffect(() => {
    if (
      !focusPreview &&
      !historyOpen &&
      !viewingVersion &&
      !reviewOpen &&
      !publicationsOpen &&
      !domainsOpen &&
      !viewingPublication
    ) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      if (viewingPublication) {
        setViewingPublication(null);
        return;
      }
      if (viewingVersion) {
        setViewingVersion(null);
        return;
      }
      if (publicationsOpen) {
        setPublicationsOpen(false);
        return;
      }
      if (historyOpen) {
        setHistoryOpen(false);
        return;
      }
      if (reviewOpen) {
        setReviewOpen(false);
        return;
      }
      if (domainsOpen) {
        setDomainsOpen(false);
        return;
      }
      setFocusPreview(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    focusPreview,
    historyOpen,
    viewingVersion,
    reviewOpen,
    publicationsOpen,
    domainsOpen,
    viewingPublication,
  ]);

  useEffect(() => {
    if (!persistence) {
      return;
    }

    const websiteId = persistence.websiteId;
    let cancelled = false;

    async function loadLatestPublication() {
      const result = await listWebsitePublicationsAction(websiteId);
      if (cancelled || !result.ok) {
        return;
      }
      setLatestPublication(result.publications[0] ?? null);
    }

    void loadLatestPublication();

    return () => {
      cancelled = true;
    };
  }, [persistence, publicationRefreshKey]);

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
    setContent(syncWebsiteContent(template.id, cloneContent(source)));
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

    const currentErrors = validateWebsiteContent(template.id, content);
    if (Object.keys(currentErrors).length > 0) {
      setSaveState("failed");
      setSaveMessage("Fix the highlighted fields before saving.");
      return;
    }

    setSaveState("saving");
    setSaveMessage(null);
    const previousStatus = status;

    const result = await saveWebsiteDraftAction(
      persistence.websiteId,
      JSON.stringify(content),
    );

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.error);
      return;
    }

    setSavedSnapshot(snapshot(template.id, content));
    setStatus(result.status);
    setSaveState("saved");
    setResetNotice(false);
    setHistoryRefreshKey((current) => current + 1);
    setReviewRefreshKey((current) => current + 1);
    if (result.contentChanged && result.versionNumber) {
      setSaveMessage(
        previousStatus !== "DRAFT" && result.status === "DRAFT"
          ? `Draft saved as Version ${result.versionNumber}. Status is now Draft because the saved content changed and needs review again.`
          : `Draft saved as Version ${result.versionNumber}.`,
      );
    } else if (result.contentChanged === false) {
      setSaveMessage("No content changes to save.");
    } else {
      setSaveMessage("Draft saved.");
    }
  }

  function applyRestoredVersion(
    version: WebsiteVersionSummary,
    restoredContent: WebsiteContent,
  ) {
    setContent(syncWebsiteContent(template.id, cloneContent(restoredContent)));
    setSaveState("dirty");
    setResetNotice(false);
    setFocusPreview(false);
    setHistoryOpen(false);
    setViewingVersion(null);
    setSaveMessage(
      `Version ${version.versionNumber} loaded into the editor. Save Draft to keep it.`,
    );
  }

  function restoreViewingVersion() {
    if (!viewingVersion) {
      return;
    }
    const confirmed = window.confirm(
      isDirty
        ? `You have unsaved changes. Restore Version ${viewingVersion.version.versionNumber} and replace the current editor content? This does not change the saved draft until you click Save Draft.`
        : `Load Version ${viewingVersion.version.versionNumber} into the editor? This does not change the saved draft until you click Save Draft.`,
    );
    if (!confirmed) {
      return;
    }
    applyRestoredVersion(viewingVersion.version, viewingVersion.content);
  }

  async function publishWebsite() {
    if (!persistence) {
      return;
    }

    if (isDirty) {
      setSaveMessage(
        "Save Draft before publishing. Publish freezes the saved website, not unsaved editor changes.",
      );
      return;
    }

    if (canPublishWebsite(status)) {
      const confirmed = window.confirm(
        "Publish this approved saved Website snapshot?\n\nThis creates the internal published version. It does not deploy the Website to the internet yet.",
      );
      if (!confirmed) {
        return;
      }
    }

    setSaveState("saving");
    setSaveMessage(null);
    const result = await publishWebsiteAction(persistence.websiteId);
    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.error);
      return;
    }

    setStatus(result.status);
    setSaveState("saved");
    setPublicationRefreshKey((current) => current + 1);
    setSaveMessage(
      `Published as Publication ${result.publicationNumber}. Internal published snapshot. Public deployment is not configured yet.`,
    );
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
                  ? latestPublication
                    ? `Editing saved ${template.displayName} content. Live preview shows unsaved edits. Standalone Preview and Client Review show the last saved draft. Latest internal snapshot is Publication ${latestPublication.publicationNumber} (${formatPublicationPublishedAt(latestPublication.publishedAt)}). Public deployment is not configured yet.`
                    : `Editing saved ${template.displayName} content. The live preview updates immediately with unsaved edits. Open Standalone Preview shows the last saved draft. Ready to publish is an internal status only — this website is not public.`
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
                <button
                  type="button"
                  onClick={() => {
                    setReviewOpen(false);
                    setPublicationsOpen(false);
                    setDomainsOpen(false);
                    setHistoryOpen(true);
                  }}
                  className={toolbarButton}
                >
                  Version History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    setReviewOpen(false);
                    setPublicationsOpen(false);
                    setDomainsOpen(true);
                  }}
                  className={toolbarButton}
                >
                  Hostnames
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    setPublicationsOpen(false);
                    setDomainsOpen(false);
                    setReviewOpen(true);
                  }}
                  className={toolbarButton}
                >
                  Client Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    setReviewOpen(false);
                    setDomainsOpen(false);
                    setPublicationsOpen(true);
                  }}
                  className={toolbarButton}
                >
                  Publication History
                </button>
                {latestPublication && persistence ? (
                  <a
                    href={getPublishedWebsitePreviewPath(persistence.websiteId)}
                    target="_blank"
                    rel="noreferrer"
                    className={toolbarButton}
                    title="Shows the latest internal published snapshot. This is not a public website."
                  >
                    View Published Version
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => void publishWebsite()}
                  disabled={saveState === "saving"}
                  className={`${toolbarButtonPrimary} disabled:opacity-60`}
                  title={
                    isDirty
                      ? "Save Draft before publishing. Publish freezes the saved website, not unsaved editor changes."
                      : canPublishWebsite(status)
                        ? "Create an internal published snapshot. This does not deploy to the internet."
                        : "Publish is only allowed when the website status is Ready to publish."
                  }
                >
                  Publish
                </button>
                {persistence ? (
                  <a
                    href={getSavedWebsitePreviewPath(persistence.websiteId)}
                    target="_blank"
                    rel="noreferrer"
                    className={toolbarButton}
                    title="Shows the last saved draft. Unsaved editor changes are not included."
                  >
                    Open Standalone Preview
                  </a>
                ) : null}
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
            {(() => {
              const form =
                isServiceTemplateId(template.id) &&
                isServiceWebsiteContent(content) ? (
                  <EditorForm
                    panel={panel as EditorPanelId}
                    content={content}
                    errors={errors}
                    onUpdate={onUpdate as EditorUpdate}
                    onPanelChange={setPanel}
                  />
                ) : isRestaurantTemplateId(template.id) &&
                  isRestaurantWebsiteContent(content) ? (
                  <RestaurantEditorForm
                    panel={panel as RestaurantEditorPanelId}
                    content={content}
                    errors={errors}
                    onUpdate={onUpdate as RestaurantEditorUpdate}
                    onPanelChange={setPanel}
                  />
                ) : isSalonTemplateId(template.id) &&
                  isSalonWebsiteContent(content) ? (
                  <SalonEditorForm
                    panel={panel as SalonEditorPanelId}
                    content={content}
                    errors={errors}
                    onUpdate={onUpdate as SalonEditorUpdate}
                    onPanelChange={setPanel}
                  />
                ) : (
                  <p className="text-sm text-muted">
                    This website content does not match the selected template.
                  </p>
                );

              return persistence ? (
                <WebsiteMediaProvider websiteId={persistence.websiteId}>
                  {form}
                </WebsiteMediaProvider>
              ) : (
                form
              );
            })()}
          </div>
        </section>

        <section
          aria-label="Live website preview"
          className={`min-h-0 min-w-0 flex-col ${
            focusPreview || workspacePane === "preview" ? "flex flex-1" : "hidden"
          } xl:flex xl:min-w-0 xl:flex-1`}
        >
          {viewingVersion || viewingPublication ? null : (
            <LivePreview device={device}>
              {renderTemplate(template.id, content)}
            </LivePreview>
          )}
        </section>
      </div>

      {persistence ? (
        <VersionHistoryPanel
          websiteId={persistence.websiteId}
          open={historyOpen && !viewingVersion && !viewingPublication}
          isDirty={isDirty}
          refreshKey={historyRefreshKey}
          onClose={() => setHistoryOpen(false)}
          onView={(version, restoredContent) =>
            setViewingVersion({ version, content: restoredContent })
          }
          onRestore={applyRestoredVersion}
        />
      ) : null}

      {persistence ? (
        <PublicationHistoryPanel
          websiteId={persistence.websiteId}
          open={publicationsOpen && !viewingPublication && !viewingVersion}
          refreshKey={publicationRefreshKey}
          onClose={() => setPublicationsOpen(false)}
          onView={(publication, publicationContent) =>
            setViewingPublication({
              publication,
              content: publicationContent,
            })
          }
        />
      ) : null}

      {persistence ? (
        <ClientReviewPanel
          websiteId={persistence.websiteId}
          websiteStatus={status}
          open={reviewOpen && !viewingVersion && !viewingPublication}
          refreshKey={reviewRefreshKey}
          onClose={() => setReviewOpen(false)}
        />
      ) : null}

      {persistence ? (
        <WebsiteDomainsPanel
          websiteId={persistence.websiteId}
          open={domainsOpen && !viewingVersion && !viewingPublication}
          onClose={() => setDomainsOpen(false)}
        />
      ) : null}

      {viewingVersion ? (
        <HistoricalVersionView
          templateId={template.id}
          version={viewingVersion.version}
          content={viewingVersion.content}
          device={device}
          onDeviceChange={setDevice}
          onBack={() => setViewingVersion(null)}
          onRestore={restoreViewingVersion}
        />
      ) : null}

      {viewingPublication ? (
        <HistoricalPublicationView
          templateId={viewingPublication.publication.templateId}
          publication={viewingPublication.publication}
          content={viewingPublication.content}
          device={device}
          onDeviceChange={setDevice}
          onBack={() => setViewingPublication(null)}
        />
      ) : null}
    </div>
  );
}
