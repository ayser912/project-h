"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Clapperboard } from "lucide-react";
import { ME_ID } from "@/lib/data/demo/profiles";
import { isRecommendable } from "@/lib/feed/rank";
import { useAllPosts, useHydrated, useProfileResolver, useViewer } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { AuthorBadge, useAuthorCategory } from "@/components/trust/author-badge";
import { TrustStrip } from "@/components/trust/trust-strip";
import { PostActions } from "@/components/post/post-actions";
import { FollowButton } from "@/components/profile/follow-button";
import { VideoSurface } from "./video-surface";
import type { Post, Profile } from "@/lib/types";

function Slide({ post, author }: { post: Post; author: Profile }) {
  const { href, m } = useI18n();
  const category = useAuthorCategory(author);
  const video = post.media.find((x) => x.kind === "video");
  const [expanded, setExpanded] = useState(false);
  if (!video) return null;
  const to = author.id === ME_ID ? href("/profile") : href(`/u/${author.username}`);
  return (
    <section
      aria-label={post.content.slice(0, 80)}
      className="relative flex h-dvh w-full items-center justify-center bg-black"
      data-post-id={post.id}
    >
      <VideoSurface media={video} autoPlayInView fit="contain" controlsAt="top" className="h-full w-full max-w-[min(100vw,calc(100dvh*9/16))] bg-black" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-24">
        <div className="pointer-events-auto mx-auto flex max-w-[min(100vw,calc(100dvh*9/16+8rem))] items-end gap-3 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1 text-white">
            <div className="flex items-center gap-2">
              <Link href={to} className="flex min-w-0 items-center gap-2">
                <Avatar profile={author} size="sm" />
                <span className="truncate font-semibold" dir="auto">
                  {author.displayName}
                </span>
              </Link>
              <span className="rounded-full bg-white/90">
                <AuthorBadge profile={author} />
              </span>
              {author.id !== ME_ID && <FollowButton profileId={author.id} name={author.displayName} className="ms-1 h-8 min-w-0 px-3" />}
            </div>
            <p className="mt-0.5 text-xs text-white/80">{category}</p>
            <p
              className={`post-text mt-2 text-sm ${expanded ? "" : "line-clamp-2"}`}
              dir="auto"
              lang={post.language}
              onClick={() => setExpanded((e) => !e)}
            >
              {post.content}
            </p>
            <div className="mt-2 rounded-2xl bg-white/95 px-2 text-ink">
              <TrustStrip post={post} />
            </div>
            <Link href={href(`/post/${post.id}#comments`)} className="mt-2 inline-block text-xs font-medium text-white/85 underline-offset-2 hover:underline">
              {m.comments.title}
            </Link>
          </div>
          <div className="shrink-0 pb-16">
            <PostActions post={post} variant="overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Vertical, snap-scrolling short-video viewer. Arrow keys move between clips. */
export function ClipsViewer() {
  const { m, locale, href, dir, fmt } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const start = params?.get("start");
  const hydrated = useHydrated();
  const viewer = useViewer(locale);
  const posts = useAllPosts();
  const resolve = useProfileResolver(m.common.you);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const clips = useMemo(() => {
    const list = posts.filter((p) => p.media.some((x) => x.kind === "video") && isRecommendable(p, viewer));
    if (!start) return list;
    const i = list.findIndex((p) => p.id === start);
    return i > 0 ? [...list.slice(i), ...list.slice(0, i)] : list;
  }, [posts, viewer, start]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hydrated]);

  const go = (delta: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ top: delta * el.clientHeight, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select,dialog")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 bg-black text-white">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent px-2 pt-[env(safe-area-inset-top)] pb-6">
        <IconButton
          label={m.common.back}
          className="text-white hover:bg-white/15 hover:text-white"
          onClick={() => (history.length > 1 ? router.back() : router.push(href("/")))}
        >
          <Back className="size-5" />
        </IconButton>
        <h1 className="flex items-center gap-2 font-semibold">
          <Clapperboard className="size-5" aria-hidden />
          {m.video.viewerTitle}
        </h1>
        <span className="flex-1" />
        {clips.length > 0 && (
          <p className="pe-3 text-sm text-white/80" aria-live="polite">
            {fmt(m.video.progress, { i: Math.min(index + 1, clips.length), n: clips.length })}
          </p>
        )}
      </header>

      {!hydrated ? null : clips.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState title={m.video.empty} className="text-white" />
        </div>
      ) : (
        <div ref={scroller} className="snap-feed no-scrollbar h-full overflow-y-auto">
          {clips.map((p) => {
            const author = resolve(p.authorId);
            return author ? <Slide key={p.id} post={p} author={author} /> : null;
          })}
        </div>
      )}

      {clips.length > 1 && (
        <div className="absolute end-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          <IconButton label={m.video.prev} onClick={() => go(-1)} className="bg-white/10 text-white hover:bg-white/20 hover:text-white">
            <ChevronUp className="size-5" />
          </IconButton>
          <IconButton label={m.video.next} onClick={() => go(1)} className="bg-white/10 text-white hover:bg-white/20 hover:text-white">
            <ChevronDown className="size-5" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
