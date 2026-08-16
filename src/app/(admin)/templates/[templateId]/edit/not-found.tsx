import Link from "next/link";

export default function TemplateEditNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Template not found
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        That template ID is not in the registry, so it cannot be edited.
      </p>
      <Link
        href="/templates"
        className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
      >
        Back to Templates
      </Link>
    </div>
  );
}
