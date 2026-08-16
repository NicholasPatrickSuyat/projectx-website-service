import type { ReactNode } from "react";
import { ConditionalAppShell } from "@/components/layout/ConditionalAppShell";
import { requireAdminPage } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return <ConditionalAppShell>{children}</ConditionalAppShell>;
}
