import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeedProfileByUsername, seedProfiles } from "@/lib/data/repository";
import { locales } from "@/i18n/config";
import { ProfileView } from "@/components/profile/profile-view";

export function generateStaticParams() {
  return locales.flatMap((locale) => seedProfiles.map((p) => ({ locale, username: p.username })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const p = getSeedProfileByUsername(decodeURIComponent(username));
  return p ? { title: `${p.displayName} (@${p.username})` } : {};
}

export default async function UserPage({ params }: PageProps<"/[locale]/u/[username]">) {
  const { username } = await params;
  const profile = getSeedProfileByUsername(decodeURIComponent(username));
  if (!profile) notFound();
  return <ProfileView profile={profile} />;
}
