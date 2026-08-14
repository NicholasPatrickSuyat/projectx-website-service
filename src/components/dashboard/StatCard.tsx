import type { DashboardStat } from "@/lib/demo-data";

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">{stat.label}</h2>
        <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Demo
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {stat.value}
      </p>
      <p className="mt-1 text-sm text-muted">{stat.detail}</p>
    </article>
  );
}
