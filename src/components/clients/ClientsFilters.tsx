import Link from "next/link";
import {
  CLIENT_CATEGORIES,
  CLIENT_CATEGORY_LABELS,
  CLIENT_PLAN_LABELS,
  CLIENT_PLANS,
  CLIENT_SERVICE_MODEL_SHORT_LABELS,
  CLIENT_SERVICE_MODELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUSES,
} from "@/lib/domain";
import type { ClientListFilters } from "@/lib/clients/types";

type ClientsFiltersProps = {
  filters: ClientListFilters;
};

const selectClass =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground";

export function ClientsFilters({ filters }: ClientsFiltersProps) {
  return (
    <form method="get" className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(0,9rem))_auto] lg:items-end">
      <div>
        <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-muted">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.query ?? ""}
          placeholder="Business, contact, email, phone"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-muted">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status ?? ""}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {CLIENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-muted">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={filters.category ?? ""}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {CLIENT_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="model" className="mb-1.5 block text-xs font-medium text-muted">
          Model
        </label>
        <select
          id="model"
          name="model"
          defaultValue={filters.serviceModel ?? ""}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {CLIENT_SERVICE_MODELS.map((value) => (
            <option key={value} value={value}>
              {CLIENT_SERVICE_MODEL_SHORT_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="plan" className="mb-1.5 block text-xs font-medium text-muted">
          Plan
        </label>
        <select
          id="plan"
          name="plan"
          defaultValue={filters.plan ?? ""}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {CLIENT_PLANS.map((value) => (
            <option key={value} value={value}>
              {CLIENT_PLAN_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2f6ef0]"
        >
          Apply
        </button>
        <Link
          href="/clients"
          className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
