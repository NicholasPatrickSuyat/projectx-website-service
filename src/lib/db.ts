import "server-only";
import { getRequiredDatabaseBinding } from "@/lib/runtime/env";

export async function getDb() {
  return getRequiredDatabaseBinding();
}

export async function getDatabase() {
  return getDb();
}
