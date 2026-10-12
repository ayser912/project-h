"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { Sparkles, UsersRound, Inbox } from "lucide-react";
import { topics } from "@/lib/data/topics";
import { followingFeed, rankForYou, isRecommendable } from "@/lib/feed/rank";
import { useAllPosts, useDemoState, useHydrated, useViewer } from "@/lib/store/demo-store";
import { useNow } from "@/lib/hooks/use-now";
import { useI18n } from "@/i18n/provider";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { SelectChip } from "@/components/topic/topic-chip";
import { PostCard } from "@/components/post/post-card";
import { ClipsRail } from "./clips-rail";

type FeedKind = "for-you" | "following";
const PAGE = 8;

export function HomeFeed() {
  const { m, locale, pick, href } = useI18n();
  const hydrated = useHydrated();
  const state = useDemoState();
  const viewer = useViewer(locale);
  const posts = useAllPosts();
  const [kind, setKind] = useState<FeedKind>("for-you");
  const [topic, setTopic] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  // Topic filter: the person's own interests first, then the rest.
  const filterTopics = useMemo(() => {
    const mine = new Set([...state.interests, ...state.followsTopics]);
    return [...topics].sort((a, b) => Number(mine.has(b.slug)) - Number(mine.has(a.slug))).slice(0, 10);
  }, [state.interests, state.followsTopics]);

  const now = useNow();
  const ranked = useMemo(() => {
    if (now === null) return [];
    const list =
      kind === "for-you"
        ? rankForYou(posts, viewer, now)
        : followingFeed(posts, viewer).map((post) => ({ post, reasons: undefined, score: 0 }));
    return topic ? list.filter((r) => r.post.topics.includes(topic)) : list;
  }, [kind, posts, viewer, topic, now]);

  const clips = useMemo(
    () => posts.filter((p) => p.media.some((x) => x.kind === "video") && isRecommendable(p, viewer)).slice(0, 8),
    [posts, viewer],
  );

  const visible = ranked.slice(0, limit);

  return (
    <div>
      <div className="sticky top-14 z-10 bg-surface/95 backdrop-blur lg:top-0">
        <Tabs
          idBase="home"
          label={m.feed.feedTabs}
          value={kind}
          onChange={(v) => {
            setKind(v);
            setLimit(PAGE);
          }}
          items={[
            { value: "for-you", label: m.feed.forYou },
            { value: "following", label: m.feed.following },
          ]}
        />
      </div>

      <div
        role="group"
        aria-label={m.feed.topicFilter}
        className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line px-4 py-3 sm:px-5"
      >
        <SelectChip selected={topic === null} onClick={() => setTopic(null)}>
          {m.feed.allTopics}
        </SelectChip>
        {filterTopics.map((t) => (
          <SelectChip key={t.slug} selected={topic === t.slug} onClick={() => setTopic(topic === t.slug ? null : t.slug)}>
            {pick(t.name)}
          </SelectChip>
        ))}
      </div>

      <TabPanel idBase="home" value={kind}>
        {!hydrated ? (
          <FeedSkeleton label={m.common.loading} />
        ) : (
          <>
            {kind === "for-you" && !state.onboarded && state.interests.length === 0 && (
              <div className="m-4 flex items-start gap-3 rounded-[var(--radius-sheet)] bg-accent-soft p-4 sm:mx-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
                  <Sparkles className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{m.feed.interestsTitle}</p>
                  <p className="mt-0.5 text-sm text-muted">{m.feed.interestsBody}</p>
                  <Link
                    href={href("/onboarding")}
                    className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-strong"
                  >
                    {m.feed.interestsCta}
                  </Link>
                </div>
              </div>
            )}

            {visible.length === 0 ? (
              kind === "following" && !topic ? (
                <EmptyState
                  icon={<UsersRound className="size-6" />}
                  title={m.feed.emptyFollowingTitle}
                  body={m.feed.emptyFollowingBody}
                  action={
                    <Link
                      href={href("/explore")}
                      className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-white hover:bg-primary-strong"
                    >
                      {m.feed.emptyFollowingCta}
                    </Link>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Inbox className="size-6" />}
                  title={m.feed.emptyFilterTitle}
                  body={m.feed.emptyFilterBody}
                  action={
                    <Link
                      href={href(`/create${topic ? `?topic=${topic}` : ""}`)}
                      className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-white hover:bg-primary-strong"
                    >
                      {m.nav.create}
                    </Link>
                  }
                />
              )
            ) : (
              <div>
                {visible.map((r, i) => (
                  <Fragment key={r.post.id}>
                    <PostCard post={r.post} reasons={kind === "for-you" ? r.reasons : undefined} />
                    {kind === "for-you" && !topic && i === 1 && <ClipsRail posts={clips} />}
                  </Fragment>
                ))}
                {ranked.length > limit ? (
                  <div className="flex justify-center py-6">
                    <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
                      {m.post.seeMore}
                    </Button>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted">{m.feed.end}</p>
                )}
              </div>
            )}
          </>
        )}
      </TabPanel>
    </div>
  );
}
