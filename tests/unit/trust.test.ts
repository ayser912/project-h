import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/types";
import { authorAttributes, credentialIsActive, postAttributes, validReview } from "@/lib/trust/attributes";
import { demoPosts } from "@/lib/data/demo/posts";
import { demoProfiles } from "@/lib/data/demo/profiles";

const base: Post = {
  id: "t1",
  authorId: "p-layan",
  type: "educational",
  content: "x",
  language: "en",
  createdAt: "2026-10-01T00:00:00Z",
  version: 1,
  topics: ["fitness"],
  media: [],
  sources: [],
  moderation: { status: "published", risk: "low" },
  counts: { likes: 0, comments: 0, saves: 0, shares: 0 },
  isDemo: true,
};

describe("Health Trust Engine attributes", () => {
  it("never labels a post reviewed just because a verified professional wrote it", () => {
    const layan = demoProfiles.find((p) => p.id === "p-layan")!;
    expect(authorAttributes(layan)).toContain("credential_verified");
    expect(postAttributes(base)).not.toContain("clinically_reviewed");
    expect(postAttributes(base)).toContain("not_reviewed");
  });

  it("shows the reviewed label only when a review record exists for the current version", () => {
    const reviewed: Post = {
      ...base,
      review: {
        id: "r",
        contentVersion: 1,
        reviewerRole: { ar: "", en: "" },
        reviewedAt: "2026-10-02T00:00:00Z",
        outcome: "accurate_in_context",
        isDemo: true,
      },
    };
    expect(postAttributes(reviewed)).toContain("clinically_reviewed");
    expect(postAttributes(reviewed)).not.toContain("not_reviewed");
  });

  it("invalidates the review when the post is edited (version bump)", () => {
    const edited: Post = {
      ...base,
      version: 2,
      review: {
        id: "r",
        contentVersion: 1,
        reviewerRole: { ar: "", en: "" },
        reviewedAt: "2026-10-02T00:00:00Z",
        outcome: "accurate_in_context",
        isDemo: true,
      },
    };
    expect(validReview(edited)).toBeUndefined();
    expect(postAttributes(edited)).toContain("not_reviewed");
  });

  it("keeps sources, personal experience and sponsorship as separate attributes", () => {
    const p: Post = {
      ...base,
      type: "experience",
      sources: [{ title: "a", url: "https://example.org" }],
      sponsor: { partner: "X" },
    };
    const attrs = postAttributes(p);
    expect(attrs).toEqual(expect.arrayContaining(["personal_experience", "sources_provided", "sponsored", "not_reviewed"]));
  });

  it("marks pending posts as under review instead of not reviewed", () => {
    const p: Post = { ...base, moderation: { status: "pending_review", risk: "high" } };
    expect(postAttributes(p)).toContain("under_review");
    expect(postAttributes(p)).not.toContain("not_reviewed");
  });

  it("public accounts carry no professional verification", () => {
    const rana = demoProfiles.find((p) => p.id === "p-rana")!;
    expect(authorAttributes(rana)).toEqual([]);
  });

  it("organisation verification is separate from individual credentials", () => {
    const org = demoProfiles.find((p) => p.accountType === "organization")!;
    const attrs = authorAttributes(org);
    expect(attrs).toContain("organization_verified");
    expect(attrs).not.toContain("credential_verified");
  });

  it("treats expired credentials as inactive", () => {
    const layan = demoProfiles.find((p) => p.id === "p-layan")!;
    expect(credentialIsActive(layan, new Date("2026-10-01"))).toBe(true);
    expect(credentialIsActive(layan, new Date("2030-01-01"))).toBe(false);
  });

  it("only one seeded post carries a (demo) review record, and it is marked demo", () => {
    const reviewed = demoPosts.filter((p) => p.review);
    expect(reviewed).toHaveLength(1);
    expect(reviewed[0].review!.isDemo).toBe(true);
  });

  it("every seeded account is flagged as demonstration data", () => {
    expect(demoProfiles.every((p) => p.isDemo)).toBe(true);
  });
});
