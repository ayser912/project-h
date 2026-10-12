"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPinOff } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params?.locale) ? params.locale : "ar";
  const m = messages[locale];
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-12" />
      <MapPinOff className="mt-8 size-8 text-primary" aria-hidden />
      <h1 className="mt-3 text-2xl font-bold">{m.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-muted">{m.notFound.body}</p>
      <Link
        href={`/${locale}`}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-white hover:bg-primary-strong"
      >
        {m.notFound.home}
      </Link>
    </main>
  );
}
