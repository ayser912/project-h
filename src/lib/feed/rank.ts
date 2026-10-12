import type { ContentLanguage, Post } from "@/lib/types";
import { validReview } from "@/lib/trust/attributes";

/**
 * Feed ranking (spec §9). An understandable, rule-based ranker:
 * safety gates run first and can never be outweighed by engagement.
 * Every score keeps its reasons so the UI can answer "why am I seeing this?".
 */

export type RankReason =
  | "followed_creator"
  | "followed_topic"
  | "interest"
  | "recent"
  | "your_language"
  | "sources"
  | "popular_discussion";

export interface FeedViewer {
  id: string;
  interests: ReadonlySet<string>;
  followedTopics: ReadonlySet<string>;
  followedUsers: ReadonlySet<string>;
  blockedUsers: ReadonlySet<string>;
  hiddenPosts: ReadonlySet<string>;
  language: ContentLanguage;
}

export interface RankedPost {
  post: Post;
  score: number;
  reasons: RankReason[];
}

/**
 * Can this post be shown to this viewer at all, in a distributed surface
 * (feeds, topic pages, search)? Authors always see their own posts on their
 * profile; that path does not use this gate.
 */
export function isDistributable(post: Post, viewer: FeedViewer): boolean {
  if (viewer.blockedUsers.has(post.authorId)) return false;
  if (viewer.hiddenPosts.has(post.id)) return false;
  if (post.moderation.status !== "published") {
    // pending_review, restricted and removed posts are never distributed
    // to others; the author still sees their own pending post.
    return post.authorId === viewer.id && post.moderation.status === "pending_review";
  }
  return true;
}

/** Eligible for recommendation amplification (For You, Explore, topic "top"). */
export function isRecommendable(post: Post, viewer: FeedViewer): boolean {
  if (!isDistributable(post, viewer)) return false;
  if (post.moderation.status !== "published") return false;
  const risky = post.moderation.risk === "high" || post.moderation.risk === "critical";
  // High-risk content is only amplified once a valid clinical review exists.
  if (risky && !validReview(post)) return false;
  return true;
}

export function scorePost(post: Post, viewer: FeedViewer, now: number): RankedPost {
  const reasons: RankReason[] = [];
  let score = 0;

  if (viewer.followedUsers.has(post.authorId)) {
    score += 4;
    reasons.push("followed_creator");
  }
  const topicHits = post.topics.filter((t) => viewer.followedTopics.has(t)).length;
  if (topicHits) {
    score += 2 + topicHits * 0.5;
    reasons.push("followed_topic");
  }
  const interestHits = post.topics.filter((t) => viewer.interests.has(t)).length;
  if (interestHits) {
    score += 2.5 + interestHits * 0.5;
    reasons.push("interest");
  }

  const ageHours = Math.max(0, (now - new Date(post.createdAt).getTime()) / 3600_000);
  const recency = 6 * Math.exp(-ageHours / 36);
  score += recency;
  if (ageHours < 12) reasons.push("recent");

  if (post.language === viewer.language) {
    score += 1;
    reasons.push("your_language");
  }
  if (post.sources.length > 0) {
    score += 0.75;
    reasons.push("sources");
  }

  // Engagement quality: saves and comments signal usefulness more than likes.
  // Log-scaled so popularity cannot drown out relevance.
  const quality = Math.log10(1 + post.counts.saves * 2 + post.counts.comments * 3);
  score += Math.min(quality, 3) * 0.6;
  if (post.counts.comments >= 2 && post.type === "question") {
    reasons.push("popular_discussion");
  }

  return { post, score, reasons };
}

export function rankForYou(posts: Post[], viewer: FeedViewer, now: number): RankedPost[] {
  return posts
    .filter((p) => isRecommendable(p, viewer))
    .map((p) => scorePost(p, viewer, now))
    .sort((a, b) => b.score - a.score);
}

/** Following feed: plain reverse-chronological, no algorithmic ordering. */
export function followingFeed(posts: Post[], viewer: FeedViewer): Post[] {
  return posts
    .filter((p) => (viewer.followedUsers.has(p.authorId) || p.authorId === viewer.id))
    .filter((p) => isDistributable(p, viewer))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
