import { brand } from "@/config/brand";
import { cn } from "@/components/ui/cn";

/**
 * Placeholder mark for the working name. The H's crossbar doubles as a
 * speech bubble: health, as a conversation. Replace with the final brand.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <rect width="40" height="40" rx="12" fill="var(--ph-primary)" />
      <rect x="10" y="9" width="5" height="22" rx="2.5" fill="#fff" />
      <rect x="25" y="9" width="5" height="22" rx="2.5" fill="#fff" />
      <path d="M13 17.5h14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-8l-3.5 3v-3H13a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2Z" fill="var(--ph-accent)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-secondary" dir="ltr">
        {brand.name}
      </span>
    </span>
  );
}
