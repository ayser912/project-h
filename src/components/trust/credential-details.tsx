"use client";

import type { Profile } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { formatDate } from "@/i18n/format";
import { authorAttributes } from "@/lib/trust/attributes";
import { AttributeTag } from "./attribute-style";
import { FlaskConical } from "lucide-react";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[minmax(7rem,38%)_1fr] gap-3 py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

/**
 * Full credential / organisation verification record (Journey D).
 * Used in the credential dialog and on professional profiles.
 */
export function CredentialDetails({ profile }: { profile: Profile }) {
  const { m, locale, pick } = useI18n();
  const c = profile.credential;
  const o = profile.organization;
  const attrs = authorAttributes(profile);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {attrs.map((a) => (
          <AttributeTag key={a} attr={a} label={m.trust.author[a]} size="md" />
        ))}
        {attrs.length === 0 && <p className="text-sm text-muted">{m.trust.publicUser}</p>}
      </div>

      {c && (
        <dl className="mt-3 divide-y divide-line">
          <Row label={m.credential.profession} value={c.title ? pick(c.title) : m.credential.professions[c.profession]} />
          <Row label={m.credential.specialty} value={pick(c.specialty)} />
          <Row label={m.credential.authority} value={pick(c.licensingAuthority)} />
          <Row label={m.credential.registration} value={c.registrationRef} />
          <Row label={m.credential.country} value={m.countries[c.country as keyof typeof m.countries] ?? c.country} />
          <Row label={m.credential.verifiedOn} value={formatDate(c.verifiedAt, locale)} />
          <Row label={m.credential.validUntil} value={c.expiresAt ? formatDate(c.expiresAt, locale) : undefined} />
          <Row label={m.credential.status} value={m.credential.statuses[c.status]} />
        </dl>
      )}
      {o && (
        <dl className="mt-3 divide-y divide-line">
          <Row label={m.credential.orgKind} value={m.credential.orgKinds[o.kind]} />
          <Row label={m.credential.verifiedOn} value={formatDate(o.verifiedAt, locale)} />
        </dl>
      )}

      {(c || o) && (
        <div className="mt-3 rounded-2xl bg-surface-2 p-4">
          <p className="text-sm font-semibold">{m.credential.scope}</p>
          <p className="mt-1 text-sm text-muted">{pick((c ?? o)!.scope)}</p>
        </div>
      )}

      {profile.isDemo && (
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-pending-bg p-3 text-sm text-pending">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
          {m.credential.demoNote}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">{m.credential.howItWorks}</p>
    </div>
  );
}
