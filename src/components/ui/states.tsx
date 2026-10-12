import type { ReactNode } from "react";
import { cn } from "./cn";

/** Empty screens invite an action rather than just stating emptiness. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-accent-soft text-primary">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="animate-pulse border-b border-line px-4 py-5" aria-hidden>
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-surface-2" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-1/3 rounded bg-surface-2" />
          <div className="h-3 w-1/4 rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 rounded bg-surface-2" />
        <div className="h-3 w-5/6 rounded bg-surface-2" />
        <div className="h-3 w-2/3 rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}
