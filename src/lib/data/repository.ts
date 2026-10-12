import type { Comment, Post, Profile } from "@/lib/types";
import { demoProfiles } from "./demo/profiles";
import { demoComments, demoPosts } from "./demo/posts";

/**
 * Read-side data access. Phase 1 serves bundled demonstration data.
 * Phase 2 replaces these functions with server-side Supabase queries
 * (RLS-protected) behind the same signatures.
 */
export const seedProfiles: readonly Profile[] = demoProfiles;
export const seedPosts: readonly Post[] = demoPosts;
export const seedComments: readonly Comment[] = demoComments;

const byId = new Map(demoProfiles.map((p) => [p.id, p]));
const byUsername = new Map(demoProfiles.map((p) => [p.username, p]));

export function getSeedProfile(id: string): Profile | undefined {
  return byId.get(id);
}

export function getSeedProfileByUsername(username: string): Profile | undefined {
  return byUsername.get(username);
}

export function getSeedPost(id: string): Post | undefined {
  return demoPosts.find((p) => p.id === id);
}

export function verifiedCreators(): Profile[] {
  return demoProfiles.filter(
    (p) => p.accountType === "professional" && p.credential?.status === "active",
  );
}

export function verifiedOrganizations(): Profile[] {
  return demoProfiles.filter((p) => p.accountType === "organization" && p.organization);
}
