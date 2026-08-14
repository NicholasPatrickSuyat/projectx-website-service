import type {
  ClientCategory,
  ClientPlan,
  ClientServiceModel,
  ClientStatus,
} from "../domain";

export type Client = {
  id: string;
  businessName: string;
  category: ClientCategory;
  serviceModel: ClientServiceModel;
  plan: ClientPlan;
  status: ClientStatus;
  contactFirstName: string | null;
  contactLastName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientInput = {
  businessName: string;
  category: ClientCategory;
  serviceModel: ClientServiceModel;
  plan: ClientPlan;
  status: ClientStatus;
  contactFirstName: string | null;
  contactLastName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  internalNotes: string | null;
};

export type ClientListFilters = {
  query?: string;
  status?: ClientStatus;
  category?: ClientCategory;
  serviceModel?: ClientServiceModel;
  plan?: ClientPlan;
};

export type ClientRow = {
  id: string;
  business_name: string;
  category: string;
  service_model: string;
  plan: string;
  status: string;
  contact_first_name: string | null;
  contact_last_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export function mapClientRow(row: ClientRow): Client {
  return {
    id: row.id,
    businessName: row.business_name,
    category: row.category as Client["category"],
    serviceModel: row.service_model as Client["serviceModel"],
    plan: row.plan as Client["plan"],
    status: row.status as Client["status"],
    contactFirstName: row.contact_first_name,
    contactLastName: row.contact_last_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    internalNotes: row.internal_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatPrimaryContact(client: Client): string {
  const name = [client.contactFirstName, client.contactLastName]
    .filter(Boolean)
    .join(" ");

  if (name) {
    return name;
  }

  return client.email ?? client.phone ?? "—";
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
