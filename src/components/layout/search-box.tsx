"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";

export function SearchBox({
  initial = "",
  onSearch,
  className,
  autoFocus,
}: {
  initial?: string;
  /** When omitted, submitting navigates to Explore with ?q=. */
  onSearch?: (q: string) => void;
  className?: string;
  autoFocus?: boolean;
}) {
  const { m, href } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const submit = (value: string) => {
    if (onSearch) onSearch(value);
    else router.push(href(`/explore${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`));
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(q);
      }}
      className={cn("relative", className)}
    >
      <label className="sr-only" htmlFor="ph-search">
        {m.explore.searchLabel}
      </label>
      <Search className="pointer-events-none absolute start-4 top-1/2 size-[1.1rem] -translate-y-1/2 text-muted" aria-hidden />
      <input
        id="ph-search"
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQ(e.target.value);
          if (onSearch) onSearch(e.target.value);
        }}
        placeholder={m.explore.searchPlaceholder}
        enterKeyHint="search"
        dir="auto"
        className="h-12 w-full rounded-full bg-surface-2 ps-11 pe-11 text-[0.95rem] ring-1 ring-inset ring-transparent placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          aria-label={m.explore.clear}
          onClick={() => {
            setQ("");
            submit("");
          }}
          className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-line"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
