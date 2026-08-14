/**
 * Milestone 2 demo/placeholder data.
 * Replace this module when a real data source is added in a later milestone.
 * These values are not connected to clients, Stripe, or any database.
 */

export const DEMO_DATA_NOTICE = "Demo data — not connected to a live source";

export const SERVICE_MODELS = ["A", "B"] as const;
export type ServiceModel = (typeof SERVICE_MODELS)[number];

export const PLANS = ["Starter", "Business", "Plus"] as const;
export type Plan = (typeof PLANS)[number];

export const CATEGORIES = [
  "Service Business",
  "Restaurant / Food",
  "Salon / Beauty",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const WEBSITE_STATUSES = [
  "Setup",
  "Building",
  "Awaiting Approval",
  "Ready to Publish",
  "Live",
  "Maintenance",
] as const;
export type WebsiteStatus = (typeof WEBSITE_STATUSES)[number];

export const SUPPORT_PRIORITIES = [
  "Highest Priority",
  "Priority",
  "Standard",
] as const;
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export const BILLING_STATUSES = [
  "Active",
  "Past Due",
  "Cancellation Scheduled",
] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

/** Domain constants for display only. Not a pricing engine. */
export const MODEL_A_ONE_TIME_PRICES = {
  Starter: 899,
  Business: 1699,
  Plus: 2750,
} as const;

export const MODEL_A_MAINTENANCE_MONTHLY = 59;

export const MODEL_B_MONTHLY_PRICES = {
  Starter: 79,
  Business: 119,
  Plus: 179,
} as const;

export const SUPPORT_PRIORITY_BY_PLAN: Record<Plan, SupportPriority> = {
  Starter: "Standard",
  Business: "Priority",
  Plus: "Highest Priority",
};

export const MODEL_B_UPDATE_MINUTES: Record<Plan, number> = {
  Starter: 30,
  Business: 60,
  Plus: 120,
};

export type DemoClient = {
  id: string;
  businessName: string;
  model: ServiceModel;
  plan: Plan;
  category: Category;
  websiteStatus: WebsiteStatus;
  billingStatus: BillingStatus | null;
  openSupportRequests: number;
};

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: "bella-salon",
    businessName: "Bella Salon",
    model: "B",
    plan: "Plus",
    category: "Salon / Beauty",
    websiteStatus: "Live",
    billingStatus: "Active",
    openSupportRequests: 1,
  },
  {
    id: "abc-heating",
    businessName: "ABC Heating",
    model: "B",
    plan: "Business",
    category: "Service Business",
    websiteStatus: "Building",
    billingStatus: "Active",
    openSupportRequests: 1,
  },
  {
    id: "tonys-bakery",
    businessName: "Tony's Bakery",
    model: "B",
    plan: "Starter",
    category: "Restaurant / Food",
    websiteStatus: "Awaiting Approval",
    billingStatus: "Active",
    openSupportRequests: 0,
  },
  {
    id: "ridgeview-plumbing",
    businessName: "Ridgeview Plumbing",
    model: "A",
    plan: "Business",
    category: "Service Business",
    websiteStatus: "Live",
    billingStatus: null,
    openSupportRequests: 0,
  },
  {
    id: "oak-iron-barbers",
    businessName: "Oak & Iron Barbers",
    model: "B",
    plan: "Plus",
    category: "Salon / Beauty",
    websiteStatus: "Live",
    billingStatus: "Past Due",
    openSupportRequests: 1,
  },
  {
    id: "mesa-auto-care",
    businessName: "Mesa Auto Care",
    model: "A",
    plan: "Starter",
    category: "Service Business",
    websiteStatus: "Ready to Publish",
    billingStatus: null,
    openSupportRequests: 0,
  },
  {
    id: "sunrise-cafe",
    businessName: "Sunrise Cafe",
    model: "B",
    plan: "Business",
    category: "Restaurant / Food",
    websiteStatus: "Setup",
    billingStatus: "Active",
    openSupportRequests: 0,
  },
  {
    id: "northside-electric",
    businessName: "Northside Electric",
    model: "B",
    plan: "Starter",
    category: "Service Business",
    websiteStatus: "Maintenance",
    billingStatus: "Cancellation Scheduled",
    openSupportRequests: 1,
  },
  {
    id: "glow-studio",
    businessName: "Glow Studio",
    model: "A",
    plan: "Plus",
    category: "Salon / Beauty",
    websiteStatus: "Building",
    billingStatus: null,
    openSupportRequests: 0,
  },
  {
    id: "harbor-grill",
    businessName: "Harbor Grill",
    model: "B",
    plan: "Plus",
    category: "Restaurant / Food",
    websiteStatus: "Live",
    billingStatus: "Active",
    openSupportRequests: 0,
  },
  {
    id: "peak-hvac",
    businessName: "Peak HVAC",
    model: "B",
    plan: "Business",
    category: "Service Business",
    websiteStatus: "Live",
    billingStatus: "Active",
    openSupportRequests: 1,
  },
  {
    id: "copper-leaf-salon",
    businessName: "Copper Leaf Salon",
    model: "A",
    plan: "Starter",
    category: "Salon / Beauty",
    websiteStatus: "Setup",
    billingStatus: null,
    openSupportRequests: 0,
  },
];

