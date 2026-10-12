"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { Post } from "@/lib/types";
import { useMediaUrl } from "@/lib/store/media-db";
import { useProfileResolver } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";

function ClipThumb({ post }: { post: Post }) {
  const { m, href } = useI18n();
  const resolve = useProfileResolver(m.common.you);
  const media = post.media.find((x) => x.kind === "video");
  const poster = useMediaUrl(media?.posterSrc, media?.posterLocalKey);
  const author = resolve(post.authorId);
  if (!media) return null;
  return (
    <li className="w-32 shrink-0 sm:w-36">
      <Link
        href={href(`/watch?start=${post.id}`)}
        className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-secondary"
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="size-full object-cover transition-transform group-hover:scale-[1.03]" />
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 pt-8 text-start">
          <span className="line-clamp-2 text-xs font-medium text-white" dir="auto">
            {post.content}
          </span>
          <span className="mt-1 block truncate text-[0.7rem] text-white/80">{author?.displayName}</span>
        </span>
        <span className="absolute start-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/45 text-white">
          <Play className="size-3.5" fill="currentColor" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

/** Horizontal rail of short videos that opens the full-screen clips viewer. */
export function ClipsRail({ posts }: { posts: Post[] }) {
  const { m, href } = useI18n();
  if (!posts.length) return null;
  return (
    <section aria-labelledby="clips-rail-title" className="border-b border-line py-4">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-5">
        <h2 id="clips-rail-title" className="font-semibold">
          {m.feed.clipsTitle}
        </h2>
        <Link href={href("/watch")} className="text-sm font-medium text-primary-strong hover:underline">
          {m.feed.clipsCta}
        </Link>
      </div>
      <ul className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 sm:px-5">
        {posts.map((p) => (
          <ClipThumb key={p.id} post={p} />
        ))}
      </ul>
    </section>
  );
}
