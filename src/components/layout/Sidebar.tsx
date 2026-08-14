"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, NAV_ICONS } from "@/components/icons";
import { NAV_ITEMS } from "@/lib/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-between gap-3 px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-semibold tracking-wide text-white">
              PX
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">
                Website Service
              </span>
              <span className="block truncate text-[11px] text-sidebar-muted">
                Project X
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-sidebar-muted">
            Internal Project X Tool
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 pb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.href];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-active font-medium text-white shadow-[inset_2px_0_0_0_var(--accent)]"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-sm font-medium text-white">Admin</p>
          <p className="mt-0.5 text-xs text-sidebar-muted">
            Single-admin access · V1
          </p>
        </div>
      </aside>
    </>
  );
}
