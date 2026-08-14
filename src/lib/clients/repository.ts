import { getDb } from "@/lib/db";
import {
  mapClientRow,
  type Client,
  type ClientInput,
  type ClientListFilters,
  type ClientRow,
} from "@/lib/clients/types";

const CLIENT_COLUMNS = `
  id,
  business_name,
  category,
  service_model,
  plan,
  status,
  contact_first_name,
  contact_last_name,
  email,
  phone,
  address_line1,
  city,
  state,
  postal_code,
  internal_notes,
  created_at,
  updated_at
`;

export async function listClients(
  filters: ClientListFilters = {},
): Promise<Client[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.query) {
    const like = `%${filters.query}%`;
    clauses.push(`(
      business_name LIKE ? OR
      IFNULL(contact_first_name, '') LIKE ? OR
      IFNULL(contact_last_name, '') LIKE ? OR
      TRIM(IFNULL(contact_first_name, '') || ' ' || IFNULL(contact_last_name, '')) LIKE ? OR
      IFNULL(email, '') LIKE ? OR
      IFNULL(phone, '') LIKE ?
    )`);
    params.push(like, like, like, like, like, like);
  }

  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }

  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }

  if (filters.serviceModel) {
    clauses.push("service_model = ?");
    params.push(filters.serviceModel);
  }

  if (filters.plan) {
    clauses.push("plan = ?");
    params.push(filters.plan);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await db
    .prepare(
      `SELECT ${CLIENT_COLUMNS} FROM clients ${where} ORDER BY updated_at DESC, business_name COLLATE NOCASE ASC`,
    )
    .bind(...params)
    .all<ClientRow>();

  return (result.results ?? []).map(mapClientRow);
}

export async function countClients(): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT COUNT(*) AS total FROM clients")
    .first<{ total: number }>();

  return row?.total ?? 0;
}

export async function getClientById(id: string): Promise<Client | null> {
  if (!id) {
    return null;
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT ${CLIENT_COLUMNS} FROM clients WHERE id = ?`)
    .bind(id)
    .first<ClientRow>();

  return row ? mapClientRow(row) : null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO clients (
        id,
        business_name,
        category,
        service_model,
        plan,
        status,
        contact_first_name,
        contact_last_name,
        email,
        phone,
        address_line1,
        city,
        state,
        postal_code,
        internal_notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.businessName,
      input.category,
      input.serviceModel,
      input.plan,
      input.status,
      input.contactFirstName,
      input.contactLastName,
      input.email,
      input.phone,
      input.addressLine1,
      input.city,
      input.state,
      input.postalCode,
      input.internalNotes,
      now,
      now,
    )
    .run();

  const created = await getClientById(id);

  if (!created) {
    throw new Error("Client was created but could not be loaded.");
  }

  return created;
}

export async function updateClient(
  id: string,
  input: ClientInput,
): Promise<Client | null> {
  const existing = await getClientById(id);

  if (!existing) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE clients SET
        business_name = ?,
        category = ?,
        service_model = ?,
        plan = ?,
        status = ?,
        contact_first_name = ?,
        contact_last_name = ?,
        email = ?,
        phone = ?,
        address_line1 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        internal_notes = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .bind(
      input.businessName,
      input.category,
      input.serviceModel,
      input.plan,
      input.status,
      input.contactFirstName,
      input.contactLastName,
      input.email,
      input.phone,
      input.addressLine1,
      input.city,
      input.state,
      input.postalCode,
      input.internalNotes,
      now,
      id,
    )
    .run();

  return getClientById(id);
}

export async function setClientStatus(
  id: string,
  status: Client["status"],
): Promise<Client | null> {
  const existing = await getClientById(id);

  if (!existing) {
    return null;
  }

  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .prepare("UPDATE clients SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now, id)
    .run();

  return getClientById(id);
}
