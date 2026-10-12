export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Arabic is the primary language of the product. */
export const defaultLocale: Locale = "ar";

/** Cookie remembering an explicit language choice. */
export const LOCALE_COOKIE = "ph_locale";

export const localeMeta: Record<
  Locale,
  { dir: "rtl" | "ltr"; label: string; intl: string }
> = {
  // Western digits read more consistently next to usernames and URLs.
  // Switch to "ar-JO" to use Arabic-Indic digits.
  ar: { dir: "rtl", label: "العربية", intl: "ar-JO-u-nu-latn" },
  en: { dir: "ltr", label: "English", intl: "en-GB" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** A value written in both product languages. */
export type Bilingual = { ar: string; en: string };

/** Swap the locale prefix of an app path, keeping the rest. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = to;
    return parts.join("/") || `/${to}`;
  }
  return `/${to}${pathname === "/" ? "" : pathname}`;
}
