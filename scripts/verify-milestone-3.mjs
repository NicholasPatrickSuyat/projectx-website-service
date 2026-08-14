import { getPlatformProxy } from "wrangler";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const platform = await getPlatformProxy({
  persist: true,
  remoteBindings: false,
});
const db = platform.env.DB;

const suffix = Date.now();
const idA = crypto.randomUUID();
const idB = crypto.randomUUID();
const now = new Date().toISOString();

await db
  .prepare(
    `INSERT INTO clients (
      id, business_name, category, service_model, plan, status,
      contact_first_name, contact_last_name, email, phone,
      address_line1, city, state, postal_code, internal_notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  .bind(
    idA,
    `Verify Heating ${suffix}`,
    "SERVICE_BUSINESS",
    "MODEL_A",
    "STARTER",
    "LEAD",
    "Jordan",
    "Lee",
    "jordan@verify-heating.example",
    "555-0199",
    "10 Oak St",
    "Tempe",
    "AZ",
    "85281",
    "Verification record",
    now,
    now,
  )
  .run();

await db
  .prepare(
    `INSERT INTO clients (
      id, business_name, category, service_model, plan, status,
      contact_first_name, contact_last_name, email, phone,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  .bind(
    idB,
    `Verify Salon ${suffix}`,
    "SALON_BEAUTY",
    "MODEL_B",
    "BUSINESS",
    "ACTIVE",
    "Sam",
    "Patel",
    "sam@verify-salon.example",
    "555-0177",
    now,
    now,
  )
  .run();

const loadedA = await db
  .prepare("SELECT * FROM clients WHERE id = ?")
  .bind(idA)
  .first();
assert(loadedA?.business_name === `Verify Heating ${suffix}`, "create Model A failed");

const loadedB = await db
  .prepare("SELECT * FROM clients WHERE id = ?")
  .bind(idB)
  .first();
assert(loadedB?.service_model === "MODEL_B", "create Model B failed");

const searchName = await db
  .prepare("SELECT COUNT(*) AS total FROM clients WHERE business_name LIKE ?")
  .bind(`%Verify Heating ${suffix}%`)
  .first();
assert(searchName?.total === 1, "search business name failed");

const searchEmail = await db
  .prepare("SELECT COUNT(*) AS total FROM clients WHERE email LIKE ?")
  .bind("%jordan@verify-heating.example%")
  .first();
assert(searchEmail?.total === 1, "search email failed");

const searchPhone = await db
  .prepare("SELECT COUNT(*) AS total FROM clients WHERE phone LIKE ?")
  .bind("%555-0199%")
  .first();
assert(searchPhone?.total === 1, "search phone failed");

const searchContact = await db
  .prepare(
    "SELECT COUNT(*) AS total FROM clients WHERE contact_first_name LIKE ?",
  )
  .bind("%Jordan%")
  .first();
assert(searchContact?.total >= 1, "search contact failed");

const filtered = await db
  .prepare(
    "SELECT COUNT(*) AS total FROM clients WHERE status = ? AND category = ? AND service_model = ? AND plan = ?",
  )
  .bind("ACTIVE", "SALON_BEAUTY", "MODEL_B", "BUSINESS")
  .first();
assert(filtered?.total >= 1, "filter combination failed");

const later = new Date(Date.now() + 1000).toISOString();
await db
  .prepare(
    "UPDATE clients SET plan = ?, status = ?, updated_at = ? WHERE id = ?",
  )
  .bind("PLUS", "ACTIVE", later, idA)
  .run();
const updated = await db
  .prepare("SELECT plan, status, updated_at FROM clients WHERE id = ?")
  .bind(idA)
  .first();
assert(updated?.plan === "PLUS", "plan update failed");
assert(updated?.updated_at !== now, "updatedAt did not change");

await db
  .prepare("UPDATE clients SET status = ?, updated_at = ? WHERE id = ?")
  .bind("INACTIVE", new Date().toISOString(), idA)
  .run();
const inactive = await db
  .prepare("SELECT status FROM clients WHERE id = ?")
  .bind(idA)
  .first();
assert(inactive?.status === "INACTIVE", "inactivate failed");

const inactiveFilter = await db
  .prepare("SELECT COUNT(*) AS total FROM clients WHERE id = ? AND status = ?")
  .bind(idA, "INACTIVE")
  .first();
assert(inactiveFilter?.total === 1, "filter inactive failed");

await db
  .prepare("UPDATE clients SET status = ? WHERE id = ?")
  .bind("ACTIVE", idA)
  .run();
const reactivated = await db
  .prepare("SELECT status FROM clients WHERE id = ?")
  .bind(idA)
  .first();
assert(reactivated?.status === "ACTIVE", "reactivate failed");

let invalidEnumRejected = false;
try {
  await db
    .prepare(
      "INSERT INTO clients (id, business_name, category, service_model, plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      "Bad Enum",
      "CRM_WON",
      "MODEL_A",
      "STARTER",
      "LEAD",
      now,
      now,
    )
    .run();
} catch {
  invalidEnumRejected = true;
}
assert(invalidEnumRejected, "invalid enum was not rejected");

const missing = await db
  .prepare("SELECT id FROM clients WHERE id = ?")
  .bind("not-a-real-client-id")
  .first();
assert(!missing, "unknown id should not return a row");

await platform.dispose();
const platformAgain = await getPlatformProxy({
  persist: true,
  remoteBindings: false,
});
const persisted = await platformAgain.env.DB.prepare(
  "SELECT business_name FROM clients WHERE id = ?",
)
  .bind(idA)
  .first();
assert(
  persisted?.business_name === `Verify Heating ${suffix}`,
  "record did not persist across D1 proxy restart",
);
await platformAgain.env.DB.prepare("DELETE FROM clients WHERE id IN (?, ?)")
  .bind(idA, idB)
  .run();
await platformAgain.dispose();

const CATEGORIES = ["SERVICE_BUSINESS", "RESTAURANT_FOOD", "SALON_BEAUTY"];
const MODELS = ["MODEL_A", "MODEL_B"];
const PLANS = ["STARTER", "BUSINESS", "PLUS"];
const STATUSES = ["LEAD", "ACTIVE", "INACTIVE"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(formData) {
  const businessName = String(formData.get("businessName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const serviceModel = String(formData.get("serviceModel") ?? "").trim();
  const plan = String(formData.get("plan") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const fieldErrors = {};
  if (!businessName) fieldErrors.businessName = "required";
  if (!CATEGORIES.includes(category)) fieldErrors.category = "invalid";
  if (!MODELS.includes(serviceModel)) fieldErrors.serviceModel = "invalid";
  if (!PLANS.includes(plan)) fieldErrors.plan = "invalid";
  if (!STATUSES.includes(status)) fieldErrors.status = "invalid";
  if (email && !EMAIL_PATTERN.test(email)) fieldErrors.email = "invalid";
  return Object.keys(fieldErrors).length === 0
    ? { ok: true }
    : { ok: false, fieldErrors };
}

assert(validate(new FormData()).ok === false, "required-field validation should fail");
assert(validate(new FormData()).fieldErrors.businessName, "business name required");

const invalidEmail = new FormData();
invalidEmail.set("businessName", "Test Co");
invalidEmail.set("category", "SERVICE_BUSINESS");
invalidEmail.set("serviceModel", "MODEL_A");
invalidEmail.set("plan", "STARTER");
invalidEmail.set("status", "LEAD");
invalidEmail.set("email", "not-an-email");
assert(validate(invalidEmail).ok === false, "invalid email should fail");
assert(validate(invalidEmail).fieldErrors.email, "email field error missing");

const invalidEnumForm = new FormData();
invalidEnumForm.set("businessName", "Test Co");
invalidEnumForm.set("category", "WON");
invalidEnumForm.set("serviceModel", "MODEL_A");
invalidEnumForm.set("plan", "STARTER");
invalidEnumForm.set("status", "LEAD");
assert(validate(invalidEnumForm).ok === false, "invalid enum form should fail");

const valid = new FormData();
valid.set("businessName", "Valid Co");
valid.set("category", "SERVICE_BUSINESS");
valid.set("serviceModel", "MODEL_B");
valid.set("plan", "BUSINESS");
valid.set("status", "ACTIVE");
assert(validate(valid).ok === true, "valid payload should pass");

console.log("Milestone 3 database/validation checks passed");
