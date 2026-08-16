"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MenuIcon } from "@/components/icons";
import { getActiveNavItem } from "@/lib/navigation";

type HeaderProps = {
  menuOpen: boolean;
  onMenuClick: () => void;
};

export function Header({ menuOpen, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const current = getActiveNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-background hover:text-foreground lg:hidden"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="primary-sidebar"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {current.label}
            </h1>
            <p className="hidden truncate text-xs text-muted sm:block">
              {current.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted sm:px-3 sm:text-xs">
            <span className="sm:hidden">Internal</span>
            <span className="hidden sm:inline">Internal Project X Tool</span>
          </span>
          <LogoutButton />
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-white"
            aria-label="Admin"
            title="Admin"
          >
            A
          </span>
        </div>
      </div>
    </header>
  );
}
