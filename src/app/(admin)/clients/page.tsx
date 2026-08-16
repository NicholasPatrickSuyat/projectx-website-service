import type { Metadata } from "next";
import Link from "next/link";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import { parseClientListFilters } from "@/lib/clients/filters";
import { listClients } from "@/lib/clients/repository";
import {
  formatPrimaryContact,
  formatTimestamp,
} from "@/lib/clients/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseClientListFilters(params);
  const clients = await listClients(filters);
  const hasActiveFilters = Boolean(
    filters.query ||
      filters.status ||
      filters.category ||
      filters.serviceModel ||
      filters.plan,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Clients
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Manage client businesses, service models, plans, and contact
            information.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f6ef0]"
        >
          New Client
        </Link>
      </div>

      <Panel className="p-4 sm:p-5">
        <ClientsFilters filters={filters} />
      </Panel>

      {clients.length === 0 ? (
        <Panel className="px-6 py-12 text-center">
          <p className="text-base font-medium text-foreground">
            {hasActiveFilters ? "No matching clients." : "No clients yet."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {hasActiveFilters
              ? "Try a different search or clear the current filters."
              : "Create the first client to start managing Website Service work."}
          </p>
          <Link
            href={hasActiveFilters ? "/clients" : "/clients/new"}
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            {hasActiveFilters ? "Clear filters" : "New Client"}
          </Link>
        </Panel>
      ) : (
        <Panel>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <caption className="sr-only">Client records</caption>
              <thead className="bg-background text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Business Name
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Model
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Plan
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Primary Contact
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-border">
                    <th scope="row" className="px-5 py-3.5 font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-foreground hover:text-accent"
                      >
                        {client.businessName}
                      </Link>
                    </th>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="clientCategory" value={client.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="serviceModel" value={client.serviceModel} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="plan" value={client.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="clientStatus" value={client.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {formatPrimaryContact(client)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatTimestamp(client.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {clients.map((client) => (
              <li key={client.id} className="px-5 py-4">
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium text-foreground hover:text-accent"
                >
                  {client.businessName}
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge kind="clientStatus" value={client.status} />
                  <StatusBadge kind="serviceModel" value={client.serviceModel} />
                  <StatusBadge kind="plan" value={client.plan} />
                </div>
                <p className="mt-3 text-sm text-muted">
                  {formatPrimaryContact(client)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Updated {formatTimestamp(client.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
