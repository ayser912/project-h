import type { ClinicalReview, Post, Profile } from "@/lib/types";

/**
 * Health Trust Engine — transparency attributes (spec §8.3).
 *
 * Attributes describe two different things and are kept apart on purpose:
 *  - WHO is posting (identity / professional credential / organisation)
 *  - WHAT this specific post is (sources, review, personal story, sponsorship)
 * They are independent facts, never combined into a score.
 */

export type AuthorAttribute =
  | "identity_verified"
  | "credential_verified"
  | "credential_inactive"
  | "organization_verified";

export type PostAttribute =
  | "sources_provided"
  | "clinically_reviewed"
  | "not_reviewed"
  | "under_review"
  | "personal_experience"
  | "sponsored";

export function authorAttributes(author: Profile): AuthorAttribute[] {
  const out: AuthorAttribute[] = [];
  if (author.organization) out.push("organization_verified");
  if (author.credential) {
    out.push(
      author.credential.status === "active"
        ? "credential_verified"
        : "credential_inactive",
    );
  }
  if (author.identityVerified && !author.organization) out.push("identity_verified");
  return out;
}

/**
 * A review only counts if it was made for the version currently shown.
 * Editing a post bumps its version and silently voids the old review.
 * Being written by a verified professional never implies review.
 */
export function validReview(post: Post): ClinicalReview | undefined {
  const r = post.review;
  if (!r) return undefined;
  return r.contentVersion === post.version ? r : undefined;
}

export function postAttributes(post: Post): PostAttribute[] {
  const out: PostAttribute[] = [];
  if (post.moderation.status === "pending_review") out.push("under_review");
  if (post.type === "experience") out.push("personal_experience");
  if (post.sponsor) out.push("sponsored");
  if (post.sources.length > 0) out.push("sources_provided");
  if (validReview(post)) out.push("clinically_reviewed");
  else if (post.moderation.status !== "pending_review") out.push("not_reviewed");
  return out;
}

/** Credential is shown with its scope and date; expired ones are not "verified". */
export function credentialIsActive(author: Profile, now = new Date()): boolean {
  const c = author.credential;
  if (!c || c.status !== "active") return false;
  if (c.expiresAt && new Date(c.expiresAt) < now) return false;
  return true;
}
