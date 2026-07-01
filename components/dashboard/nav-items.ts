import type { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  ArrowDownLeft01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";

export type IconType = Parameters<typeof HugeiconsIcon>[0]["icon"];

export type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  /** Active-state predicate. Defaults to startsWith(href). */
  match?: (path: string) => boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home01Icon, match: (p) => p === "/dashboard" },
  { label: "Deposit", href: "/deposit", icon: ArrowDownLeft01Icon },
  { label: "Pay a player", href: "/payout", icon: SentIcon },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return item.match ? item.match(pathname) : pathname.startsWith(item.href);
}
