import { localeMeta, type Bilingual, type Locale } from "./config";

/** Replace {name} placeholders. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function pick(value: Bilingual, locale: Locale): string {
  return value[locale];
}

export function formatCompact(n: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMeta[locale].intl).format(n);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    year: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/** "3h", "2 days ago" style relative time, compact enough for post headers. */
export function formatRelative(iso: string, locale: Locale, now = Date.now()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(localeMeta[locale].intl, {
    numeric: "auto",
    style: "short",
  });
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSec / 86400), "day");
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}
