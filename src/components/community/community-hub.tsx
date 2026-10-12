"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Lock, MessagesSquare, PenLine } from "lucide-react";
import type { Community } from "@/lib/types";
import { isDistributable } from "@/lib/feed/rank";
import { useAllPosts, useHydrated, useViewer } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { formatCompact } from "@/i18n/format";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";
import { PostCard } from "@/components/post/post-card";
import { TopicIcon } from "@/components/topic/topic-icon";
import { TopicChip } from "@/components/topic/topic-chip";
import { JoinButton } from "./communities-view";

/** A community hub = discussions from its topics, built on the main post system. */
export function CommunityHub({ community }: { community: Community }) {
  const { m, locale, pick, href, fmt } = useI18n();
  const hydrated = useHydrated();
  const viewer = useViewer(locale);
  const posts = useAllPosts();

  const discussions = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            p.topics.some((t) => community.topics.includes(t)) &&
            isDistributable(p, viewer) &&
            p.moderation.status === "published",
        )
        .sort((a, b) => {
          // Discussions first (questions, experiences), then newest.
          const d = (x: typeof a) => (x.type === "question" || x.type === "experience" ? 1 : 0);
          return d(b) - d(a) || +new Date(b.createdAt) - +new Date(a.createdAt);
        }),
    [posts, community.topics, viewer],
  );

  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-4 sm:px-5">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-secondary">
            <TopicIcon name={community.icon} className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight">{pick(community.name)}</h1>
            <p className="mt-1 text-[0.95rem] text-muted">{pick(community.description)}</p>
            <p className="mt-1 text-sm text-muted">
              {fmt(m.communities.members, { n: formatCompact(community.members, locale) })}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <JoinButton slug={community.slug} name={pick(community.name)} />
          <Link
            href={href(`/create?topic=${community.topics[0]}&type=question`)}
            className="inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-primary-strong hover:bg-accent-soft"
          >
            <PenLine className="size-4" aria-hidden />
            {m.communities.start}
          </Link>
        </div>
        <div className="mt-3 -ms-2.5 flex flex-wrap">
          {community.topics.map((t) => (
            <TopicChip key={t} slug={t} />
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Lock className="size-3.5" aria-hidden />
          {m.communities.intro}
        </p>
      </header>

      <h2 className="px-4 pt-4 text-sm font-semibold text-muted sm:px-5">{m.communities.discussions}</h2>
      {!hydrated ? (
        <FeedSkeleton label={m.common.loading} />
      ) : discussions.length ? (
        discussions.map((p) => <PostCard key={p.id} post={p} />)
      ) : (
        <EmptyState icon={<MessagesSquare className="size-6" />} title={m.communities.empty} />
      )}
    </div>
  );
}
