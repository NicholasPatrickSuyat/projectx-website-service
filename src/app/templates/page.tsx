import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { listTemplates } from "@/lib/templates/registry";

export const metadata: Metadata = {
  title: "Templates",
};

export default function TemplatesPage() {
  const templates = listTemplates();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Templates
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          Reusable website templates for client sites. Preview uses structured
          demo content — editing and client assignment come later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Panel key={template.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {template.displayName}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {template.categoryLabel}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
                {template.status}
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted">
              {template.description}
            </p>
            <div className="mt-5">
              <Link
                href={template.previewPath}
                className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f6ef0]"
              >
                Preview
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
