"use client";

import { useNow } from "@/lib/hooks/use-now";
import { useI18n } from "@/i18n/provider";
import { formatDate, formatRelative } from "@/i18n/format";

/** "3h ago" on the client; a stable absolute date in the prerendered shell. */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const { locale } = useI18n();
  const now = useNow();
  return (
    <time dateTime={iso} title={formatDate(iso, locale)} className={className}>
      {now === null ? formatDate(iso, locale) : formatRelative(iso, locale, now)}
    </time>
  );
}
