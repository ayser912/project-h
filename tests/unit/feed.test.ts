import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/types";
import { followingFeed, isDistributable, isRecommendable, rankForYou, type FeedViewer } from "@/lib/feed/rank";
import { demoPosts } from "@/lib/data/demo/posts";

const NOW = Date.parse("2026-10-12T12:00:00Z");
const viewer = (over: Partial<FeedViewer> = {}): FeedViewer => ({
  id: "me",
  interests: new Set(),
  followedTopics: new Set(),
  followedUsers: new Set(),
  blockedUsers: new Set(),
  hiddenPosts: new Set(),
  language: "ar",
  ...over,
});

const post = (over: Partial<Post>): Post => ({
  id: Math.random().toString(36),
  authorId: "a",
  type: "standard",
  content: "x",
  language: "ar",
  createdAt: new Date(NOW - 3600_000).toISOString(),
  version: 1,
  topics: [],
  media: [],
  sources: [],
  moderation: { status: "published", risk: "low" },
  counts: { likes: 0, comments: 0, saves: 0, shares: 0 },
  isDemo: true,
  ...over,
});

describe("safety-aware feed ranking", () => {
  it("never recommends high-risk posts awaiting review, however popular", () => {
    const viral = post({
      moderation: { status: "published", risk: "high" },
      counts: { likes: 1e6, comments: 1e5, saves: 1e5, shares: 1e5 },
    });
    expect(isRecommendable(viral, viewer())).toBe(false);
    expect(rankForYou([viral], viewer(), NOW)).toHaveLength(0);
  });

  it("never distributes pending, restricted or removed posts to others", () => {
    for (const status of ["pending_review", "restricted", "removed"] as const) {
      expect(isDistributable(post({ moderation: { status, risk: "critical" } }), viewer())).toBe(false);
    }
  });

  it("lets authors see their own pending post in their following feed, but not For You", () => {
    const mine = post({ authorId: "me", moderation: { status: "pending_review", risk: "high" } });
    expect(followingFeed([mine], viewer())).toHaveLength(1);
    expect(rankForYou([mine], viewer(), NOW)).toHaveLength(0);
  });

  it("enforces blocking and hidden posts", () => {
    const p = post({ authorId: "blocked" });
    expect(rankForYou([p], viewer({ blockedUsers: new Set(["blocked"]) }), NOW)).toHaveLength(0);
    expect(rankForYou([p], viewer({ hiddenPosts: new Set([p.id]) }), NOW)).toHaveLength(0);
  });

  it("ranks interest and follow matches above raw popularity, and explains why", () => {
    const relevant = post({ topics: ["nutrition"], authorId: "followed" });
    const popular = post({ topics: ["dental-health"], counts: { likes: 50000, comments: 900, saves: 9000, shares: 0 } });
    const [first] = rankForYou(
      [popular, relevant],
      viewer({ interests: new Set(["nutrition"]), followedUsers: new Set(["followed"]) }),
      NOW,
    );
    expect(first.post.id).toBe(relevant.id);
    expect(first.reasons).toEqual(expect.arrayContaining(["interest", "followed_creator"]));
  });

  it("orders the following feed by time only", () => {
    const old = post({ authorId: "f", createdAt: new Date(NOW - 50 * 3600_000).toISOString(), counts: { likes: 9e5, comments: 0, saves: 0, shares: 0 } });
    const fresh = post({ authorId: "f", createdAt: new Date(NOW - 1000).toISOString() });
    const feed = followingFeed([old, fresh], viewer({ followedUsers: new Set(["f"]) }));
    expect(feed.map((p) => p.id)).toEqual([fresh.id, old.id]);
  });

  it("keeps the seeded restricted demo post out of every recommendation", () => {
    const restricted = demoPosts.find((p) => p.moderation.status === "restricted")!;
    expect(rankForYou(demoPosts, viewer(), NOW).some((r) => r.post.id === restricted.id)).toBe(false);
  });
});
