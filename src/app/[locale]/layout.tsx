import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "../globals.css";
import { brand } from "@/config/brand";
import { isLocale, localeMeta, locales } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import { OverlayProvider } from "@/components/overlay/overlay-provider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  return {
    title: { default: brand.name, template: `%s | ${brand.name}` },
    description: brand.tagline[l],
    alternates: { languages: { ar: "/ar", en: "/en" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#126B57",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { dir } = localeMeta[locale];

  return (
    <html lang={locale} dir={dir} className="h-full">
      <body className="min-h-full antialiased">
        <I18nProvider locale={locale}>
          <ToastProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
