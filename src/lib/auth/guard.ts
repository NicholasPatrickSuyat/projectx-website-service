import "server-only";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_ERROR } from "@/lib/auth/constants";
import {
  getVerifiedAdminSession,
  type AdminSession,
} from "@/lib/auth/session";

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getVerifiedAdminSession();
  if (!session) {
    throw new Error(ADMIN_AUTH_ERROR);
  }
  return session;
}

export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getVerifiedAdminSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getAdminActionError(): Promise<string | null> {
  const session = await getVerifiedAdminSession();
  return session ? null : ADMIN_AUTH_ERROR;
}
