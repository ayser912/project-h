"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { postAttributes } from "@/lib/trust/attributes";
import { useI18n } from "@/i18n/provider";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { AttributeTag } from "./attribute-style";

/**
 * The transparency strip under every post: separate facts about THIS post
 * (sources, review status, personal story, sponsorship). Unreviewed content
 * is always identified. The whole strip opens "About this post".
 */
export function TrustStrip({ post }: { post: Post }) {
  const { m, dir } = useI18n();
  const { open } = useOverlay();
  const attrs = postAttributes(post);
  const labels = attrs.map((a) => m.trust.post[a]);
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={() => open({ kind: "transparency", postId: post.id })}
      aria-label={`${m.trust.stripLabel}: ${labels.join("، ")}. ${m.post.about}`}
      className="group flex w-full items-center gap-2 rounded-2xl py-1.5 text-start hover:bg-surface-2"
    >
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5" aria-hidden>
        {attrs.map((a) => (
          <AttributeTag key={a} attr={a} label={m.trust.post[a]} />
        ))}
      </span>
      <span className="flex shrink-0 items-center gap-0.5 pe-1 text-xs font-medium text-muted group-hover:text-ink" aria-hidden>
        {m.post.about}
        <Chevron className="size-3.5" />
      </span>
    </button>
  );
}
