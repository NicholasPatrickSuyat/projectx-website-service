import {
  CLIENT_CATEGORIES,
  CLIENT_PLANS,
  CLIENT_SERVICE_MODELS,
  CLIENT_STATUSES,
  type ClientCategory,
  type ClientPlan,
  type ClientServiceModel,
  type ClientStatus,
} from "../domain";
import type { ClientInput } from "./types";

export type FieldErrors = Partial<Record<keyof ClientInput, string>>;

export type ValidationResult =
  | { ok: true; data: ClientInput }
  | { ok: false; error: string; fieldErrors: FieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValueIn<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return allowed.includes(value as T);
}

function readOptional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readRequired(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateClientInput(formData: FormData): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const businessName = readRequired(formData.get("businessName"));
  const category = readRequired(formData.get("category"));
  const serviceModel = readRequired(formData.get("serviceModel"));
  const plan = readRequired(formData.get("plan"));
  const status = readRequired(formData.get("status"));
  const email = readOptional(formData.get("email"));

  if (!businessName) {
    fieldErrors.businessName = "Business name is required.";
  }

  if (!isValueIn(category, CLIENT_CATEGORIES)) {
    fieldErrors.category = "Choose a valid category.";
  }

  if (!isValueIn(serviceModel, CLIENT_SERVICE_MODELS)) {
    fieldErrors.serviceModel = "Choose a valid service model.";
  }

  if (!isValueIn(plan, CLIENT_PLANS)) {
    fieldErrors.plan = "Choose a valid plan.";
  }

  if (!isValueIn(status, CLIENT_STATUSES)) {
    fieldErrors.status = "Choose a valid status.";
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      businessName,
      category: category as ClientCategory,
      serviceModel: serviceModel as ClientServiceModel,
      plan: plan as ClientPlan,
      status: status as ClientStatus,
      contactFirstName: readOptional(formData.get("contactFirstName")),
      contactLastName: readOptional(formData.get("contactLastName")),
      email,
      phone: readOptional(formData.get("phone")),
      addressLine1: readOptional(formData.get("addressLine1")),
      city: readOptional(formData.get("city")),
      state: readOptional(formData.get("state")),
      postalCode: readOptional(formData.get("postalCode")),
      internalNotes: readOptional(formData.get("internalNotes")),
    },
  };
}
