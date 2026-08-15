"use client";

import { useMemo, useState } from "react";
import { SERVICE_MODERN_01_DEMO_ASSETS } from "@/lib/templates/demo-assets";
import { FieldError, FieldHint, SelectField, labelClass } from "./fields";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { useWebsiteMediaContext } from "./WebsiteMediaContext";

type ImagePickerFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  allowClear?: boolean;
  templateFallbackSrc?: string;
};

export function ImagePickerField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  allowClear = false,
  templateFallbackSrc,
}: ImagePickerFieldProps) {
  const media = useWebsiteMediaContext();
  const [open, setOpen] = useState(false);

  const assetOptions = useMemo(
    () => [
      ...(allowClear ? [{ value: "", label: "Text fallback only" }] : []),
      ...SERVICE_MODERN_01_DEMO_ASSETS.map((asset) => ({
        value: asset.src,
        label: asset.label,
      })),
    ],
    [allowClear],
  );

  if (!media) {
    return (
      <SelectField
        id={id}
        label={label}
        value={value}
        options={assetOptions}
        error={error}
        hint={hint ?? "Local demo assets only."}
        onChange={onChange}
      />
    );
  }

  const selectedDemo = SERVICE_MODERN_01_DEMO_ASSETS.find(
    (asset) => asset.src === value,
  );
  const previewSrc = value || null;

  return (
    <div>
      <p id={`${id}-label`} className={labelClass}>
        {label}
      </p>
      <div className="mt-1.5 flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-3 text-muted">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">
            {selectedDemo?.label ||
              (value ? "Uploaded website image" : "No image selected")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2f6ef0]"
            >
              Choose image
            </button>
            {templateFallbackSrc && value !== templateFallbackSrc ? (
              <button
                type="button"
                onClick={() => onChange(templateFallbackSrc)}
                className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Use template image
              </button>
            ) : null}
            {allowClear && value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <FieldError message={error} />
      <MediaLibraryModal
        websiteId={media.websiteId}
        open={open}
        selectedSrc={value}
        onClose={() => setOpen(false)}
        onSelect={(src) => {
          onChange(src);
          setOpen(false);
        }}
      />
    </div>
  );
}
