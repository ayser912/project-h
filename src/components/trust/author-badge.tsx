"use client";

import { BadgeCheck, Building2, IdCard } from "lucide-react";
import type { Profile } from "@/lib/types";
import { authorAttributes } from "@/lib/trust/attributes";
import { useI18n } from "@/i18n/provider";
import { useOverlay } from "@/components/overlay/overlay-provider";

/**
 * Compact verification mark next to an author's name. It is a button: tapping
 * it opens the credential record with scope and date (Journey D, step 3).
 * Public accounts get no mark at all.
 */
export function AuthorBadge({ profile }: { profile: Profile }) {
  const { m } = useI18n();
  const { open } = useOverlay();
  const attrs = authorAttributes(profile);

  let Icon = IdCard;
  let color = "var(--ph-org)";
  let label: string = m.trust.author.identity_verified;
  if (attrs.includes("organization_verified")) {
    Icon = Building2;
    label = m.trust.author.organization_verified;
  } else if (attrs.includes("credential_verified")) {
    Icon = BadgeCheck;
    color = "var(--ph-credential)";
    label = m.trust.author.credential_verified;
  } else if (!attrs.includes("identity_verified")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open({ kind: "credential", profileId: profile.id });
      }}
      className="-m-1.5 inline-flex size-8 items-center justify-center rounded-full hover:bg-surface-2"
      aria-label={`${label}. ${m.trust.viewCredentials}`}
      title={label}
    >
      <Icon className="size-[1.15rem]" style={{ color }} aria-hidden strokeWidth={2.25} />
    </button>
  );
}

/** One-line description under the name: specialty, organisation or account type. */
export function useAuthorCategory(profile: Profile): string {
  const { m, pick } = useI18n();
  if (profile.organization) return m.credential.orgKinds[profile.organization.kind];
  if (profile.credential) {
    const sep = pick({ ar: "، ", en: ", " });
    const title = profile.credential.title ? pick(profile.credential.title) : m.credential.professions[profile.credential.profession];
    return `${title}${sep}${pick(profile.credential.specialty)}`;
  }
  return m.profile.accountTypes[profile.accountType];
}
