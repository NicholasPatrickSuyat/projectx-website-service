import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import {
  DEMO_CLIENTS,
  DEMO_WEBSITE_STATUS_COUNTS,
  WEBSITE_STATUSES,
} from "@/lib/demo-data";

export function WebsiteStatusOverview() {
  return (
    <Panel className="h-full">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Website Status Overview
        </h2>
        <p className="mt-1 text-xs text-muted">
          {DEMO_CLIENTS.length} demo websites across all statuses
        </p>
      </div>
      <ul className="divide-y divide-border">
        {WEBSITE_STATUSES.map((status) => (
          <li
            key={status}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <StatusBadge kind="website" value={status} />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {DEMO_WEBSITE_STATUS_COUNTS[status]}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
