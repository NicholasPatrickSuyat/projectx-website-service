import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import { listClients } from "@/lib/clients/repository";
import { formatTimestamp } from "@/lib/clients/types";

export async function RecentClients() {
  const clients = (await listClients()).slice(0, 6);

  return (
    <Panel>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recent Clients
          </h2>
          <p className="mt-1 text-xs text-muted">
            Latest saved client records
          </p>
        </div>
        <Link href="/clients" className="text-xs font-medium text-accent">
          View all
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No clients yet.</p>
          <p className="mt-1 text-sm text-muted">
            Create a client to see them on the dashboard.
          </p>
          <Link
            href="/clients/new"
            className="mt-4 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            New Client
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">
                Recent clients with model, plan, category, and status
              </caption>
              <thead className="bg-background text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Business Name
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Model
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Plan
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
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
                      <StatusBadge
                        kind="serviceModel"
                        value={client.serviceModel}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="plan" value={client.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        kind="clientCategory"
                        value={client.category}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge kind="clientStatus" value={client.status} />
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
                  <StatusBadge
                    kind="serviceModel"
                    value={client.serviceModel}
                  />
                  <StatusBadge kind="plan" value={client.plan} />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Updated {formatTimestamp(client.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
