import type { Post, Profile, Topic } from "@/lib/types";
import { normalizeText } from "@/lib/safety/screen";

/**
 * Keyword search across posts, creators and topics (Arabic + English).
 * Only public content is searched. Nothing about the searcher (interests,
 * saved posts, follows) is used for suggestions, so sensitive interests are
 * never surfaced back.
 */
export interface SearchResults {
  posts: Post[];
  profiles: Profile[];
  topics: Topic[];
}

export function tokenize(query: string): string[] {
  return normalizeText(query)
    .replace(/^[@#]/, "")
    .split(/[\s,،]+/)
    .filter((t) => t.length >= 2);
}

function matchesAll(haystack: string, terms: string[]): boolean {
  const h = normalizeText(haystack);
  return terms.every((t) => h.includes(t));
}

export function search(
  query: string,
  data: { posts: Post[]; profiles: Profile[]; topics: Topic[] },
  isVisible: (p: Post) => boolean,
): SearchResults {
  const terms = tokenize(query);
  if (!terms.length) return { posts: [], profiles: [], topics: [] };

  const topics = data.topics.filter((t) =>
    matchesAll(`${t.name.ar} ${t.name.en} ${t.slug.replace(/-/g, " ")}`, terms),
  );
  const topicSlugs = new Set(topics.map((t) => t.slug));

  const profiles = data.profiles.filter((p) =>
    matchesAll(`${p.displayName} ${p.username} ${p.credential?.specialty.ar ?? ""} ${p.credential?.specialty.en ?? ""}`, terms),
  );

  const posts = data.posts
    .filter(isVisible)
    .filter(
      (p) =>
        matchesAll(p.content, terms) || p.topics.some((t) => topicSlugs.has(t)),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return { posts, profiles, topics };
}
