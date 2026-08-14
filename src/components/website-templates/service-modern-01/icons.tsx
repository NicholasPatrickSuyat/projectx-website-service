import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function RepairIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Icon>
  );
}

export function HeatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4c0-2.5-4-6.5-4-8.5-1 2-4 6-4 8.5Z" />
      <path d="M6 18h12" />
    </Icon>
  );
}

export function InstallIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="8" width="17" height="11" rx="2" />
      <path d="M8 8V6.5A4 4 0 0 1 16 6.5V8" />
    </Icon>
  );
}

export function MaintainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1.5M12 18v1.5M19.5 12h-1.5M6 12H4.5M17.2 6.8l-1.1 1.1M7.9 16.1l-1.1 1.1M17.2 17.2l-1.1-1.1M7.9 7.9 6.8 6.8" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5 6.5v5.2c0 4 2.8 6.8 7 8.3 4.2-1.5 7-4.3 7-8.3V6.5L12 3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Icon>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4.5h10v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V4.5Z" />
      <path d="M9.5 9h5M9.5 12h5M9.5 15h3" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 10.5V19h11v-8.5" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4.5h3l1.5 3.5-2 1.5a12 12 0 0 0 5 5l1.5-2 3.5 1.5v3A1.5 1.5 0 0 1 18 18.5 14 14 0 0 1 5.5 6 1.5 1.5 0 0 1 7 4.5Z" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z" />
      <circle cx="12" cy="10.8" r="2.2" />
    </Icon>
  );
}

export const SERVICE_ICONS = {
  repair: RepairIcon,
  heat: HeatIcon,
  install: InstallIcon,
  maintain: MaintainIcon,
  air: InstallIcon,
} as const;

export const WHY_ICONS = {
  shield: ShieldIcon,
  clock: ClockIcon,
  receipt: ReceiptIcon,
  home: HomeIcon,
  phone: PhoneIcon,
} as const;