export const DEMO_RECENT_CLIENT_IDS = [
  "bella-salon",
  "abc-heating",
  "tonys-bakery",
  "ridgeview-plumbing",
  "oak-iron-barbers",
  "harbor-grill",
] as const;

export function getSupportPriority(plan: Plan): SupportPriority {
  return SUPPORT_PRIORITY_BY_PLAN[plan];
}

export function formatDemoUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const modelBClients = DEMO_CLIENTS.filter((client) => client.model === "B");
const modelAClients = DEMO_CLIENTS.filter((client) => client.model === "A");

export const DEMO_RECENT_CLIENTS: DemoClient[] = DEMO_RECENT_CLIENT_IDS.map(
  (id) => {
    const client = DEMO_CLIENTS.find((item) => item.id === id);
    if (!client) {
      throw new Error(`Missing demo client: ${id}`);
    }
    return client;
  },
);

export const DEMO_WEBSITE_STATUS_COUNTS: Record<WebsiteStatus, number> =
  WEBSITE_STATUSES.reduce(
    (counts, status) => {
      counts[status] = DEMO_CLIENTS.filter(
        (client) => client.websiteStatus === status,
      ).length;
      return counts;
    },
    {} as Record<WebsiteStatus, number>,
  );

export const DEMO_SUPPORT_COUNTS: Record<SupportPriority, number> =
  SUPPORT_PRIORITIES.reduce(
    (counts, priority) => {
      counts[priority] = DEMO_CLIENTS.filter(
        (client) =>
          client.openSupportRequests > 0 &&
          getSupportPriority(client.plan) === priority,
      ).reduce((sum, client) => sum + client.openSupportRequests, 0);
      return counts;
    },
    {} as Record<SupportPriority, number>,
  );

export const DEMO_BILLING_COUNTS: Record<BillingStatus, number> =
  BILLING_STATUSES.reduce(
    (counts, status) => {
      counts[status] = modelBClients.filter(
        (client) => client.billingStatus === status,
      ).length;
      return counts;
    },
    {} as Record<BillingStatus, number>,
  );

export const DEMO_MODEL_B_MRR = modelBClients
  .filter((client) => client.billingStatus === "Active")
  .reduce((sum, client) => sum + MODEL_B_MONTHLY_PRICES[client.plan], 0);

export const DEMO_OPEN_SUPPORT_REQUESTS = DEMO_CLIENTS.reduce(
  (sum, client) => sum + client.openSupportRequests,
  0,
);

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export const DEMO_DASHBOARD_STATS: DashboardStat[] = [
  {
    id: "clients",
    label: "Total Clients",
    value: String(DEMO_CLIENTS.length),
    detail: "All demo client businesses",
  },
  {
    id: "managed-websites",
    label: "Managed Websites",
    value: String(modelBClients.length),
    detail: "Model B managed websites",
  },
  {
    id: "client-owned-projects",
    label: "Client-Owned Projects",
    value: String(modelAClients.length),
    detail: "Model A client-owned websites",
  },
  {
    id: "active-subscriptions",
    label: "Active Subscriptions",
    value: String(DEMO_BILLING_COUNTS.Active),
    detail: "Model B subscriptions marked Active",
  },
  {
    id: "websites-building",
    label: "Websites Building",
    value: String(DEMO_WEBSITE_STATUS_COUNTS.Building),
    detail: "Currently in Building status",
  },
  {
    id: "support-requests",
    label: "Open Support Requests",
    value: String(DEMO_OPEN_SUPPORT_REQUESTS),
    detail: "Open demo requests by plan priority",
  },
];
