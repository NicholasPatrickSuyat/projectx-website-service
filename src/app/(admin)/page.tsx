import { BillingOverview } from "@/components/dashboard/BillingOverview";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { StatCard } from "@/components/dashboard/StatCard";
import { SupportOverview } from "@/components/dashboard/SupportOverview";
import { WebsiteStatusOverview } from "@/components/dashboard/WebsiteStatusOverview";
import { Panel } from "@/components/ui/Panel";
import { countClients } from "@/lib/clients/repository";
import {
  DEMO_DASHBOARD_STATS,
  DEMO_DATA_NOTICE,
} from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalClients = await countClients();
  const liveClientStat = {
    id: "clients",
    label: "Total Clients",
    value: String(totalClients),
    detail: "Saved client records",
  };
  const demoStats = DEMO_DASHBOARD_STATS.filter((stat) => stat.id !== "clients");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Panel className="p-6 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Internal Project X Tool
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          Website Service dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
          Client totals and recent clients use saved records. Website, support,
          and billing figures remain demo placeholders until those systems are
          built.
        </p>
      </Panel>

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
          <StatCard stat={liveClientStat} source="live" />
          {demoStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RecentClients />
        </div>
        <div className="xl:col-span-2">
          <WebsiteStatusOverview />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SupportOverview />
        <BillingOverview />
      </div>
    </div>
  );
}
