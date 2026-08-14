import Link from "next/link";

export default function TemplatePreviewNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4efe8] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Template not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          That template ID is not in the registry. Service Modern 01 is the only
          template available in this milestone.
        </p>
        <Link
          href="/templates"
          className="mt-6 inline-flex rounded-lg bg-[#3d7eff] px-4 py-2.5 text-sm font-medium text-white"
        >
          Back to Templates
        </Link>
      </div>
    </main>
  );
}
