import {
  CLIENT_CATEGORIES,
  CLIENT_PLANS,
  CLIENT_SERVICE_MODELS,
  CLIENT_STATUSES,
  type ClientCategory,
  type ClientPlan,
  type ClientServiceModel,
  type ClientStatus,
} from "@/lib/domain";
import type { ClientListFilters } from "@/lib/clients/types";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isOneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): value is T {
  return Boolean(value && allowed.includes(value as T));
}

export function parseClientListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ClientListFilters {
  const query = firstParam(searchParams.q)?.trim();
  const status = firstParam(searchParams.status);
  const category = firstParam(searchParams.category);
  const serviceModel = firstParam(searchParams.model);
  const plan = firstParam(searchParams.plan);

  return {
    query: query || undefined,
    status: isOneOf(status, CLIENT_STATUSES)
      ? (status as ClientStatus)
      : undefined,
    category: isOneOf(category, CLIENT_CATEGORIES)
      ? (category as ClientCategory)
      : undefined,
    serviceModel: isOneOf(serviceModel, CLIENT_SERVICE_MODELS)
      ? (serviceModel as ClientServiceModel)
      : undefined,
    plan: isOneOf(plan, CLIENT_PLANS) ? (plan as ClientPlan) : undefined,
  };
}
