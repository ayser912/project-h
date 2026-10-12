"use client";

import Link from "next/link";
import { Heart, MessageCircle, ShieldCheck, UserPlus, FlaskConical } from "lucide-react";
import { getSeedProfile } from "@/lib/data/repository";
import { useI18n } from "@/i18n/provider";
import { Avatar } from "@/components/ui/avatar";

/**
 * Notifications list. Phase 1 shows fixed demonstration items (clearly
 * labelled); phase 2 reads the `notifications` table.
 */
const items = [
  { kind: "follow" as const, actor: "p-hala", to: "/u/hala.mom" },
  { kind: "comment" as const, actor: "p-karim", to: "/post/post-activity-who#comments" },
  { kind: "review" as const, actor: "p-omar", to: "/post/post-activity-who" },
  { kind: "like" as const, actor: "p-rana", to: "/profile" },
];

const icons = { follow: UserPlus, comment: MessageCircle, review: ShieldCheck, like: Heart };

export default function NotificationsPage() {
  const { m, href, fmt } = useI18n();
  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-4 sm:px-5">
        <h1 className="text-2xl font-bold">{m.notifications.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-pending">
          <FlaskConical className="size-4" aria-hidden />
          {m.notifications.demoNote}
        </p>
      </header>
      <ul>
        {items.map((n, i) => {
          const actor = getSeedProfile(n.actor)!;
          const Icon = icons[n.kind];
          return (
            <li key={i}>
              <Link href={href(n.to)} className="flex items-center gap-3 border-b border-line px-4 py-4 hover:bg-surface-2 sm:px-5">
                <span className="relative">
                  <Avatar profile={actor} />
                  <span className="absolute -bottom-1 -end-1 flex size-6 items-center justify-center rounded-full bg-primary text-white ring-2 ring-surface">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                </span>
                <p className="text-[0.95rem]">{fmt(m.notifications.items[n.kind], { name: actor.displayName })}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
