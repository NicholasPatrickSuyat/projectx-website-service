/**
 * Milestone 1 demo/placeholder data.
 * Replace this module when a real data source is added in a later milestone.
 * These values are not connected to clients, Stripe, or any database.
 */
export const DEMO_DATA_NOTICE = "Demo data — not connected to a live source";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export const DEMO_DASHBOARD_STATS: DashboardStat[] = [
  {
    id: "clients",
    label: "Clients",
    value: "12",
    detail: "Placeholder client count",
  },
  {
    id: "managed-websites",
    label: "Managed Websites",
    value: "8",
    detail: "Model B placeholder count",
  },
  {
    id: "client-owned-projects",
    label: "Client-Owned Projects",
    value: "4",
    detail: "Model A placeholder count",
  },
  {
    id: "active-subscriptions",
    label: "Active Subscriptions",
    value: "8",
    detail: "Placeholder subscription count",
  },
  {
    id: "websites-building",
    label: "Websites Building",
    value: "3",
    detail: "Placeholder in-progress count",
  },
  {
    id: "support-requests",
    label: "Support Requests",
    value: "2",
    detail: "Placeholder open request count",
  },
];
