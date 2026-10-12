"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Lock, PenLine, Inbox } from "lucide-react";
import type { Topic } from "@/lib/types";
import { topicBySlug } from "@/lib/data/topics";
import { verifiedCreators, verifiedOrganizations } from "@/lib/data/repository";
import { isDistributable } from "@/lib/feed/rank";
import { actions, useAllPosts, useDemoState, useHydrated, useViewer } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";
import { PostCard } from "@/components/post/post-card";
import { CreatorRow } from "@/components/profile/creator-row";
import { TopicIcon } from "./topic-icon";

type Tab = "posts" | "videos" | "discussions" | "creators";

export function TopicView({ topic }: { topic: Topic }) {
  const { m, locale, pick, href } = useI18n();
  const hydrated = useHydrated();
  const state = useDemoState();
  const viewer = useViewer(locale);
  const posts = useAllPosts();
  const [tab, setTab] = useState<Tab>("posts");
  const following = state.followsTopics.includes(topic.slug);

  const topicPosts = useMemo(
    () =>
      posts
        .filter((p) => p.topics.includes(topic.slug) && isDistributable(p, viewer) && p.moderation.status === "published")
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [posts, topic.slug, viewer],
  );
  const authorsInTopic = new Set(topicPosts.map((p) => p.authorId));
  const creators = [...verifiedCreators(), ...verifiedOrganizations()].filter((c) => authorsInTopic.has(c.id));

  const list =
    tab === "videos"
      ? topicPosts.filter((p) => p.media.some((x) => x.kind === "video"))
      : tab === "discussions"
        ? topicPosts.filter((p) => p.type === "question" || p.type === "experience")
        : topicPosts;

  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-4 sm:px-5">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-secondary">
            <TopicIcon name={topic.icon} className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight">{pick(topic.name)}</h1>
            <p className="mt-1 text-[0.95rem] text-muted">{pick(topic.description)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={following ? "secondary" : "primary"}
            aria-pressed={following}
            onClick={() => actions.toggleFollowTopic(topic.slug)}
          >
            {following ? m.topic.following : m.topic.follow}
          </Button>
          <Link
            href={href(`/create?topic=${topic.slug}`)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 font-medium text-primary-strong hover:bg-accent-soft"
          >
            <PenLine className="size-4" aria-hidden />
            {m.nav.create}
          </Link>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Lock className="size-3.5" aria-hidden />
          {m.topic.privateFollow}
        </p>
      </header>

      <Tabs
        idBase="topic"
        label={pick(topic.name)}
        value={tab}
        onChange={setTab}
        items={[
          { value: "posts", label: m.topic.tabs.posts },
          { value: "videos", label: m.topic.tabs.videos },
          { value: "discussions", label: m.topic.tabs.discussions },
          { value: "creators", label: m.topic.tabs.creators },
        ]}
      />
      <TabPanel idBase="topic" value={tab}>
        {!hydrated ? (
          <FeedSkeleton label={m.common.loading} />
        ) : tab === "creators" ? (
          <div className="px-4 py-2 sm:px-5">
            {creators.length ? (
              creators.map((c) => <CreatorRow key={c.id} profile={c} />)
            ) : (
              <EmptyState title={m.topic.noCreators} />
            )}
          </div>
        ) : list.length ? (
          list.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title={m.feed.emptyFilterTitle}
            body={m.feed.emptyFilterBody}
          />
        )}
      </TabPanel>

      <section className="border-t border-line px-4 py-5 sm:px-5">
        <h2 className="mb-3 font-semibold">{m.topic.related}</h2>
        <div className="flex flex-wrap gap-2">
          {topic.related.map((slug) => {
            const r = topicBySlug.get(slug);
            if (!r) return null;
            return (
              <Link
                key={slug}
                href={href(`/topics/${slug}`)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-medium hover:bg-accent-soft"
              >
                <TopicIcon name={r.icon} className="size-4 text-primary" />
                {pick(r.name)}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
