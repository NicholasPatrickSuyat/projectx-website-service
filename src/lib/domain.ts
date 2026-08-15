export const CLIENT_CATEGORIES = [
  "SERVICE_BUSINESS",
  "RESTAURANT_FOOD",
  "SALON_BEAUTY",
] as const;
export type ClientCategory = (typeof CLIENT_CATEGORIES)[number];

export const CLIENT_SERVICE_MODELS = ["MODEL_A", "MODEL_B"] as const;
export type ClientServiceModel = (typeof CLIENT_SERVICE_MODELS)[number];

export const CLIENT_PLANS = ["STARTER", "BUSINESS", "PLUS"] as const;
export type ClientPlan = (typeof CLIENT_PLANS)[number];

export const CLIENT_STATUSES = ["LEAD", "ACTIVE", "INACTIVE"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const CLIENT_CATEGORY_LABELS: Record<ClientCategory, string> = {
  SERVICE_BUSINESS: "Service Business",
  RESTAURANT_FOOD: "Restaurant / Food",
  SALON_BEAUTY: "Salon / Beauty",
};

export const CLIENT_SERVICE_MODEL_LABELS: Record<ClientServiceModel, string> = {
  MODEL_A: "Model A — Client-Owned Website",
  MODEL_B: "Model B — Project X Managed Website",
};

export const CLIENT_SERVICE_MODEL_SHORT_LABELS: Record<
  ClientServiceModel,
  string
> = {
  MODEL_A: "Model A",
  MODEL_B: "Model B",
};

export const CLIENT_PLAN_LABELS: Record<ClientPlan, string> = {
  STARTER: "Starter",
  BUSINESS: "Business",
  PLUS: "Plus",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const WEBSITE_RECORD_STATUSES = [
  "DRAFT",
  "READY_FOR_APPROVAL",
  "READY_TO_PUBLISH",
  "PUBLISHED",
] as const;
export type WebsiteRecordStatus = (typeof WEBSITE_RECORD_STATUSES)[number];

export const WEBSITE_RECORD_STATUS_LABELS: Record<WebsiteRecordStatus, string> =
  {
    DRAFT: "Draft",
    READY_FOR_APPROVAL: "Ready for approval",
    READY_TO_PUBLISH: "Ready to publish",
    PUBLISHED: "Published",
  };

export function getWebsiteStatusTransitions(
  status: WebsiteRecordStatus,
): WebsiteRecordStatus[] {
  if (status === "DRAFT") {
    return ["READY_FOR_APPROVAL"];
  }

  if (status === "READY_FOR_APPROVAL") {
    return ["DRAFT", "READY_TO_PUBLISH"];
  }

  if (status === "READY_TO_PUBLISH") {
    return ["READY_FOR_APPROVAL", "DRAFT"];
  }

  return [];
}

export function canPublishWebsite(status: WebsiteRecordStatus): boolean {
  return status === "READY_TO_PUBLISH";
}

export function getWebsiteStatusAfterChangedSave(
  status: WebsiteRecordStatus,
): WebsiteRecordStatus {
  if (
    status === "PUBLISHED" ||
    status === "READY_TO_PUBLISH" ||
    status === "READY_FOR_APPROVAL"
  ) {
    return "DRAFT";
  }

  return status;
}

/** Domain constants for display only. Not stored on Client records. */
export const MODEL_A_ONE_TIME_PRICES: Record<ClientPlan, number> = {
  STARTER: 899,
  BUSINESS: 1699,
  PLUS: 2750,
};

export const MODEL_A_MAINTENANCE_MONTHLY = 59;

export const MODEL_B_MONTHLY_PRICES: Record<ClientPlan, number> = {
  STARTER: 79,
  BUSINESS: 119,
  PLUS: 179,
};

export const MODEL_B_UPDATE_MINUTES: Record<ClientPlan, number> = {
  STARTER: 30,
  BUSINESS: 60,
  PLUS: 120,
};

export const SUPPORT_PRIORITY_BY_PLAN = {
  STARTER: "Standard",
  BUSINESS: "Priority",
  PLUS: "Highest Priority",
} as const;

export type SupportPriorityByPlan =
  (typeof SUPPORT_PRIORITY_BY_PLAN)[ClientPlan];

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getServiceTermsSummary(
  serviceModel: ClientServiceModel,
  plan: ClientPlan,
): string {
  if (serviceModel === "MODEL_A") {
    return `${CLIENT_PLAN_LABELS[plan]} ${formatUsd(MODEL_A_ONE_TIME_PRICES[plan])} one-time · optional maintenance ${formatUsd(MODEL_A_MAINTENANCE_MONTHLY)}/month`;
  }

  return `${CLIENT_PLAN_LABELS[plan]} ${formatUsd(MODEL_B_MONTHLY_PRICES[plan])}/month · ${MODEL_B_UPDATE_MINUTES[plan]} minutes/month · ${SUPPORT_PRIORITY_BY_PLAN[plan]} support`;
}
