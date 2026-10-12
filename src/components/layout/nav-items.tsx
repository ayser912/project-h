"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  CircleUserRound,
  Clapperboard,
  Compass,
  House,
  Settings,
  SquarePlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Messages } from "@/i18n/messages";

export interface NavItem {
  key: keyof Messages["nav"];
  path: string;
  icon: LucideIcon;
}

/** The five primary destinations (spec §7). */
export const primaryNav: NavItem[] = [
  { key: "home", path: "/", icon: House },
  { key: "explore", path: "/explore", icon: Compass },
  { key: "create", path: "/create", icon: SquarePlus },
  { key: "communities", path: "/communities", icon: UsersRound },
  { key: "profile", path: "/profile", icon: CircleUserRound },
];

export const secondaryNav: NavItem[] = [
  { key: "clips", path: "/watch", icon: Clapperboard },
  { key: "notifications", path: "/notifications", icon: Bell },
  { key: "settings", path: "/settings", icon: Settings },
];

/** Is `path` (locale-less) the active section for the current URL? */
export function useIsActive() {
  const pathname = usePathname() ?? "/";
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return (path: string) => {
    if (path === "/") return rest === "/";
    if (path === "/explore") return rest.startsWith("/explore") || rest.startsWith("/topics");
    if (path === "/profile") return rest.startsWith("/profile");
    return rest === path || rest.startsWith(`${path}/`);
  };
}
