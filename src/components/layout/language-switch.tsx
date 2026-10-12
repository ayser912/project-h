"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { LOCALE_COOKIE, switchLocalePath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";

/** Switches language on the same page and remembers the choice. */
export function LanguageSwitch({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { m, locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const to = locale === "ar" ? "en" : "ar";
  const qs = search?.toString();
  const target = `${switchLocalePath(pathname, to)}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={target}
      hrefLang={to}
      lang={to}
      aria-label={m.nav.languageLabel}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-ink ring-1 ring-inset ring-line-strong hover:bg-surface-2",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      {!compact && m.nav.language}
      {compact && <span>{to === "en" ? "EN" : "ع"}</span>}
    </Link>
  );
}
