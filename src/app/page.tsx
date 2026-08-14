import { StatCard } from "@/components/dashboard/StatCard";
import {
  DEMO_DASHBOARD_STATS,
  DEMO_DATA_NOTICE,
} from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Internal Project X Tool
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          Website operations overview
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
          Use this private admin workspace to build and manage client websites
          from reusable templates. Figures below are placeholders for Milestone
          1 and will be replaced when live data is connected.
        </p>
      </section>

      <section aria-labelledby="dashboard-stats-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2
            id="dashboard-stats-heading"
            className="text-sm font-semibold text-foreground"
          >
            Snapshot
          </h2>
          <p className="text-xs text-muted">{DEMO_DATA_NOTICE}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEMO_DASHBOARD_STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>
    </div>
  );
}
