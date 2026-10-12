"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { brand } from "@/config/brand";
import { topics } from "@/lib/data/topics";
import { actions, useDemoState } from "@/lib/store/demo-store";
import { LOCALE_COOKIE, localeMeta, locales } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Logo } from "@/components/brand/logo";
import { TopicIcon } from "@/components/topic/topic-icon";

/**
 * Journey A, steps 1–5: choose language, then private interests.
 * Registration and username selection plug in between these steps in phase 2.
 * We never ask about diagnoses or conditions.
 */
export function OnboardingFlow() {
  const { m, locale, pick, href, fmt } = useI18n();
  const router = useRouter();
  const state = useDemoState();
  const [step, setStep] = useState<1 | 2>(1);
  const [picked, setPicked] = useState<string[] | null>(null);
  const selected = picked ?? state.interests;

  const finish = (save: boolean) => {
    if (save) actions.setInterests(selected);
    actions.completeOnboarding();
    router.push(href("/"));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <p className="text-sm text-muted">{fmt(m.onboarding.step, { i: step, n: 2 })}</p>
      </div>

      {step === 1 ? (
        <main className="flex flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{fmt(m.onboarding.welcome, { app: brand.name })}</h1>
          <p className="mt-3 max-w-md text-lg text-muted">{m.onboarding.tagline}</p>
          <h2 className="mt-10 text-sm font-semibold">{m.onboarding.chooseLanguage}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}/onboarding`}
                hrefLang={l}
                lang={l}
                onClick={() => {
                  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
                }}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-[var(--radius-sheet)] p-5 text-xl font-semibold ring-1 ring-inset transition-colors",
                  l === locale ? "bg-accent-soft ring-2 ring-primary" : "bg-surface ring-line hover:bg-surface-2",
                )}
              >
                {localeMeta[l].label}
                {l === locale && <Check className="size-5 text-primary" aria-hidden />}
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" onClick={() => setStep(2)}>
              {m.onboarding.continue}
            </Button>
          </div>
        </main>
      ) : (
        <main className="flex flex-1 flex-col py-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{m.onboarding.interestsTitle}</h1>
          <p className="mt-2 flex items-start gap-2 text-muted">
            <Lock className="mt-1 size-4 shrink-0" aria-hidden />
            {m.onboarding.interestsHint}
          </p>
          <fieldset className="mt-6">
            <legend className="sr-only">{m.onboarding.interestsTitle}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {topics.map((t) => {
                const on = selected.includes(t.slug);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setPicked(on ? selected.filter((x) => x !== t.slug) : [...selected, t.slug])
                    }
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl p-3 text-start text-sm font-medium ring-1 ring-inset transition-colors",
                      on ? "bg-secondary text-white ring-secondary" : "bg-surface ring-line hover:bg-surface-2",
                    )}
                  >
                    <TopicIcon name={t.icon} className={cn("size-5 shrink-0", on ? "text-accent" : "text-primary")} />
                    {pick(t.name)}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="sticky bottom-0 mt-auto flex items-center gap-3 bg-bg pt-6 pb-2">
            <p className="flex-1 text-sm text-muted" aria-live="polite">
              {fmt(m.onboarding.selected, { n: selected.length })}
            </p>
            <Button variant="ghost" onClick={() => finish(false)}>
              {m.onboarding.skip}
            </Button>
            <Button size="lg" onClick={() => finish(true)}>
              {m.onboarding.finish}
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
