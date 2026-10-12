"use client";

import { Flag, FlaskConical, Info } from "lucide-react";
import type { Post, Profile } from "@/lib/types";
import { authorAttributes, postAttributes, validReview } from "@/lib/trust/attributes";
import { useI18n } from "@/i18n/provider";
import { formatDate } from "@/i18n/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AttributeTag } from "./attribute-style";
import { SourceList } from "./source-list";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-4 first:border-t-0 first:pt-1">
      <h3 className="mb-2.5 text-sm font-semibold text-muted">{title}</h3>
      {children}
    </section>
  );
}

/** "About this post": every transparency fact, explained, in one place (spec §8.3). */
export function TransparencyPanel({
  post,
  author,
  onViewCredentials,
  onReport,
}: {
  post: Post;
  author: Profile;
  onViewCredentials: () => void;
  onReport: () => void;
}) {
  const { m, locale, pick } = useI18n();
  const aAttrs = authorAttributes(author);
  const pAttrs = postAttributes(post);
  const review = validReview(post);

  return (
    <div>
      <Section title={m.trust.whoPosted}>
        <div className="flex items-center gap-3">
          <Avatar profile={author} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{author.displayName}</p>
            <p className="text-sm text-muted" dir="ltr">
              @{author.username}
            </p>
          </div>
        </div>
        <ul className="mt-3 space-y-2.5">
          {aAttrs.length === 0 && <li className="text-sm text-muted">{m.trust.publicUser}</li>}
          {aAttrs.map((a) => (
            <li key={a} className="flex flex-col items-start gap-1">
              <AttributeTag attr={a} label={m.trust.author[a]} size="md" />
              <p className="text-sm text-muted">{m.trust.explain[a]}</p>
            </li>
          ))}
        </ul>
        {(author.credential || author.organization) && (
          <Button variant="quiet" size="sm" className="mt-3" onClick={onViewCredentials}>
            {m.trust.viewCredentials}
          </Button>
        )}
      </Section>

      <Section title={m.trust.thisPost}>
        <ul className="space-y-2.5">
          {pAttrs.map((a) => (
            <li key={a} className="flex flex-col items-start gap-1">
              <AttributeTag attr={a} label={m.trust.post[a]} size="md" />
              <p className="text-sm text-muted">{m.trust.explain[a]}</p>
            </li>
          ))}
        </ul>
        {post.sponsor && (
          <p className="mt-2 text-sm">{m.post.sponsoredBy.replace("{partner}", post.sponsor.partner)}</p>
        )}
      </Section>

      <Section title={m.trust.sources}>
        <SourceList sources={post.sources} />
      </Section>

      <Section title={m.trust.review}>
        {review ? (
          <div className="rounded-2xl p-4" style={{ background: "var(--ph-reviewed-bg)" }}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">{m.trust.reviewer}</dt>
              <dd className="font-medium">{pick(review.reviewerRole)}</dd>
              <dt className="text-muted">{m.trust.reviewedOn}</dt>
              <dd className="font-medium">{formatDate(review.reviewedAt, locale)}</dd>
              <dt className="text-muted">{m.credential.status}</dt>
              <dd className="font-medium">{m.trust.outcome[review.outcome]}</dd>
            </dl>
            <p className="mt-2 text-xs text-muted">
              {m.trust.reviewedVersion.replace("{v}", String(review.contentVersion))}
            </p>
            {review.isDemo && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-pending">
                <FlaskConical className="size-3.5" aria-hidden />
                {m.trust.demoReview}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">{m.trust.noReview}</p>
        )}
      </Section>

      <div className="mt-1 flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-xs text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>{m.trust.noScore}</p>
      </div>

      <Button variant="ghost" size="sm" className="mt-3 text-danger" onClick={onReport}>
        <Flag className="size-4" aria-hidden />
        {m.trust.reportThis}
      </Button>
    </div>
  );
}
