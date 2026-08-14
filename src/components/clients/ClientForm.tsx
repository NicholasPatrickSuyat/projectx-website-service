"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Client } from "@/lib/clients/types";
import type { ClientActionState } from "@/lib/clients/actions";
import {
  CLIENT_CATEGORIES,
  CLIENT_CATEGORY_LABELS,
  CLIENT_PLAN_LABELS,
  CLIENT_PLANS,
  CLIENT_SERVICE_MODEL_LABELS,
  CLIENT_SERVICE_MODELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUSES,
} from "@/lib/domain";

type ClientFormProps = {
  action: (
    state: ClientActionState,
    formData: FormData,
  ) => Promise<ClientActionState>;
  client?: Client;
  cancelHref: string;
  submitLabel: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-rose-700">{message}</p>;
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-colors placeholder:text-muted";
const labelClass = "block text-sm font-medium text-foreground";

export function ClientForm({
  action,
  client,
  cancelHref,
  submitLabel,
}: ClientFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

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

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Business</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="businessName" className={labelClass}>
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              defaultValue={client?.businessName ?? ""}
              className={inputClass}
              autoComplete="organization"
            />
            <FieldError message={state?.fieldErrors?.businessName} />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={client?.category ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select category
              </option>
              {CLIENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CLIENT_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            <FieldError message={state?.fieldErrors?.category} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Service</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="serviceModel" className={labelClass}>
              Service model
            </label>
            <select
              id="serviceModel"
              name="serviceModel"
              required
              defaultValue={client?.serviceModel ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select model
              </option>
              {CLIENT_SERVICE_MODELS.map((value) => (
                <option key={value} value={value}>
                  {CLIENT_SERVICE_MODEL_LABELS[value]}
                </option>
              ))}
            </select>
            <FieldError message={state?.fieldErrors?.serviceModel} />
          </div>
          <div>
            <label htmlFor="plan" className={labelClass}>
              Plan
            </label>
            <select
              id="plan"
              name="plan"
              required
              defaultValue={client?.plan ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select plan
              </option>
              {CLIENT_PLANS.map((value) => (
                <option key={value} value={value}>
                  {CLIENT_PLAN_LABELS[value]}
                </option>
              ))}
            </select>
            <FieldError message={state?.fieldErrors?.plan} />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={client?.status ?? "LEAD"}
              className={inputClass}
            >
              {CLIENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {CLIENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <FieldError message={state?.fieldErrors?.status} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactFirstName" className={labelClass}>
              First name
            </label>
            <input
              id="contactFirstName"
              name="contactFirstName"
              defaultValue={client?.contactFirstName ?? ""}
              className={inputClass}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label htmlFor="contactLastName" className={labelClass}>
              Last name
            </label>
            <input
              id="contactLastName"
              name="contactLastName"
              defaultValue={client?.contactLastName ?? ""}
              className={inputClass}
              autoComplete="family-name"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ""}
              className={inputClass}
              autoComplete="email"
            />
            <FieldError message={state?.fieldErrors?.email} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={client?.phone ?? ""}
              className={inputClass}
              autoComplete="tel"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Address</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="addressLine1" className={labelClass}>
              Street address
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              defaultValue={client?.addressLine1 ?? ""}
              className={inputClass}
              autoComplete="address-line1"
            />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              name="city"
              defaultValue={client?.city ?? ""}
              className={inputClass}
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <input
              id="state"
              name="state"
              defaultValue={client?.state ?? ""}
              className={inputClass}
              autoComplete="address-level1"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className={labelClass}>
              ZIP / Postal code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              defaultValue={client?.postalCode ?? ""}
              className={inputClass}
              autoComplete="postal-code"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Internal notes</h2>
        <div className="mt-4">
          <label htmlFor="internalNotes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={4}
            defaultValue={client?.internalNotes ?? ""}
            className={`${inputClass} resize-y`}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f6ef0] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
