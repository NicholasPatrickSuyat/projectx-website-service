"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export function ConditionalAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isTemplatePreview = /^\/templates\/[^/]+\/preview\/?$/.test(pathname);

  if (isTemplatePreview) {
    return children;
  }

  return <AppShell>{children}</AppShell>;
}
