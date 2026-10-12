"use client";

import Link from "next/link";
import type { Profile } from "@/lib/types";
import { ME_ID } from "@/lib/data/demo/profiles";
import { useI18n } from "@/i18n/provider";
import { Avatar } from "@/components/ui/avatar";
import { AuthorBadge, useAuthorCategory } from "@/components/trust/author-badge";
import { FollowButton } from "./follow-button";

/** Compact creator listing used in Explore, topic pages and the side panel. */
export function CreatorRow({ profile, showFollow = true }: { profile: Profile; showFollow?: boolean }) {
  const { href } = useI18n();
  const category = useAuthorCategory(profile);
  const to = profile.id === ME_ID ? href("/profile") : href(`/u/${profile.username}`);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link href={to} tabIndex={-1} aria-hidden>
        <Avatar profile={profile} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link href={to} className="truncate text-[0.95rem] font-semibold hover:underline" dir="auto">
            {profile.displayName}
          </Link>
          <AuthorBadge profile={profile} />
        </div>
        <p className="truncate text-sm text-muted">{category}</p>
      </div>
      {showFollow && profile.id !== ME_ID && <FollowButton profileId={profile.id} name={profile.displayName} />}
    </div>
  );
}
