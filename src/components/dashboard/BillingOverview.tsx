import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import {
  BILLING_STATUSES,
  DEMO_BILLING_COUNTS,
  DEMO_MODEL_B_MRR,
  formatDemoUsd,
} from "@/lib/demo-data";

export function BillingOverview() {
  return (
    <Panel className="h-full">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Billing / Subscription Overview
        </h2>
        <p className="mt-1 text-xs text-muted">
          Active Model B subscriptions only · not connected to Stripe
        </p>
      </div>
      <div className="px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Demo monthly recurring revenue
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {formatDemoUsd(DEMO_MODEL_B_MRR)}
          <span className="ml-1 text-sm font-medium text-muted">/ month</span>
        </p>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {BILLING_STATUSES.map((status) => (
          <li
            key={status}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <StatusBadge kind="billing" value={status} />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {DEMO_BILLING_COUNTS[status]}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
