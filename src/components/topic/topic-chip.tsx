"use client";

import Link from "next/link";
import { topicBySlug } from "@/lib/data/topics";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";
import { TopicIcon } from "./topic-icon";

export function TopicChip({ slug, className }: { slug: string; className?: string }) {
  const { pick, href } = useI18n();
  const topic = topicBySlug.get(slug);
  if (!topic) return null;
  return (
    <Link
      href={href(`/topics/${slug}`)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.8rem] font-medium text-primary-strong hover:bg-accent-soft",
        className,
      )}
    >
      <span aria-hidden>#</span>
      {pick(topic.name)}
    </Link>
  );
}

/** Toggle chip for filters and pickers. */
export function SelectChip({
  selected,
  onClick,
  children,
  icon,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors disabled:opacity-40",
        selected
          ? "bg-secondary text-white"
          : "bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-surface-2",
      )}
    >
      {icon && <TopicIcon name={icon} className="size-4" />}
      {children}
    </button>
  );
}
