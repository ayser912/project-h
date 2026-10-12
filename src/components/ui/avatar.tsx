import type { Profile } from "@/lib/types";
import { cn } from "./cn";

const sizes = {
  xs: "size-7 text-xs",
  sm: "size-10 text-sm",
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
  xl: "size-24 text-3xl",
};

function initials(name: string): string {
  const cleaned = name.replace(/^(د\.|dr\.?)\s*/i, "").replace(/[()]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

/**
 * Generated avatar (initials on a tinted field) until photo uploads arrive in
 * phase 2. Organisations get a rounded square so they read differently from
 * people at a glance.
 */
export function Avatar({
  profile,
  size = "sm",
  className,
}: {
  profile: Pick<Profile, "displayName" | "avatarHue" | "accountType">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const h = profile.avatarHue;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-semibold",
        profile.accountType === "organization" ? "rounded-[28%]" : "rounded-full",
        sizes[size],
        className,
      )}
      style={{
        background: `hsl(${h} 45% 88%)`,
        color: `hsl(${h} 55% 24%)`,
      }}
    >
      {initials(profile.displayName)}
    </span>
  );
}
