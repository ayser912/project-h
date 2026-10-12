"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ban, CalendarDays, Ellipsis, Flag, Lock, MapPin, BadgeCheck, Settings, ImageOff, Bookmark, PenLine } from "lucide-react";
import type { Post, Profile } from "@/lib/types";
import { ME_ID } from "@/lib/data/demo/profiles";
import { actions, useAllPosts, useDemoState, useFollowerCount, useHydrated } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { formatCompact, formatMonthYear } from "@/i18n/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";
import { AuthorBadge, useAuthorCategory } from "@/components/trust/author-badge";
import { CredentialDetails } from "@/components/trust/credential-details";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { PostCard } from "@/components/post/post-card";
import { FollowButton } from "./follow-button";
import { FlaskConical } from "lucide-react";

type Tab = "posts" | "media" | "saved";

export function ProfileView({ profile }: { profile: Profile }) {
  const { m, locale, href, fmt } = useI18n();
  const hydrated = useHydrated();
  const state = useDemoState();
  const allPosts = useAllPosts();
  const { open } = useOverlay();
  const [tab, setTab] = useState<Tab>("posts");
  const followers = useFollowerCount(profile);
  const category = useAuthorCategory(profile);
  const isMe = profile.id === ME_ID;
  const blocked = state.blocked.includes(profile.id);

  const posts = useMemo(
    () =>
      allPosts
        .filter((p) => p.authorId === profile.id)
        // Others never see pending or removed posts; restricted ones appear behind a notice.
        .filter((p) =>
          isMe ? p.moderation.status !== "removed" : p.moderation.status === "published" || p.moderation.status === "restricted",
        )
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [allPosts, profile.id, isMe],
  );
  const media = posts.filter((p) => p.media.length > 0 && p.moderation.status !== "restricted");
  const saved: Post[] = isMe ? allPosts.filter((p) => state.saves.includes(p.id) && !state.blocked.includes(p.authorId)) : [];
  const hasRestricted = posts.some((p) => p.moderation.status === "restricted");

  const tabs = [
    { value: "posts" as const, label: m.profile.tabs.posts },
    { value: "media" as const, label: m.profile.tabs.media },
    ...(isMe ? [{ value: "saved" as const, label: m.profile.tabs.saved }] : []),
  ];
  const list = tab === "posts" ? posts : tab === "media" ? media : saved;

  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-5 sm:px-5">
        <div className="flex items-start gap-4">
          <Avatar profile={profile} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-xl font-bold" dir="auto">
                {profile.displayName}
              </h1>
              <AuthorBadge profile={profile} />
            </div>
            <p className="text-sm text-muted" dir="ltr">
              <span className="inline-block">@{profile.username}</span>
            </p>
            <p className="mt-0.5 text-sm font-medium text-secondary">{category}</p>
          </div>
          {!isMe && (
            <Menu
              label={m.profile.menu}
              trigger={<Ellipsis className="size-5" />}
              items={[
                {
                  label: m.profile.reportProfile,
                  icon: <Flag className="size-4" />,
                  tone: "danger",
                  onSelect: () => open({ kind: "report", profileId: profile.id }),
                },
                blocked
                  ? { label: m.block.unblock, icon: <Ban className="size-4" />, onSelect: () => actions.unblock(profile.id) }
                  : {
                      label: fmt(m.post.block, { name: profile.displayName }),
                      icon: <Ban className="size-4" />,
                      tone: "danger",
                      onSelect: () => open({ kind: "block", profileId: profile.id }),
                    },
              ]}
            />
          )}
        </div>

        {profile.bio && (
          <p className="post-text mt-4 text-[0.95rem]" dir="auto">
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {profile.country && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {m.countries[profile.country as keyof typeof m.countries] ?? profile.country}
            </span>
          )}
          {profile.joinedAt && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden />
              {fmt(m.profile.joined, { date: formatMonthYear(profile.joinedAt, locale) })}
            </span>
          )}
          {profile.isDemo && (
            <span className="inline-flex items-center gap-1 text-pending">
              <FlaskConical className="size-4" aria-hidden />
              {m.common.demoAccount}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-5 text-sm">
          <span>
            <strong className="font-semibold">{formatCompact(followers, locale)}</strong>{" "}
            <span className="text-muted">{m.profile.followers}</span>
          </span>
          <span>
            <strong className="font-semibold">{formatCompact(profile.following, locale)}</strong>{" "}
            <span className="text-muted">{m.profile.following}</span>
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {isMe ? (
            <>
              <Link
                href={href("/settings")}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-5 font-medium ring-1 ring-inset ring-line-strong hover:bg-surface-2"
              >
                <Settings className="size-4" aria-hidden />
                {m.profile.editProfile}
              </Link>
              <Button variant="quiet" disabled title={m.profile.applyHint} aria-describedby="apply-hint">
                <BadgeCheck className="size-4" aria-hidden />
                {m.profile.applyVerification}
              </Button>
              <p id="apply-hint" className="w-full text-xs text-muted">
                {m.profile.applyHint}
              </p>
            </>
          ) : blocked ? (
            <Button variant="secondary" onClick={() => actions.unblock(profile.id)}>
              {m.block.unblock}
            </Button>
          ) : (
            <FollowButton profileId={profile.id} name={profile.displayName} size="md" />
          )}
        </div>
      </header>

      {(profile.credential || profile.organization) && (
        <section aria-labelledby="credentials-title" className="border-b border-line px-4 py-5 sm:px-5">
          <h2 id="credentials-title" className="mb-3 text-lg font-semibold">
            {profile.organization ? m.credential.orgTitle : m.profile.credentials}
          </h2>
          <CredentialDetails profile={profile} />
        </section>
      )}

      {blocked ? (
        <EmptyState icon={<Ban className="size-6" />} title={m.profile.blockedNotice} />
      ) : (
        <>
          <Tabs idBase="profile" label={m.profile.tabsLabel} value={tab} onChange={setTab} items={tabs} />
          <TabPanel idBase="profile" value={tab}>
            {tab === "saved" && (
              <p className="flex items-center gap-1.5 border-b border-line px-4 py-2.5 text-xs text-muted sm:px-5">
                <Lock className="size-3.5" aria-hidden />
                {m.profile.savedPrivate}
              </p>
            )}
            {tab === "posts" && hasRestricted && (
              <p className="border-b border-line bg-danger-bg px-4 py-2.5 text-sm text-danger sm:px-5">
                {m.profile.restrictedNotice}
              </p>
            )}
            {!hydrated ? (
              <FeedSkeleton label={m.common.loading} />
            ) : list.length ? (
              list.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <EmptyState
                icon={
                  tab === "media" ? (
                    <ImageOff className="size-6" />
                  ) : tab === "saved" ? (
                    <Bookmark className="size-6" />
                  ) : (
                    <PenLine className="size-6" />
                  )
                }
                title={
                  tab === "media"
                    ? m.profile.emptyMedia
                    : tab === "saved"
                      ? m.profile.emptySaved
                      : isMe
                        ? m.profile.emptyOwnPosts
                        : m.profile.emptyPosts
                }
                action={
                  isMe && tab === "posts" ? (
                    <Link
                      href={href("/create")}
                      className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-white hover:bg-primary-strong"
                    >
                      {m.nav.create}
                    </Link>
                  ) : undefined
                }
              />
            )}
          </TabPanel>
        </>
      )}
    </div>
  );
}
