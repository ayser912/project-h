import {
  BadgeCheck,
  BookOpen,
  Building2,
  CircleDashed,
  Hourglass,
  IdCard,
  Megaphone,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { AuthorAttribute, PostAttribute } from "@/lib/trust/attributes";

/**
 * One icon and one colour family per attribute. Shape + text always carry
 * the meaning; colour is a secondary cue.
 */
export const attributeStyle: Record<
  AuthorAttribute | PostAttribute,
  { icon: LucideIcon; fg: string; bg: string }
> = {
  identity_verified: { icon: IdCard, fg: "var(--ph-org)", bg: "var(--ph-org-bg)" },
  credential_verified: { icon: BadgeCheck, fg: "var(--ph-credential)", bg: "var(--ph-credential-bg)" },
  credential_inactive: { icon: ShieldAlert, fg: "var(--ph-pending)", bg: "var(--ph-pending-bg)" },
  organization_verified: { icon: Building2, fg: "var(--ph-org)", bg: "var(--ph-org-bg)" },
  sources_provided: { icon: BookOpen, fg: "var(--ph-sources)", bg: "var(--ph-sources-bg)" },
  clinically_reviewed: { icon: ShieldCheck, fg: "var(--ph-reviewed)", bg: "var(--ph-reviewed-bg)" },
  not_reviewed: { icon: CircleDashed, fg: "var(--ph-unreviewed)", bg: "transparent" },
  under_review: { icon: Hourglass, fg: "var(--ph-pending)", bg: "var(--ph-pending-bg)" },
  personal_experience: { icon: UserRound, fg: "var(--ph-experience)", bg: "var(--ph-experience-bg)" },
  sponsored: { icon: Megaphone, fg: "var(--ph-sponsored)", bg: "var(--ph-sponsored-bg)" },
};

export function AttributeTag({
  attr,
  label,
  size = "sm",
}: {
  attr: AuthorAttribute | PostAttribute;
  label: string;
  size?: "sm" | "md";
}) {
  const s = attributeStyle[attr];
  const Icon = s.icon;
  const outlined = attr === "not_reviewed";
  return (
    <span
      className={
        size === "sm"
          ? "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.75rem] font-medium leading-5"
          : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium"
      }
      style={{
        color: s.fg,
        background: s.bg,
        boxShadow: outlined ? `inset 0 0 0 1px var(--ph-line-strong)` : undefined,
      }}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      {label}
    </span>
  );
}
