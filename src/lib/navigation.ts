export type NavHref =
  | "/"
  | "/clients"
  | "/websites"
  | "/templates"
  | "/support-requests"
  | "/settings";

export type NavItem = {
  href: NavHref;
  label: string;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    description: "Overview of website operations",
  },
  {
    href: "/clients",
    label: "Clients",
    description: "Client records and assignments",
  },
  {
    href: "/websites",
    label: "Websites",
    description: "Client websites and build status",
  },
  {
    href: "/templates",
    label: "Templates",
    description: "Reusable website templates",
  },
  {
    href: "/support-requests",
    label: "Support Requests",
    description: "Incoming support and plan priority",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Internal application settings",
  },
];

export function getActiveNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.find((item) => {
    if (item.href === "/") {
      return pathname === "/";
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  return match ?? NAV_ITEMS[0]!;
}
