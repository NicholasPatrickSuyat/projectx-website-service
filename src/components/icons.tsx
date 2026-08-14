import type { ComponentType, ReactNode } from "react";
import type { NavHref } from "@/lib/navigation";

type IconProps = {
  className?: string;
};

function BaseIcon({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </BaseIcon>
  );
}

export function ClientsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M4.5 18.5c.6-2.6 2.4-4 4.5-4s3.9 1.4 4.5 4" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M15 18.5c.4-1.8 1.6-3 3.2-3.3" />
    </BaseIcon>
  );
}

export function WebsitesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9h17" />
      <circle cx="6.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.7" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function TemplatesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="10" height="16" rx="1.5" />
      <path d="M14 8h6v11.5a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M6.5 8h5M6.5 11h5M6.5 14h3.5" />
    </BaseIcon>
  );
}

export function SupportIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 18.5 6 20.5V16c-1.7-1.2-3-3.1-3-5.5C3 6.9 6.6 4 12 4s9 2.9 9 6.5-3.6 6.5-9 6.5c-1 0-2-.1-2.9-.4L8 18.5Z" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1.6M12 17.9v1.6M19.5 12h-1.6M6.1 12H4.5M17.3 6.7l-1.1 1.1M7.8 16.2l-1.1 1.1M17.3 17.3l-1.1-1.1M7.8 7.8 6.7 6.7" />
    </BaseIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </BaseIcon>
  );
}

export const NAV_ICONS: Record<NavHref, ComponentType<{ className?: string }>> = {
  "/": DashboardIcon,
  "/clients": ClientsIcon,
  "/websites": WebsitesIcon,
  "/templates": TemplatesIcon,
  "/support-requests": SupportIcon,
  "/settings": SettingsIcon,
};
