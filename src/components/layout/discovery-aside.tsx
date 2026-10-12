"use client";

import Link from "next/link";
import { Siren } from "lucide-react";
import { verifiedCreators } from "@/lib/data/repository";
import { useAllPosts, useProfileResolver, useViewer } from "@/lib/store/demo-store";
import { isRecommendable } from "@/lib/feed/rank";
import { useI18n } from "@/i18n/provider";
import { formatCompact } from "@/i18n/format";
import { CreatorRow } from "@/components/profile/creator-row";
import { SearchBox } from "./search-box";

/** Desktop side panel: search, active discussions, professionals to follow. */
export function DiscoveryAside() {
  const { m, locale, href, fmt } = useI18n();
  const viewer = useViewer(locale);
  const posts = useAllPosts();
  const resolve = useProfileResolver(m.common.you);
  const discussions = posts
    .filter((p) => p.type === "question" && isRecommendable(p, viewer))
    .sort((a, b) => b.counts.comments + b.counts.saves / 10 - (a.counts.comments + a.counts.saves / 10))
    .slice(0, 3);
  const creators = verifiedCreators()
    .filter((c) => !viewer.blockedUsers.has(c.id))
    .slice(0, 3);

  return (
    <div className="space-y-5 py-4">
      <SearchBox />

      <section className="rounded-[var(--radius-sheet)] bg-surface p-4 ring-1 ring-line">
        <h2 className="mb-1 font-semibold">{m.explore.trending}</h2>
        <ul>
          {discussions.map((p) => (
            <li key={p.id}>
              <Link href={href(`/post/${p.id}`)} className="-mx-2 block rounded-xl px-2 py-2.5 hover:bg-surface-2">
                <p className="line-clamp-2 text-sm font-medium" dir="auto">
                  {p.content}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  <bdi>{resolve(p.authorId)?.displayName}</bdi>
                  <span className="mx-1.5" aria-hidden>
                    /
                  </span>
                  {fmt(p.counts.comments === 1 ? m.post.commentsCountOne : m.post.commentsCount, {
                    n: formatCompact(p.counts.comments, locale),
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-sheet)] bg-surface p-4 ring-1 ring-line">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">{m.explore.creators}</h2>
          <Link href={href("/explore#creators")} className="text-sm font-medium text-primary-strong hover:underline">
            {m.common.seeAll}
          </Link>
        </div>
        {creators.map((c) => (
          <CreatorRow key={c.id} profile={c} />
        ))}
      </section>

      <p className="flex items-start gap-2 px-2 text-xs leading-5 text-muted">
        <Siren className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
        {m.safety.emergency}
      </p>
      <p className="px-2 text-xs leading-5 text-muted">{m.safety.disclaimer}</p>
    </div>
  );
}
