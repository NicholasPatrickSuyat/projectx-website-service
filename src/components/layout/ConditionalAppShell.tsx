"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export function ConditionalAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandaloneWebsite =
    /^\/templates\/[^/]+\/preview\/?$/.test(pathname) ||
    /^\/site\/[^/]+\/?$/.test(pathname) ||
    /^\/review\/[^/]+\/?$/.test(pathname);

  if (isStandaloneWebsite) {
    return children;
  }

  return <AppShell>{children}</AppShell>;
}
