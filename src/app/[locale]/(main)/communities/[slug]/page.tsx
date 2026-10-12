import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { communities, communityBySlug } from "@/lib/data/topics";
import { isLocale, locales } from "@/i18n/config";
import { CommunityHub } from "@/components/community/community-hub";

export function generateStaticParams() {
  return locales.flatMap((locale) => communities.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/communities/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = communityBySlug.get(slug);
  if (!c || !isLocale(locale)) return {};
  return { title: c.name[locale] };
}

export default async function CommunityPage({ params }: PageProps<"/[locale]/communities/[slug]">) {
  const { slug } = await params;
  const community = communityBySlug.get(slug);
  if (!community) notFound();
  return <CommunityHub community={community} />;
}
