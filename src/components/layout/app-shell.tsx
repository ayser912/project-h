"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Bell, SquarePlus } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";
import { Logo, LogoMark } from "@/components/brand/logo";
import { primaryNav, secondaryNav, useIsActive } from "./nav-items";
import { LanguageSwitch } from "./language-switch";
import { DemoBanner } from "./demo-banner";
import { DiscoveryAside } from "./discovery-aside";

/**
 * Responsive application frame.
 *  - Mobile: top bar + sticky bottom navigation.
 *  - Desktop: navigation sidebar on the reading-start side (right in Arabic,
 *    left in English — CSS grid follows `dir`), central column, discovery panel.
 */
export function AppShell({ children, aside = true }: { children: ReactNode; aside?: boolean }) {
  const { m } = useI18n();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-float"
      >
        {m.nav.skip}
      </a>

      <div
        className={cn(
          "mx-auto lg:grid lg:justify-center lg:gap-6",
          aside
            ? "lg:grid-cols-[15.5rem_minmax(0,40rem)] xl:grid-cols-[16rem_minmax(0,40rem)_20rem]"
            : "lg:grid-cols-[15.5rem_minmax(0,46rem)]",
        )}
      >
        <SideNav />

        <div className="min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-10">
          <MobileTopBar />
          <DemoBanner />
          <main id="main" tabIndex={-1} className="min-h-[60vh] bg-surface lg:border-x lg:border-line lg:min-h-dvh">
            {children}
          </main>
        </div>

        {aside && (
          <aside className="hidden xl:block">
            <div className="sticky top-0 max-h-dvh overflow-y-auto no-scrollbar">
              <Suspense>
                <DiscoveryAside />
              </Suspense>
            </div>
          </aside>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function SideNav() {
  const { m, href } = useI18n();
  const isActive = useIsActive();
  return (
    <nav aria-label={m.nav.main} className="hidden lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-1 py-5">
        <Link href={href("/")} className="mb-5 self-start rounded-2xl px-3 py-1">
          <Logo />
        </Link>
        {[...primaryNav.filter((n) => n.key !== "create"), ...secondaryNav].map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={href(item.path)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3.5 rounded-full px-4 text-[1.02rem] transition-colors",
                active ? "bg-accent-soft font-semibold text-secondary" : "text-ink hover:bg-surface-2",
              )}
            >
              <Icon className="size-[1.4rem]" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
              {m.nav[item.key]}
            </Link>
          );
        })}
        <Link
          href={href("/create")}
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-white hover:bg-primary-strong"
        >
          <SquarePlus className="size-5" aria-hidden />
          {m.nav.create}
        </Link>
        <div className="mt-auto px-1">
          <Suspense>
            <LanguageSwitch />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}

function MobileTopBar() {
  const { m, href } = useI18n();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur lg:hidden">
      <Link href={href("/")} aria-label={m.nav.home} className="rounded-xl">
        <LogoMark className="size-8" />
      </Link>
      <span className="flex-1" />
      <Suspense>
        <LanguageSwitch compact />
      </Suspense>
      <Link
        href={href("/notifications")}
        aria-label={m.nav.notifications}
        className="flex size-11 items-center justify-center rounded-full text-ink hover:bg-surface-2"
      >
        <Bell className="size-[1.35rem]" aria-hidden />
      </Link>
    </header>
  );
}

function BottomNav() {
  const { m, href } = useI18n();
  const isActive = useIsActive();
  return (
    <nav
      aria-label={m.nav.main}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {primaryNav.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const isCreate = item.key === "create";
          return (
            <li key={item.key}>
              <Link
                href={href(item.path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 text-[0.7rem]",
                  active ? "font-semibold text-secondary" : "text-muted",
                )}
              >
                {isCreate ? (
                  <span className="flex h-8 w-12 items-center justify-center rounded-full bg-primary text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                ) : (
                  <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                )}
                {m.nav[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
