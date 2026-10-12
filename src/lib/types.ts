/**
 * Domain types. These mirror the planned PostgreSQL schema
 * (see docs/ARCHITECTURE.md) so the demo data layer can be swapped for
 * Supabase-backed queries in Phase 2 without touching UI components.
 */
import type { Bilingual } from "@/i18n/config";

export type ContentLanguage = "ar" | "en";

export type AccountType = "public" | "professional" | "organization";

export type ProfessionKey =
  | "physician"
  | "nurse"
  | "pharmacist"
  | "dietitian"
  | "physiotherapist"
  | "psychologist"
  | "health_educator";

export type CredentialStatus = "active" | "expired" | "suspended";

/** A reviewed professional credential (Health Trust Engine 8.2). */
export interface ProfessionalCredential {
  profession: ProfessionKey;
  /** Title as the professional chose to display it (e.g. "طبيبة"). */
  title?: Bilingual;
  specialty: Bilingual;
  licensingAuthority: Bilingual;
  country: string; // ISO 3166-1 alpha-2
  /** Masked registration reference, never the full number. */
  registrationRef?: string;
  verifiedAt: string; // ISO date
  expiresAt?: string;
  /** What the check actually covered, in plain words. */
  scope: Bilingual;
  status: CredentialStatus;
}

export type OrganizationKind =
  | "hospital"
  | "clinic"
  | "university"
  | "association"
  | "public_health";

/** Organisational verification is separate from individual credentials. */
export interface OrganizationVerification {
  kind: OrganizationKind;
  verifiedAt: string;
  scope: Bilingual;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  bioLanguage: ContentLanguage;
  /** Avatar is generated from initials + this hue until uploads exist. */
  avatarHue: number;
  accountType: AccountType;
  /** Only shown when the person chose to share it. */
  country?: string;
  identityVerified: boolean;
  credential?: ProfessionalCredential;
  organization?: OrganizationVerification;
  followers: number;
  following: number;
  joinedAt: string;
  /** Every seeded account is fictional demonstration data. */
  isDemo: boolean;
}

export type PostType =
  | "standard"
  | "video"
  | "experience"
  | "question"
  | "educational";

export type ModerationStatus =
  | "published"
  | "pending_review" // limited distribution until a human reviews it
  | "restricted" // reviewed; distribution limited, shown behind a notice
  | "removed";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface MediaItem {
  kind: "image" | "video";
  /** Public URL for seeded media. */
  src?: string;
  /** Optional WebM (VP9) rendition, offered before the MP4 for wider codec support. */
  webmSrc?: string;
  /** IndexedDB key for media created on this device (demo mode). */
  localKey?: string;
  posterSrc?: string;
  posterLocalKey?: string;
  alt: string;
  width: number;
  height: number;
  durationSec?: number;
  captions?: Partial<Record<ContentLanguage, string>>;
}

export interface PostSource {
  title: string;
  url: string;
  publisher?: string;
}

/**
 * A clinical review record for one specific version of a post.
 * Editing the post creates a new version and invalidates the review.
 */
export interface ClinicalReview {
  id: string;
  contentVersion: number;
  reviewerRole: Bilingual;
  reviewedAt: string;
  outcome: "accurate_in_context" | "needs_context";
  note?: Bilingual;
  isDemo: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  content: string;
  language: ContentLanguage;
  createdAt: string;
  updatedAt?: string;
  version: number;
  topics: string[];
  media: MediaItem[];
  sources: PostSource[];
  sponsor?: { partner: string };
  moderation: { status: ModerationStatus; risk: RiskLevel };
  review?: ClinicalReview;
  counts: { likes: number; comments: number; saves: number; shares: number };
  isDemo: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  language: ContentLanguage;
  createdAt: string;
  isDemo: boolean;
}

export interface Topic {
  slug: string;
  name: Bilingual;
  description: Bilingual;
  icon: string;
  related: string[];
}

export interface Community {
  slug: string;
  name: Bilingual;
  description: Bilingual;
  topics: string[];
  members: number;
  icon: string;
}

export type ReportReason =
  | "misinformation"
  | "dangerous_advice"
  | "patient_privacy"
  | "impersonation"
  | "undisclosed_ad"
  | "harassment"
  | "spam"
  | "other";

export interface ContentReport {
  id: string;
  postId?: string;
  profileId?: string;
  reason: ReportReason;
  details: string;
  createdAt: string;
  status: "submitted";
}
