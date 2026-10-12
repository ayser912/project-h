import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicBySlug, topics } from "@/lib/data/topics";
import { isLocale, locales } from "@/i18n/config";
import { TopicView } from "@/components/topic/topic-view";

export function generateStaticParams() {
  return locales.flatMap((locale) => topics.map((t) => ({ locale, slug: t.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/topics/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = topicBySlug.get(slug);
  if (!topic || !isLocale(locale)) return {};
  return { title: topic.name[locale], description: topic.description[locale] };
}

export default async function TopicPage({ params }: PageProps<"/[locale]/topics/[slug]">) {
  const { slug } = await params;
  const topic = topicBySlug.get(slug);
  if (!topic) notFound();
  return <TopicView topic={topic} />;
}
