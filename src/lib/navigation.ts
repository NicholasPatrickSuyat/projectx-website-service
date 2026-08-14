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
    description: "Website Service operations overview",
  },
  {
    href: "/clients",
    label: "Clients",
    description: "Client businesses, models, and plans",
  },
  {
    href: "/websites",
    label: "Websites",
    description: "Saved website drafts and internal status",
  },
  {
    href: "/templates",
    label: "Templates",
    description: "Reusable website templates",
  },
  {
    href: "/support-requests",
    label: "Support Requests",
    description: "Update requests by support priority",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Internal tool settings",
  },
];

export function isActiveNavItem(pathname: string, href: NavHref): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.find((item) => isActiveNavItem(pathname, item.href));
  return match ?? NAV_ITEMS[0]!;
}
