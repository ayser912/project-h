"use client";

import { actions, useDemoState } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function FollowButton({
  profileId,
  name,
  size = "sm",
  className,
}: {
  profileId: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { m } = useI18n();
  const s = useDemoState();
  const following = s.followsUsers.includes(profileId);
  const blocked = s.blocked.includes(profileId);
  if (blocked) return null;
  return (
    <Button
      size={size}
      variant={following ? "secondary" : "primary"}
      aria-pressed={following}
      aria-label={`${following ? m.common.unfollow : m.common.follow} ${name}`}
      onClick={() => actions.toggleFollowUser(profileId)}
      className={cn("min-w-[6.5rem]", className)}
    >
      {following ? m.common.followingState : m.common.follow}
    </Button>
  );
}
