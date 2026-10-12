import { seedPosts } from "@/lib/data/repository";
import { locales } from "@/i18n/config";
import { PostDetail } from "@/components/post/post-detail";

/**
 * Seeded posts are prerendered. Posts created on this device (demo mode) are
 * rendered on request and resolved client-side from local storage; in
 * phase 2 every post resolves from the database here instead.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => seedPosts.map((p) => ({ locale, id: p.id })));
}

export default async function PostPage({ params }: PageProps<"/[locale]/post/[id]">) {
  const { id } = await params;
  return <PostDetail id={id} />;
}
