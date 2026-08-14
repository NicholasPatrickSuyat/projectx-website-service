import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import {
  DEMO_OPEN_SUPPORT_REQUESTS,
  DEMO_SUPPORT_COUNTS,
  MODEL_B_UPDATE_MINUTES,
  SUPPORT_PRIORITIES,
} from "@/lib/demo-data";

export function SupportOverview() {
  return (
    <Panel className="h-full">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Support Overview
        </h2>
        <p className="mt-1 text-xs text-muted">
          {DEMO_OPEN_SUPPORT_REQUESTS} open demo requests grouped by plan
          priority
        </p>
      </div>
      <ul className="divide-y divide-border">
        {SUPPORT_PRIORITIES.map((priority) => {
          const count = DEMO_SUPPORT_COUNTS[priority];
          const percent =
            DEMO_OPEN_SUPPORT_REQUESTS === 0
              ? 0
              : Math.round((count / DEMO_OPEN_SUPPORT_REQUESTS) * 100);

          return (
            <li key={priority} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge kind="priority" value={priority} />
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {count}
                </span>
              </div>
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="sr-only">
                {count} {priority} requests, {percent} percent of open demo
                requests
              </p>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-border px-5 py-3 text-xs leading-5 text-muted">
        Model B monthly update allowances: Starter{" "}
        {MODEL_B_UPDATE_MINUTES.Starter} min · Business{" "}
        {MODEL_B_UPDATE_MINUTES.Business} min · Plus{" "}
        {MODEL_B_UPDATE_MINUTES.Plus} min
      </p>
    </Panel>
  );
}
