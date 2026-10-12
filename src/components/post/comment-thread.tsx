"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { Post } from "@/lib/types";
import { ME_ID } from "@/lib/data/demo/profiles";
import { actions, useCommentsFor, useMeProfile, useProfileResolver } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/states";
import { RelativeTime } from "@/components/ui/relative-time";
import { useToast } from "@/components/ui/toast";
import { AuthorBadge } from "@/components/trust/author-badge";

const MAX = 1000;

export function CommentThread({ post }: { post: Post }) {
  const { m, href, fmt, locale } = useI18n();
  const comments = useCommentsFor(post.id);
  const resolve = useProfileResolver(m.common.you);
  const me = useMeProfile(m.common.you);
  const toast = useToast();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    if (value.length > MAX) {
      setError(fmt(m.comments.tooLong, { n: MAX }));
      return;
    }
    actions.addComment({ postId: post.id, content: value, language: /[؀-ۿ]/.test(value) ? "ar" : "en" });
    setText("");
    setError(null);
    toast(m.comments.sent);
  };

  return (
    <section id="comments" aria-labelledby="comments-title" className="scroll-mt-16">
      <h2 id="comments-title" className="px-4 pt-5 text-lg font-semibold sm:px-5">
        {m.comments.title}
      </h2>

      <form
        className="border-b border-line px-4 py-4 sm:px-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar profile={me} size="sm" />
          <div className="min-w-0 flex-1">
            <label htmlFor="comment-input" className="sr-only">
              {m.comments.placeholder}
            </label>
            <textarea
              id="comment-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
              rows={2}
              dir="auto"
              placeholder={m.comments.placeholder}
              aria-describedby="comment-hint"
              aria-invalid={!!error}
              className="w-full resize-none rounded-2xl bg-surface-2 p-3 text-[0.95rem] ring-1 ring-inset ring-transparent placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <p id="comment-hint" className="min-w-0 flex-1 text-xs text-muted">
                {error ? <span className="text-danger">{error}</span> : m.comments.reminder}
              </p>
              <button
                type="submit"
                disabled={!text.trim()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-strong disabled:bg-line-strong disabled:text-muted"
              >
                <Send className="size-4 rtl:-scale-x-100" aria-hidden />
                {m.comments.send}
              </button>
            </div>
          </div>
        </div>
      </form>

      {comments.length === 0 ? (
        <EmptyState icon={<MessageCircle className="size-6" />} title={m.comments.empty} />
      ) : (
        <ul>
          {comments.map((c) => {
            const author = resolve(c.authorId);
            if (!author) return null;
            const to = c.authorId === ME_ID ? href("/profile") : href(`/u/${author.username}`);
            return (
              <li key={c.id} className="flex gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                <Link href={to} tabIndex={-1} aria-hidden>
                  <Avatar profile={author} size="sm" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5" lang={locale}>
                    <Link href={to} className="truncate text-sm font-semibold hover:underline" dir="auto">
                      {author.displayName}
                    </Link>
                    <AuthorBadge profile={author} />
                    <RelativeTime iso={c.createdAt} className="shrink-0 text-xs text-muted" />
                  </div>
                  <p className="post-text mt-0.5 text-[0.95rem]" dir="auto" lang={c.language}>
                    {c.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
