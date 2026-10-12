"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Ban,
  BookOpen,
  EyeOff,
  Flag,
  Hourglass,
  Info,
  Link2,
  Ellipsis,
  Megaphone,
  MessageCircleQuestion,
  ShieldAlert,
  FlaskConical,
  Trash2,
} from "lucide-react";
import type { Post } from "@/lib/types";
import type { RankReason } from "@/lib/feed/rank";
import { ME_ID } from "@/lib/data/demo/profiles";
import { actions, useProfileResolver } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Avatar } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/ui/relative-time";
import { Menu } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";
import { AuthorBadge, useAuthorCategory } from "@/components/trust/author-badge";
import { TrustStrip } from "@/components/trust/trust-strip";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { TopicChip } from "@/components/topic/topic-chip";
import { PostMedia } from "./post-media";
import { PostActions } from "./post-actions";

const CLAMP = 320;

export function PostCard({
  post,
  reasons,
  expanded = false,
  as: Tag = "article",
}: {
  post: Post;
  /** Ranking reasons; when present the menu offers "Why am I seeing this?". */
  reasons?: RankReason[];
  /** Detail view: show full text, no clamp. */
  expanded?: boolean;
  as?: "article" | "div";
}) {
  const { m, locale, href, fmt } = useI18n();
  const resolve = useProfileResolver(m.common.you);
  const author = resolve(post.authorId);
  const { open } = useOverlay();
  const toast = useToast();
  const [showMore, setShowMore] = useState(expanded);
  const [revealRestricted, setRevealRestricted] = useState(false);
  const category = useAuthorCategory(author ?? fallbackProfile);

  if (!author) return null;
  const isMine = post.authorId === ME_ID;
  const profileHref = isMine ? href("/profile") : href(`/u/${author.username}`);
  const long = post.content.length > CLAMP;
  const text = long && !showMore ? `${post.content.slice(0, CLAMP).trimEnd()}…` : post.content;
  const restricted = post.moderation.status === "restricted";

  const menuItems = [
    ...(reasons
      ? [{ label: m.post.why, icon: <Info className="size-4" />, onSelect: () => open({ kind: "why" as const, reasons }) }]
      : []),
    {
      label: m.post.copyLink,
      icon: <Link2 className="size-4" />,
      onSelect: async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${href(`/post/${post.id}`)}`);
          toast(m.post.linkCopied);
        } catch {
          /* clipboard unavailable */
        }
      },
    },
    ...(isMine
      ? [
          {
            label: m.post.delete,
            icon: <Trash2 className="size-4" />,
            tone: "danger" as const,
            onSelect: () => {
              if (window.confirm(m.post.deleteConfirm)) {
                actions.deletePost(post.id);
                toast(m.post.deleted);
              }
            },
          },
        ]
      : []),
    ...(!isMine
      ? [
          {
            label: m.post.hide,
            icon: <EyeOff className="size-4" />,
            onSelect: () => {
              actions.hidePost(post.id);
              toast(m.post.hidden, { label: m.common.undo, onAction: () => actions.unhidePost(post.id) });
            },
          },
          {
            label: m.post.report,
            icon: <Flag className="size-4" />,
            tone: "danger" as const,
            onSelect: () => open({ kind: "report", postId: post.id }),
          },
          {
            label: fmt(m.post.block, { name: author.displayName }),
            icon: <Ban className="size-4" />,
            tone: "danger" as const,
            onSelect: () => open({ kind: "block", profileId: author.id }),
          },
        ]
      : []),
  ];

  return (
    <Tag
      className="border-b border-line px-4 pt-4 pb-2 sm:px-5"
      aria-labelledby={`post-${post.id}-author`}
      lang={post.language}
    >
      <header className="flex items-start gap-3">
        <Link href={profileHref} tabIndex={-1} aria-hidden className="shrink-0">
          <Avatar profile={author} />
        </Link>
        <div className="min-w-0 flex-1" lang={locale}>
          <div className="flex items-center gap-1.5">
            <Link
              id={`post-${post.id}-author`}
              href={profileHref}
              className="truncate font-semibold hover:underline"
              dir="auto"
            >
              {author.displayName}
            </Link>
            <AuthorBadge profile={author} />
            <span className="flex-1" />
            <Link href={href(`/post/${post.id}`)} className="shrink-0 text-sm text-muted hover:underline">
              <RelativeTime iso={post.createdAt} />
            </Link>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 text-[0.85rem] leading-5 text-muted">
            <span className="truncate">{category}</span>
            {author.isDemo && (
              <span className="inline-flex items-center gap-1 text-[0.75rem] text-pending">
                <FlaskConical className="size-3" aria-hidden />
                {m.common.demoAccount}
              </span>
            )}
          </p>
        </div>
        <div className="-me-2 -mt-1.5" lang={locale}>
          <Menu label={m.post.more} trigger={<Ellipsis className="size-5" />} items={menuItems} />
        </div>
      </header>

      <div className="sm:ps-[3.25rem]">
        {post.moderation.status === "pending_review" && isMine && (
          <p className="mt-2 flex items-start gap-2 rounded-2xl bg-pending-bg p-3 text-sm text-pending" lang={locale}>
            <Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden />
            {m.post.pendingOwn}
          </p>
        )}

        {restricted && !revealRestricted ? (
          <div className="mt-2 rounded-2xl bg-danger-bg p-4" lang={locale}>
            <p className="flex items-center gap-2 font-semibold text-danger">
              <ShieldAlert className="size-4" aria-hidden />
              {m.post.restrictedTitle}
            </p>
            <p className="mt-1 text-sm text-ink">{m.post.restrictedBody}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setRevealRestricted(true)}>
              {m.post.restrictedShow}
            </Button>
          </div>
        ) : (
          <>
            {(post.type === "question" || post.type === "educational") && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-secondary" lang={locale}>
                {post.type === "question" ? (
                  <MessageCircleQuestion className="size-3.5" aria-hidden />
                ) : (
                  <BookOpen className="size-3.5" aria-hidden />
                )}
                {m.postTypes[post.type]}
              </p>
            )}
            {post.sponsor && (
              <p
                className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium"
                style={{ color: "var(--ph-sponsored)" }}
                lang={locale}
              >
                <Megaphone className="size-3.5" aria-hidden />
                {fmt(m.post.sponsoredBy, { partner: post.sponsor.partner })}
              </p>
            )}
            <p className={cn("post-text mt-1.5 text-[0.98rem]", restricted && "text-muted line-through decoration-danger/40")} dir="auto">
              {text}
            </p>
            {long && (
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="mt-1 text-sm font-medium text-primary-strong hover:underline"
                aria-expanded={showMore}
                lang={locale}
              >
                {showMore ? m.post.seeLess : m.post.seeMore}
              </button>
            )}
            <PostMedia post={post} />
          </>
        )}

        {post.topics.length > 0 && (
          <div className="mt-2.5 -ms-2.5 flex flex-wrap" lang={locale}>
            {post.topics.map((t) => (
              <TopicChip key={t} slug={t} />
            ))}
          </div>
        )}

        <div className="mt-1.5" lang={locale}>
          <TrustStrip post={post} />
        </div>

        <div className="mt-0.5" lang={locale}>
          <PostActions post={post} />
        </div>
      </div>
    </Tag>
  );
}

const fallbackProfile = {
  id: "",
  username: "",
  displayName: "",
  bio: "",
  bioLanguage: "ar" as const,
  avatarHue: 0,
  accountType: "public" as const,
  identityVerified: false,
  followers: 0,
  following: 0,
  joinedAt: "",
  isDemo: false,
};
