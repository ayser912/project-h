"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { Community } from "@/lib/types";
import { communities } from "@/lib/data/topics";
import { actions, useDemoState } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { formatCompact } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { TopicIcon } from "@/components/topic/topic-icon";

export function JoinButton({ slug, name }: { slug: string; name: string }) {
  const { m } = useI18n();
  const s = useDemoState();
  const joined = s.joinedHubs.includes(slug);
  return (
    <Button
      size="sm"
      variant={joined ? "secondary" : "quiet"}
      aria-pressed={joined}
      aria-label={`${joined ? m.communities.joined : m.communities.join}: ${name}`}
      onClick={() => actions.toggleHub(slug)}
    >
      {joined ? m.communities.joined : m.communities.join}
    </Button>
  );
}

function CommunityRow({ c }: { c: Community }) {
  const { m, locale, pick, href, fmt } = useI18n();
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <Link href={href(`/communities/${c.slug}`)} tabIndex={-1} aria-hidden>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-secondary">
          <TopicIcon name={c.icon} className="size-6" />
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href(`/communities/${c.slug}`)} className="font-semibold hover:underline">
          {pick(c.name)}
        </Link>
        <p className="truncate text-sm text-muted">{pick(c.description)}</p>
        <p className="text-xs text-muted">{fmt(m.communities.members, { n: formatCompact(c.members, locale) })}</p>
      </div>
      <JoinButton slug={c.slug} name={pick(c.name)} />
    </li>
  );
}

export function CommunitiesView() {
  const { m } = useI18n();
  const s = useDemoState();
  const mine = communities.filter((c) => s.joinedHubs.includes(c.slug));

  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-4 sm:px-5">
        <h1 className="text-2xl font-bold">{m.communities.title}</h1>
        <p className="mt-1 text-[0.95rem] text-muted">{m.communities.intro}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Lock className="size-3.5" aria-hidden />
          {m.communities.mvpNote}
        </p>
      </header>
      {mine.length > 0 && (
        <section aria-labelledby="mine-title" className="border-b border-line">
          <h2 id="mine-title" className="px-4 pt-4 text-sm font-semibold text-muted sm:px-5">
            {m.communities.yours}
          </h2>
          <ul>
            {mine.map((c) => (
              <CommunityRow key={c.slug} c={c} />
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="all-title">
        <h2 id="all-title" className="px-4 pt-4 text-sm font-semibold text-muted sm:px-5">
          {m.communities.all}
        </h2>
        <ul className="divide-y divide-line">
          {communities.map((c) => (
            <CommunityRow key={c.slug} c={c} />
          ))}
        </ul>
      </section>
    </div>
  );
}
