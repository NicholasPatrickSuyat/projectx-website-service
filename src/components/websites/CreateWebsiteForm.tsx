"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Client } from "@/lib/clients/types";
import type { TemplateId } from "@/lib/templates/types";
import {
  createWebsiteAction,
  type CreateWebsiteActionState,
} from "@/lib/websites/actions";
import { defaultWebsiteName } from "@/lib/websites/types";

type CreateWebsiteFormProps = {
  client: Client;
  templateId: TemplateId;
  templateDisplayName: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export function CreateWebsiteForm({
  client,
  templateId,
  templateDisplayName,
}: CreateWebsiteFormProps) {
  const [state, formAction, pending] = useActionState(
    createWebsiteAction,
    null as CreateWebsiteActionState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <p
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="templateId" value={templateId} />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Website</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <p className={labelClass}>Client</p>
            <p className="mt-1.5 text-sm text-foreground">{client.businessName}</p>
          </div>
          <div>
            <p className={labelClass}>Template</p>
            <p className="mt-1.5 text-sm text-foreground">{templateDisplayName}</p>
            <p className="mt-1 text-xs text-muted">
              V1 includes one template. Restaurant and Salon templates are not
              available yet.
            </p>
            {state?.fieldErrors?.templateId ? (
              <p className="mt-1 text-sm text-rose-700">
                {state.fieldErrors.templateId}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>
              Internal website name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={defaultWebsiteName(client.businessName)}
              className={inputClass}
            />
            {state?.fieldErrors?.name ? (
              <p className="mt-1 text-sm text-rose-700">{state.fieldErrors.name}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f6ef0] disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create Website"}
        </button>
        <Link
          href={`/clients/${client.id}`}
          className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
