"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { localeMeta, type Bilingual, type Locale } from "./config";
import { messages, type Messages } from "./messages";
import { fmt } from "./format";

interface I18nValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  m: Messages;
  fmt: typeof fmt;
  pick: (v: Bilingual) => string;
  /** Prefix an app path with the current locale. */
  href: (path: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: localeMeta[locale].dir,
      m: messages[locale],
      fmt,
      pick: (v) => v[locale],
      href: (path) => `/${locale}${path === "/" ? "" : path}`,
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
