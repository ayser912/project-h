"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import type { Post } from "@/lib/types";
import { actions, useDisplayCounts } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { formatCompact } from "@/i18n/format";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";

export async function sharePost(url: string, title: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ url, title });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function PostActions({ post, variant = "feed" }: { post: Post; variant?: "feed" | "overlay" }) {
  const { m, locale, href, fmt } = useI18n();
  const toast = useToast();
  const { liked, saved, likes, comments } = useDisplayCounts(post);
  const [pop, setPop] = useState(0);
  const onDark = variant === "overlay";

  const base = cn(
    "inline-flex h-11 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors",
    onDark ? "text-white hover:bg-white/15" : "text-muted hover:bg-surface-2 hover:text-ink",
  );

  return (
    <div className={cn("flex items-center", onDark ? "flex-col gap-1" : "-ms-2.5 justify-between")}>
      <div className={cn("flex items-center", onDark ? "flex-col gap-1" : "gap-1")}>
        <button
          type="button"
          aria-pressed={liked}
          aria-label={`${liked ? m.post.unlike : m.post.like}, ${fmt(likes === 1 ? m.post.likesCountOne : m.post.likesCount, { n: likes })}`}
          onClick={() => {
            actions.toggleLike(post.id);
            if (!liked) setPop((p) => p + 1);
          }}
          className={cn(base, liked && !onDark && "text-like hover:text-like")}
        >
          <Heart
            key={pop}
            className={cn("size-5", pop > 0 && liked && "anim-pop")}
            fill={liked ? "var(--ph-like)" : "none"}
            stroke={liked ? "var(--ph-like)" : "currentColor"}
            aria-hidden
          />
          <span aria-hidden>{formatCompact(likes, locale)}</span>
        </button>

        <Link
          href={href(`/post/${post.id}#comments`)}
          aria-label={`${m.post.comment}, ${fmt(comments === 1 ? m.post.commentsCountOne : m.post.commentsCount, { n: comments })}`}
          className={base}
        >
          <MessageCircle className="size-5" aria-hidden />
          <span aria-hidden>{formatCompact(comments, locale)}</span>
        </Link>

        <button
          type="button"
          aria-label={m.post.share}
          onClick={async () => {
            const url = `${window.location.origin}${href(`/post/${post.id}`)}`;
            const result = await sharePost(url, post.content.slice(0, 80));
            if (result === "copied") toast(m.post.linkCopied);
          }}
          className={base}
        >
          <Share2 className="size-5" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? m.post.unsave : m.post.save}
        onClick={() => actions.toggleSave(post.id)}
        className={cn(base, saved && !onDark && "text-primary hover:text-primary")}
      >
        <Bookmark className="size-5" fill={saved ? "currentColor" : "none"} aria-hidden />
      </button>
    </div>
  );
}
