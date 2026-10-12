"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Comment, ContentReport, Post, Profile } from "@/lib/types";
import { ME_ID } from "@/lib/data/demo/profiles";
import { getSeedProfile, seedComments, seedPosts } from "@/lib/data/repository";
import type { FeedViewer } from "@/lib/feed/rank";
import type { Locale } from "@/i18n/config";

/**
 * Phase 1 demo persistence.
 *
 * All social actions are real state changes, persisted to localStorage on
 * this device (media blobs go to IndexedDB). The public API of this module —
 * actions + selector hooks — is what Phase 2 reimplements on top of Supabase
 * (server actions + RLS), so components don't change.
 */

export interface MeProfile {
  displayName: string;
  bio: string;
  country: string;
  showCountry: boolean;
}

export interface DemoState {
  v: 1;
  likes: string[];
  saves: string[];
  followsUsers: string[];
  followsTopics: string[];
  joinedHubs: string[];
  interests: string[];
  onboarded: boolean;
  blocked: string[];
  hidden: string[];
  reports: ContentReport[];
  comments: Comment[];
  posts: Post[];
  me: MeProfile;
}

const KEY = "projecth.demo.v1";

export const initialState: DemoState = {
  v: 1,
  likes: [],
  saves: [],
  followsUsers: [],
  followsTopics: [],
  joinedHubs: [],
  interests: [],
  onboarded: false,
  blocked: [],
  hidden: [],
  reports: [],
  comments: [],
  posts: [],
  me: { displayName: "", bio: "", country: "", showCountry: false },
};

let current: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (current) return current;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<DemoState>) : null;
    current = parsed?.v === 1 ? { ...initialState, ...parsed, me: { ...initialState.me, ...parsed.me } } : initialState;
  } catch {
    current = initialState;
  }
  return current;
}

function write(next: DemoState) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): state still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot = () => initialState;

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, read, serverSnapshot);
}

/** True once the device state has been read (after hydration). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
const noopSubscribe = () => () => {};

function update(fn: (s: DemoState) => DemoState) {
  write(fn(read()));
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

let seq = 0;
export function newId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}-${Math.random().toString(36).slice(2, 7)}`;
}

export const actions = {
  toggleLike: (postId: string) => update((s) => ({ ...s, likes: toggle(s.likes, postId) })),
  toggleSave: (postId: string) => update((s) => ({ ...s, saves: toggle(s.saves, postId) })),
  toggleFollowUser: (profileId: string) => {
    if (profileId === ME_ID) return;
    update((s) => ({ ...s, followsUsers: toggle(s.followsUsers, profileId) }));
  },
  toggleFollowTopic: (slug: string) =>
    update((s) => ({ ...s, followsTopics: toggle(s.followsTopics, slug) })),
  toggleHub: (slug: string) => update((s) => ({ ...s, joinedHubs: toggle(s.joinedHubs, slug) })),
  setInterests: (slugs: string[]) => update((s) => ({ ...s, interests: [...new Set(slugs)] })),
  completeOnboarding: () => update((s) => ({ ...s, onboarded: true })),
  block: (profileId: string) =>
    update((s) => ({
      ...s,
      blocked: s.blocked.includes(profileId) ? s.blocked : [...s.blocked, profileId],
      followsUsers: s.followsUsers.filter((x) => x !== profileId),
    })),
  unblock: (profileId: string) =>
    update((s) => ({ ...s, blocked: s.blocked.filter((x) => x !== profileId) })),
  hidePost: (postId: string) =>
    update((s) => ({ ...s, hidden: s.hidden.includes(postId) ? s.hidden : [...s.hidden, postId] })),
  unhidePost: (postId: string) =>
    update((s) => ({ ...s, hidden: s.hidden.filter((x) => x !== postId) })),
  addReport: (report: Omit<ContentReport, "id" | "createdAt" | "status">) =>
    update((s) => ({
      ...s,
      reports: [
        ...s.reports,
        { ...report, id: newId("rep"), createdAt: new Date().toISOString(), status: "submitted" },
      ],
    })),
  addComment: (comment: Pick<Comment, "postId" | "content" | "language">) => {
    const c: Comment = {
      ...comment,
      id: newId("cmt"),
      authorId: ME_ID,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    update((s) => ({ ...s, comments: [...s.comments, c] }));
    return c;
  },
  addPost: (post: Post) => update((s) => ({ ...s, posts: [post, ...s.posts] })),
  deletePost: (postId: string) =>
    update((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) })),
  updateMe: (patch: Partial<MeProfile>) => update((s) => ({ ...s, me: { ...s.me, ...patch } })),
  reset: () => write(initialState),
};

/* ---------- selectors ---------- */

export function useAllPosts(): Post[] {
  const s = useDemoState();
  return useMemo(() => [...s.posts, ...seedPosts], [s.posts]);
}

export function useMeProfile(fallbackName: string): Profile {
  const s = useDemoState();
  return useMemo(
    () => ({
      id: ME_ID,
      username: "you.demo",
      displayName: s.me.displayName.trim() || fallbackName,
      bio: s.me.bio,
      bioLanguage: "ar",
      avatarHue: 158,
      accountType: "public",
      country: s.me.showCountry && s.me.country ? s.me.country : undefined,
      identityVerified: false,
      followers: 0,
      following: s.followsUsers.length,
      joinedAt: "",
      isDemo: false,
    }),
    [s.me, s.followsUsers.length, fallbackName],
  );
}

/** Resolve any profile id, including the demo "me". */
export function useProfileResolver(fallbackName: string) {
  const me = useMeProfile(fallbackName);
  return useMemo(
    () => (id: string): Profile | undefined => (id === ME_ID ? me : getSeedProfile(id)),
    [me],
  );
}

export function useCommentsFor(postId: string): Comment[] {
  const s = useDemoState();
  return useMemo(
    () =>
      [...seedComments.filter((c) => c.postId === postId), ...s.comments.filter((c) => c.postId === postId)]
        .filter((c) => !s.blocked.includes(c.authorId))
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [s.comments, s.blocked, postId],
  );
}

export function useViewer(locale: Locale): FeedViewer {
  const s = useDemoState();
  return useMemo(
    () => ({
      id: ME_ID,
      interests: new Set(s.interests),
      followedTopics: new Set(s.followsTopics),
      followedUsers: new Set(s.followsUsers),
      blockedUsers: new Set(s.blocked),
      hiddenPosts: new Set(s.hidden),
      language: locale,
    }),
    [s.interests, s.followsTopics, s.followsUsers, s.blocked, s.hidden, locale],
  );
}

/** Counts include the viewer's own interactions on top of seeded totals. */
export function useDisplayCounts(post: Post) {
  const s = useDemoState();
  const liked = s.likes.includes(post.id);
  const saved = s.saves.includes(post.id);
  const extraComments = s.comments.filter((c) => c.postId === post.id).length;
  return {
    liked,
    saved,
    likes: post.counts.likes + (liked ? 1 : 0),
    comments: post.counts.comments + extraComments,
  };
}

export function useFollowerCount(profile: Profile): number {
  const s = useDemoState();
  return profile.followers + (s.followsUsers.includes(profile.id) ? 1 : 0);
}
