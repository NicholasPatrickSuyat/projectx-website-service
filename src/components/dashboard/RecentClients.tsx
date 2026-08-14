import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import {
  DEMO_CLIENTS,
  DEMO_RECENT_CLIENTS,
} from "@/lib/demo-data";

export function RecentClients() {
  return (
    <Panel>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recent Clients
          </h2>
          <p className="mt-1 text-xs text-muted">
            Showing {DEMO_RECENT_CLIENTS.length} of {DEMO_CLIENTS.length} demo
            clients
          </p>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">
            Recent demo clients with model, plan, category, and website status
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
                Website Status
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_RECENT_CLIENTS.map((client) => (
              <tr key={client.id} className="border-t border-border">
                <th
                  scope="row"
                  className="px-5 py-3.5 font-medium text-foreground"
                >
                  {client.businessName}
                </th>
                <td className="px-5 py-3.5">
                  <StatusBadge kind="model" value={client.model} />
                </td>
                <td className="px-5 py-3.5 text-foreground">{client.plan}</td>
                <td className="px-5 py-3.5 text-muted">{client.category}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge kind="website" value={client.websiteStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {DEMO_RECENT_CLIENTS.map((client) => (
          <li key={client.id} className="px-5 py-4">
            <p className="font-medium text-foreground">{client.businessName}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Model</dt>
                <dd className="mt-1">
                  <StatusBadge kind="model" value={client.model} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Plan</dt>
                <dd className="mt-1 text-foreground">{client.plan}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Category</dt>
                <dd className="mt-1 text-foreground">{client.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Website Status</dt>
                <dd className="mt-1">
                  <StatusBadge kind="website" value={client.websiteStatus} />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
