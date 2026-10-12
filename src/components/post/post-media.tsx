"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";
import type { MediaItem, Post } from "@/lib/types";
import { useMediaUrl } from "@/lib/store/media-db";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";
import { VideoSurface } from "@/components/video/video-surface";

function PostImage({ media, className }: { media: MediaItem; className?: string }) {
  const url = useMediaUrl(media.src, media.localKey);
  return (
    <div className={cn("overflow-hidden bg-surface-2", className)}>
      {url ? (
        // Plain <img>: seeded SVGs and device blobs can't go through the
        // image optimiser. Phase 2 switches to next/image for storage URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full" aria-label={media.alt} role="img" />
      )}
    </div>
  );
}

export function PostMedia({ post }: { post: Post }) {
  const { m, href } = useI18n();
  const items = post.media;
  if (!items.length) return null;

  const video = items.find((i) => i.kind === "video");
  if (video) {
    return (
      <div className="mt-3">
        <VideoSurface
          media={video}
          className="aspect-[4/5] max-h-[34rem] w-full rounded-[var(--radius-media)] sm:aspect-[3/4]"
        />
        <Link
          href={href(`/watch?start=${post.id}`)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm font-medium text-primary-strong hover:underline"
        >
          <Clapperboard className="size-4" aria-hidden />
          {m.video.openViewer}
        </Link>
      </div>
    );
  }

  const images = items.filter((i) => i.kind === "image").slice(0, 4);
  if (images.length === 1) {
    const img = images[0];
    // Clamp tall images so one post can't take over the screen.
    const ratio = Math.max(img.width / img.height, 0.8);
    return (
      <div className="mt-3" style={{ aspectRatio: String(ratio) }}>
        <PostImage media={img} className="size-full rounded-[var(--radius-media)]" />
      </div>
    );
  }
  return (
    <div className="mt-3 grid aspect-[3/2] grid-cols-2 gap-1 overflow-hidden rounded-[var(--radius-media)]">
      {images.map((img, i) => (
        <PostImage
          key={i}
          media={img}
          className={cn(images.length === 3 && i === 0 && "row-span-2", images.length === 2 && "row-span-2")}
        />
      ))}
    </div>
  );
}
