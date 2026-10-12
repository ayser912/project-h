"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileQuestion } from "lucide-react";
import { ME_ID } from "@/lib/data/demo/profiles";
import { useAllPosts, useDemoState, useHydrated } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { IconButton } from "@/components/ui/button";
import { EmptyState, FeedSkeleton } from "@/components/ui/states";
import { PostCard } from "./post-card";
import { CommentThread } from "./comment-thread";

export function PostDetail({ id }: { id: string }) {
  const { m, dir, href } = useI18n();
  const router = useRouter();
  const hydrated = useHydrated();
  const posts = useAllPosts();
  const state = useDemoState();
  const post = posts.find((p) => p.id === id);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  const visible =
    post &&
    !state.blocked.includes(post.authorId) &&
    post.moderation.status !== "removed" &&
    (post.moderation.status !== "pending_review" || post.authorId === ME_ID);

  return (
    <div>
      <div className="sticky top-14 z-10 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-2 backdrop-blur lg:top-0">
        <IconButton label={m.common.back} onClick={() => (history.length > 1 ? router.back() : router.push(href("/")))}>
          <Back className="size-5" />
        </IconButton>
        <h1 className="font-semibold">{post ? m.postTypes[post.type] : m.post.about}</h1>
      </div>
      {!hydrated && !post ? (
        <FeedSkeleton label={m.common.loading} />
      ) : !visible || !post ? (
        <EmptyState
          icon={<FileQuestion className="size-6" />}
          title={m.post.notFound}
          action={
            <Link href={href("/")} className="font-medium text-primary-strong hover:underline">
              {m.notFound.home}
            </Link>
          }
        />
      ) : (
        <>
          <PostCard post={post} expanded as="div" />
          <CommentThread post={post} />
        </>
      )}
    </div>
  );
}
