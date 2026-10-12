"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import type { PostSource } from "@/lib/types";
import { useI18n } from "@/i18n/provider";

/** Author-supplied references. Explicitly not presented as a review. */
export function SourceList({ sources }: { sources: PostSource[] }) {
  const { m } = useI18n();
  if (!sources.length) {
    return <p className="text-sm text-muted">{m.sources.none}</p>;
  }
  return (
    <div>
      <ul className="space-y-2">
        {sources.map((s) => {
          let host = "";
          try {
            host = new URL(s.url).hostname.replace(/^www\./, "");
          } catch {
            host = s.url;
          }
          return (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group flex items-start gap-3 rounded-2xl p-3 ring-1 ring-line hover:bg-surface-2"
              >
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--ph-sources-bg)", color: "var(--ph-sources)" }}
                >
                  <BookOpen className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium group-hover:underline" dir="auto">
                    {s.title}
                  </span>
                  <span className="block text-xs text-muted" dir="ltr">
                    {s.publisher ? `${s.publisher}, ` : ""}
                    {host}
                  </span>
                </span>
                <ExternalLink className="mt-1 size-4 shrink-0 text-muted" aria-label={m.sources.open} />
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted">{m.sources.notEvaluated}</p>
    </div>
  );
}
