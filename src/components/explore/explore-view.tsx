"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SearchX } from "lucide-react";
import { topics } from "@/lib/data/topics";
import { seedProfiles, verifiedCreators, verifiedOrganizations } from "@/lib/data/repository";
import { isDistributable, isRecommendable } from "@/lib/feed/rank";
import { search } from "@/lib/search";
import { useAllPosts, useHydrated, useViewer } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { formatCompact } from "@/i18n/format";
import { SearchBox } from "@/components/layout/search-box";
import { TopicIcon } from "@/components/topic/topic-icon";
import { CreatorRow } from "@/components/profile/creator-row";
import { PostCard } from "@/components/post/post-card";
import { ClipsRail } from "@/components/feed/clips-rail";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";

export function ExploreView() {
  const { m, locale, pick, href, fmt } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const q = params?.get("q") ?? "";
  const hydrated = useHydrated();
  const viewer = useViewer(locale);
  const posts = useAllPosts();

  const results = useMemo(
    () =>
      q
        ? search(
            q,
            { posts, profiles: [...seedProfiles], topics },
            (p) => isDistributable(p, viewer) && p.moderation.status === "published",
          )
        : null,
    [q, posts, viewer],
  );

  const postCountByTopic = useMemo(() => {
    const map = new Map<string, number>();
    posts.filter((p) => p.moderation.status === "published").forEach((p) =>
      p.topics.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)),
    );
    return map;
  }, [posts]);

  const clips = posts.filter((p) => p.media.some((x) => x.kind === "video") && isRecommendable(p, viewer));
  const discussions = posts
    .filter((p) => p.type === "question" && isRecommendable(p, viewer))
    .slice(0, 3);

  return (
    <div>
      <div className="sticky top-14 z-10 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-5 lg:top-0">
        <h1 className="sr-only">{m.explore.title}</h1>
        <SearchBox
          key={q}
          initial={q}
          onSearch={(value) =>
            router.replace(href(`/explore${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`), {
              scroll: false,
            })
          }
        />
      </div>

      {results ? (
        <div aria-live="polite">
          {results.topics.length + results.profiles.length + results.posts.length === 0 && (
            <EmptyState icon={<SearchX className="size-6" />} title={fmt(m.explore.noResults, { q })} />
          )}
          {results.topics.length > 0 && (
            <section className="border-b border-line px-4 py-4 sm:px-5">
              <h2 className="mb-2 text-sm font-semibold text-muted">{m.explore.resultsTopics}</h2>
              <div className="flex flex-wrap gap-2">
                {results.topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={href(`/topics/${t.slug}`)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-soft px-4 text-sm font-medium text-secondary hover:bg-accent"
                  >
                    <TopicIcon name={t.icon} className="size-4" />
                    {pick(t.name)}
                  </Link>
                ))}
              </div>
            </section>
          )}
          {results.profiles.length > 0 && (
            <section className="border-b border-line px-4 py-3 sm:px-5">
              <h2 className="mb-1 text-sm font-semibold text-muted">{m.explore.resultsPeople}</h2>
              {results.profiles.filter((p) => !viewer.blockedUsers.has(p.id)).map((p) => (
                <CreatorRow key={p.id} profile={p} />
              ))}
            </section>
          )}
          {results.posts.length > 0 && (
            <section>
              <h2 className="px-4 pt-4 text-sm font-semibold text-muted sm:px-5">{m.explore.resultsPosts}</h2>
              {results.posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>
          )}
        </div>
      ) : (
        <>
          <section aria-labelledby="topics-title" className="border-b border-line px-4 py-5 sm:px-5">
            <h2 id="topics-title" className="mb-3 text-lg font-semibold">
              {m.explore.topics}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {topics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={href(`/topics/${t.slug}`)}
                    className="flex h-full items-center gap-3 rounded-2xl bg-surface-2 p-3 transition-colors hover:bg-accent-soft"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
                      <TopicIcon name={t.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5">{pick(t.name)}</span>
                      <span className="block text-xs text-muted">
                        {fmt(m.topic.postsCount, { n: formatCompact(postCountByTopic.get(t.slug) ?? 0, locale) })}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {hydrated ? <ClipsRail posts={clips} /> : null}

          <section id="creators" aria-labelledby="creators-title" className="scroll-mt-20 border-b border-line px-4 py-4 sm:px-5">
            <h2 id="creators-title" className="mb-1 text-lg font-semibold">
              {m.explore.creators}
            </h2>
            {verifiedCreators().map((c) => (
              <CreatorRow key={c.id} profile={c} />
            ))}
          </section>

          <section aria-labelledby="orgs-title" className="border-b border-line px-4 py-4 sm:px-5">
            <h2 id="orgs-title" className="mb-1 text-lg font-semibold">
              {m.explore.organizations}
            </h2>
            {verifiedOrganizations().map((c) => (
              <CreatorRow key={c.id} profile={c} />
            ))}
          </section>

          <section aria-labelledby="discussions-title">
            <h2 id="discussions-title" className="px-4 pt-5 text-lg font-semibold sm:px-5">
              {m.explore.trending}
            </h2>
            {hydrated ? discussions.map((p) => <PostCard key={p.id} post={p} />) : <FeedSkeleton label={m.common.loading} />}
          </section>
        </>
      )}
    </div>
  );
}
