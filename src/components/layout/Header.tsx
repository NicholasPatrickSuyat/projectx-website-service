"use client";

import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground lg:hidden"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
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
          <span className="hidden rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
            Internal Project X Tool
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-white">
            A
          </span>
        </div>
      </div>
    </header>
  );
}
