"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Clapperboard,
  FileText,
  Hourglass,
  ImagePlus,
  Info,
  MessageCircleQuestion,
  Plus,
  ShieldAlert,
  Trash2,
  UserRound,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ContentLanguage, MediaItem, Post, PostSource, PostType } from "@/lib/types";
import { topics } from "@/lib/data/topics";
import { ME_ID } from "@/lib/data/demo/profiles";
import { screenPost } from "@/lib/safety/screen";
import { actions, newId } from "@/lib/store/demo-store";
import { inspectVideo, putMedia, sanitizeImage } from "@/lib/store/media-db";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { SelectChip } from "@/components/topic/topic-chip";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";
import { PostCard } from "@/components/post/post-card";

const MAX_TEXT = 2000;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 90;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const TYPE_ICONS: Record<PostType, LucideIcon> = {
  standard: FileText,
  video: Clapperboard,
  experience: UserRound,
  question: MessageCircleQuestion,
  educational: BookOpen,
};
const TYPES: PostType[] = ["standard", "video", "experience", "question", "educational"];

interface DraftMedia {
  id: string;
  kind: "image" | "video";
  blob: Blob;
  previewUrl: string;
  alt: string;
  width: number;
  height: number;
  duration?: number;
  poster?: Blob;
  posterUrl?: string;
}

function detectLanguage(text: string): ContentLanguage {
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic >= latin ? "ar" : "en";
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !!u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function Composer() {
  const { m, pick, href, fmt } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const initialType = (params?.get("type") as PostType) ?? "standard";
  const initialTopic = params?.get("topic");

  const [type, setType] = useState<PostType>(TYPES.includes(initialType) ? initialType : "standard");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<ContentLanguage | "auto">("auto");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialTopic && topics.some((t) => t.slug === initialTopic) ? [initialTopic] : [],
  );
  const [media, setMedia] = useState<DraftMedia[]>([]);
  const [sources, setSources] = useState<PostSource[]>([]);
  const [sponsored, setSponsored] = useState(false);
  const [partner, setPartner] = useState("");
  const [patientConfirmed, setPatientConfirmed] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [publishing, setPublishing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const draftId = useRef<string | null>(null);

  // Revoke preview URLs on unmount.
  const mediaRef = useRef(media);
  useEffect(() => {
    mediaRef.current = media;
  }, [media]);
  useEffect(
    () => () =>
      mediaRef.current.forEach((d) => {
        URL.revokeObjectURL(d.previewUrl);
        if (d.posterUrl) URL.revokeObjectURL(d.posterUrl);
      }),
    [],
  );

  const resolvedLanguage = language === "auto" ? detectLanguage(text) : language;
  const validSources = sources.filter((s) => s.url.trim() || s.title.trim());
  const screening = useMemo(
    () => screenPost({ content: text, type, sourceCount: validSources.filter((s) => isHttpsUrl(s.url)).length }),
    [text, type, validSources],
  );

  const errors = {
    text: !text.trim() ? m.create.errors.empty : text.length > MAX_TEXT ? fmt(m.create.errors.tooLong, { max: MAX_TEXT }) : null,
    topics: selectedTopics.length === 0 ? m.create.errors.noTopic : null,
    video: type === "video" && !media.some((d) => d.kind === "video") ? m.create.errors.videoRequired : null,
    sources: validSources.some((s) => !isHttpsUrl(s.url)) ? m.create.errors.badUrl : null,
    partner: sponsored && !partner.trim() ? m.create.errors.partnerRequired : null,
    patient: screening.patientInfo.length > 0 && !patientConfirmed ? m.create.screening.patientTitle : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const changeType = (t: PostType) => {
    setType(t);
    // Video posts carry one clip; other types carry photos.
    setMedia((current) => {
      const keep = current.filter((d) => (t === "video" ? d.kind === "video" : d.kind === "image"));
      current.filter((d) => !keep.includes(d)).forEach((d) => URL.revokeObjectURL(d.previewUrl));
      return keep;
    });
  };

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    setMediaError(null);
    const list = Array.from(files);
    if (media.length + list.length > MAX_IMAGES) {
      setMediaError(m.create.errors.tooManyImages);
      return;
    }
    const added: DraftMedia[] = [];
    for (const file of list) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setMediaError(fmt(m.create.errors.fileType, { name: file.name }));
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setMediaError(fmt(m.create.errors.fileSize, { name: file.name }));
        continue;
      }
      try {
        const { blob, width, height } = await sanitizeImage(file);
        added.push({ id: newId("img"), kind: "image", blob, previewUrl: URL.createObjectURL(blob), alt: "", width, height });
      } catch {
        setMediaError(fmt(m.create.errors.fileType, { name: file.name }));
      }
    }
    setMedia((cur) => [...cur, ...added]);
  };

  const addVideo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setMediaError(null);
    if (!VIDEO_TYPES.includes(file.type)) return setMediaError(fmt(m.create.errors.fileType, { name: file.name }));
    if (file.size > MAX_VIDEO_BYTES) return setMediaError(fmt(m.create.errors.fileSize, { name: file.name }));
    try {
      const info = await inspectVideo(file);
      if (info.duration > MAX_VIDEO_SECONDS) return setMediaError(m.create.errors.videoDuration);
      media.forEach((d) => URL.revokeObjectURL(d.previewUrl));
      setMedia([
        {
          id: newId("vid"),
          kind: "video",
          blob: file,
          previewUrl: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^.]+$/, ""),
          width: info.width || 720,
          height: info.height || 1280,
          duration: info.duration,
          poster: info.poster,
          posterUrl: info.poster ? URL.createObjectURL(info.poster) : undefined,
        },
      ]);
    } catch {
      setMediaError(fmt(m.create.errors.fileType, { name: file.name }));
    }
  };

  const buildPost = (mediaItems: MediaItem[]): Post => {
    draftId.current ??= newId("post");
    return {
      id: draftId.current,
      authorId: ME_ID,
      type,
      content: text.trim(),
      language: resolvedLanguage,
      createdAt: new Date().toISOString(),
      version: 1,
      topics: selectedTopics,
      media: mediaItems,
      sources: validSources
        .filter((s) => isHttpsUrl(s.url))
        .map((s) => ({ title: s.title.trim() || new URL(s.url).hostname, url: s.url.trim() })),
      sponsor: sponsored && partner.trim() ? { partner: partner.trim() } : undefined,
      moderation: { status: screening.status, risk: screening.risk },
      counts: { likes: 0, comments: 0, saves: 0, shares: 0 },
      isDemo: false,
    };
  };

  const previewPost = useMemo(
    () =>
      mode === "preview"
        ? buildPost(
            media.map((d) => ({
              kind: d.kind,
              src: d.previewUrl,
              posterSrc: d.posterUrl,
              alt: d.alt || pick({ ar: "صورة مرفقة", en: "Attached image" }),
              width: d.width,
              height: d.height,
              durationSec: d.duration,
            })),
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode],
  );

  const reset = () => {
    media.forEach((d) => URL.revokeObjectURL(d.previewUrl));
    setText("");
    setMedia([]);
    setSources([]);
    setSponsored(false);
    setPartner("");
    setPatientConfirmed(false);
    setSelectedTopics([]);
    setMode("edit");
    setShowErrors(false);
    draftId.current = null;
  };

  const publish = async () => {
    if (hasErrors) {
      setShowErrors(true);
      setMode("edit");
      return;
    }
    setPublishing(true);
    try {
      const items: MediaItem[] = [];
      for (const d of media) {
        const key = `${d.id}`;
        await putMedia(key, d.blob);
        let posterLocalKey: string | undefined;
        if (d.poster) {
          posterLocalKey = `${d.id}-poster`;
          await putMedia(posterLocalKey, d.poster);
        }
        items.push({
          kind: d.kind,
          localKey: key,
          posterLocalKey,
          alt: d.alt.trim() || pick({ ar: "صورة مرفقة", en: "Attached image" }),
          width: d.width,
          height: d.height,
          durationSec: d.duration,
        });
      }
      const post = buildPost(items);
      actions.addPost(post);
      toast(post.moderation.status === "pending_review" ? m.create.publishedPending : m.create.published);
      reset();
      router.push(href(`/post/${post.id}`));
    } catch {
      setMediaError(m.create.errors.storage);
    } finally {
      setPublishing(false);
    }
  };

  const discard = () => {
    const dirty = text.trim() || media.length || sources.length;
    if (dirty && !window.confirm(m.create.discardConfirm)) return;
    reset();
    router.push(href("/"));
  };

  const fieldError = (msg: string | null) =>
    showErrors && msg ? (
      <p role="alert" className="mt-1.5 text-sm text-danger">
        {msg}
      </p>
    ) : null;

  return (
    <div>
      <div className="sticky top-14 z-10 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-5 lg:top-0">
        <h1 className="flex-1 text-lg font-semibold">{m.create.title}</h1>
        <Button variant="ghost" size="sm" onClick={discard}>
          {m.create.discard}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setMode(mode === "edit" ? "preview" : "edit")} aria-pressed={mode === "preview"}>
          {mode === "edit" ? m.create.preview : m.create.editDraft}
        </Button>
        <Button size="sm" onClick={publish} disabled={publishing}>
          {publishing ? m.create.publishing : m.create.publish}
        </Button>
      </div>

      {showErrors && hasErrors && (
        <p role="alert" className="mx-4 mt-4 rounded-2xl bg-danger-bg p-3 text-sm text-danger sm:mx-5">
          {m.create.errors.fixFirst}
        </p>
      )}

      {mode === "preview" && previewPost ? (
        <div>
          <p className="px-4 pt-4 text-sm font-medium text-muted sm:px-5">{m.create.previewTitle}</p>
          <PostCard post={previewPost} as="div" />
          <ScreeningNotes screening={screening} />
        </div>
      ) : (
        <form
          className="space-y-6 px-4 py-5 sm:px-5"
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
        >
          {/* Type */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{m.create.typeLabel}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES.map((t) => {
                const Icon = TYPE_ICONS[t];
                const selected = t === type;
                return (
                  <label
                    key={t}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-2xl p-3 ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                      selected ? "bg-accent-soft ring-primary" : "ring-line hover:bg-surface-2",
                    )}
                  >
                    <input
                      type="radio"
                      name="post-type"
                      value={t}
                      checked={selected}
                      onChange={() => changeType(t)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className={cn("size-4", selected ? "text-primary" : "text-muted")} aria-hidden />
                      {m.postTypes[t]}
                    </span>
                    <span className="text-xs leading-5 text-muted">{m.create.typeHints[t]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Text */}
          <div>
            <label htmlFor="composer-text" className="mb-2 block text-sm font-semibold">
              {m.create.text}
            </label>
            <textarea
              id="composer-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              dir="auto"
              placeholder={m.create.placeholders[type]}
              aria-invalid={showErrors && !!errors.text}
              aria-describedby="composer-count"
              className="w-full resize-y rounded-2xl bg-surface-2 p-4 text-[1rem] leading-7 ring-1 ring-inset ring-transparent placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted">
              <label>
                {m.create.language}:{" "}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as ContentLanguage | "auto")}
                  className="rounded-lg bg-transparent py-1 font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="auto">
                    {fmt(m.create.autoLanguage, { lang: m.create.languages[detectLanguage(text)] })}
                  </option>
                  <option value="ar">{m.create.languages.ar}</option>
                  <option value="en">{m.create.languages.en}</option>
                </select>
              </label>
              <span id="composer-count" className={cn(text.length > MAX_TEXT && "font-semibold text-danger")}>
                {fmt(m.create.count, { n: text.length, max: MAX_TEXT })}
              </span>
            </div>
            {fieldError(errors.text)}
            <ScreeningNotes screening={screening} />
            {screening.patientInfo.length > 0 && (
              <label className="mt-2 flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={patientConfirmed}
                  onChange={(e) => setPatientConfirmed(e.target.checked)}
                  className="mt-1 size-4 accent-[var(--ph-primary)]"
                />
                {m.create.screening.patientConfirm}
              </label>
            )}
          </div>

          {/* Media */}
          <section aria-labelledby="media-title">
            <h2 id="media-title" className="mb-2 text-sm font-semibold">
              {m.create.media}
            </h2>
            <div className="flex flex-wrap gap-2">
              {type !== "video" ? (
                <Button
                  variant="secondary"
                  onClick={() => imageInput.current?.click()}
                  disabled={media.length >= MAX_IMAGES}
                >
                  <ImagePlus className="size-4" aria-hidden />
                  {m.create.addImage}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => videoInput.current?.click()}>
                  <Video className="size-4" aria-hidden />
                  {m.create.addVideo}
                </Button>
              )}
              <input
                ref={imageInput}
                type="file"
                accept={IMAGE_TYPES.join(",")}
                multiple
                hidden
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={videoInput}
                type="file"
                accept={VIDEO_TYPES.join(",")}
                hidden
                onChange={(e) => {
                  addVideo(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {m.create.mediaRules} {m.create.stripNote}
            </p>
            {mediaError && (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {mediaError}
              </p>
            )}
            {fieldError(errors.video)}
            {media.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-3">
                {media.map((d) => (
                  <li key={d.id} className="overflow-hidden rounded-2xl ring-1 ring-line">
                    <div className="relative aspect-square bg-surface-2">
                      {d.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.previewUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <video src={d.previewUrl} poster={d.posterUrl} muted playsInline controls className="size-full object-cover" />
                      )}
                      <button
                        type="button"
                        aria-label={m.create.remove}
                        onClick={() => {
                          URL.revokeObjectURL(d.previewUrl);
                          setMedia((cur) => cur.filter((x) => x.id !== d.id));
                        }}
                        className="absolute end-2 top-2 flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                    {d.kind === "image" && (
                      <label className="block p-2">
                        <span className="sr-only">{m.create.altLabel}</span>
                        <input
                          value={d.alt}
                          maxLength={300}
                          dir="auto"
                          placeholder={m.create.altLabel}
                          onChange={(e) =>
                            setMedia((cur) => cur.map((x) => (x.id === d.id ? { ...x, alt: e.target.value } : x)))
                          }
                          className="h-9 w-full rounded-lg bg-surface-2 px-2.5 text-xs placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Topics */}
          <fieldset>
            <legend className="text-sm font-semibold">{m.create.topics}</legend>
            <p className="mb-2 text-xs text-muted">{m.create.topicsHint}</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => {
                const selected = selectedTopics.includes(t.slug);
                return (
                  <SelectChip
                    key={t.slug}
                    icon={t.icon}
                    selected={selected}
                    disabled={!selected && selectedTopics.length >= 3}
                    onClick={() =>
                      setSelectedTopics((cur) => (selected ? cur.filter((x) => x !== t.slug) : [...cur, t.slug]))
                    }
                  >
                    {pick(t.name)}
                  </SelectChip>
                );
              })}
            </div>
            {fieldError(errors.topics)}
          </fieldset>

          {/* Sources */}
          {type !== "experience" && type !== "question" && (
            <section aria-labelledby="sources-title">
              <h2 id="sources-title" className="text-sm font-semibold">
                {m.create.sources}{" "}
                {type !== "educational" && <span className="font-normal text-muted">({m.common.optional})</span>}
              </h2>
              <p className="mb-2 text-xs text-muted">{m.create.sourcesHint}</p>
              <ul className="space-y-2">
                {sources.map((s, i) => (
                  <li key={i} className="flex flex-col gap-2 rounded-2xl p-3 ring-1 ring-line sm:flex-row">
                    <input
                      value={s.title}
                      onChange={(e) =>
                        setSources((cur) => cur.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                      }
                      placeholder={m.create.sourceTitle}
                      aria-label={m.create.sourceTitle}
                      dir="auto"
                      maxLength={200}
                      className="h-10 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      value={s.url}
                      onChange={(e) =>
                        setSources((cur) => cur.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                      }
                      placeholder={m.create.sourceUrl}
                      aria-label={m.create.sourceUrl}
                      dir="ltr"
                      type="url"
                      inputMode="url"
                      maxLength={500}
                      aria-invalid={!!s.url && !isHttpsUrl(s.url)}
                      className="h-10 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger"
                    />
                    <button
                      type="button"
                      aria-label={m.create.remove}
                      onClick={() => setSources((cur) => cur.filter((_, j) => j !== i))}
                      className="flex size-10 shrink-0 items-center justify-center self-end rounded-full text-muted hover:bg-surface-2 sm:self-auto"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              {sources.length < 5 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSources((s) => [...s, { title: "", url: "" }])}>
                  <Plus className="size-4" aria-hidden />
                  {m.create.addSource}
                </Button>
              )}
              {fieldError(errors.sources)}
            </section>
          )}

          {/* Sponsorship */}
          <section>
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                checked={sponsored}
                onChange={(e) => setSponsored(e.target.checked)}
                className="size-4 accent-[var(--ph-primary)]"
              />
              {m.create.sponsored}
            </label>
            {sponsored && (
              <input
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder={m.create.sponsoredPartner}
                aria-label={m.create.sponsoredPartner}
                dir="auto"
                maxLength={120}
                className="mt-2 h-11 w-full rounded-xl bg-surface-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            {fieldError(errors.partner)}
          </section>

          {/* Guidance */}
          <aside className="rounded-[var(--radius-sheet)] bg-surface-2 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Info className="size-4 text-primary" aria-hidden />
              {m.create.guidanceTitle}
            </h2>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted marker:text-primary">
              {m.create.guidance.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{m.safety.emergency}</p>
          </aside>

          <div className="flex justify-end gap-2 pb-4">
            <Button variant="secondary" onClick={() => setMode("preview")}>
              {m.create.preview}
            </Button>
            <Button type="submit" disabled={publishing}>
              {publishing ? m.create.publishing : m.create.publish}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  function ScreeningNotes({ screening: s }: { screening: ReturnType<typeof screenPost> }) {
    if (!text.trim()) return null;
    const kinds = s.patientInfo.map((f) => m.create.screening.kinds[f.kind]).join(pick({ ar: "، ", en: ", " }));
    return (
      <div className="mt-3 space-y-2" aria-live="polite">
        {s.patientInfo.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-danger-bg p-3 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            <div>
              <p className="font-semibold text-danger">{m.create.screening.patientTitle}</p>
              <p className="text-ink">{fmt(m.create.screening.patientBody, { kinds })}</p>
            </div>
          </div>
        )}
        {s.status === "pending_review" && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-pending-bg p-3 text-sm">
            <Hourglass className="mt-0.5 size-4 shrink-0 text-pending" aria-hidden />
            <div>
              <p className="font-semibold text-pending">{m.create.screening.pendingTitle}</p>
              <p className="text-ink">{m.create.screening.pendingBody}</p>
              <p className="mt-1 text-xs text-muted">{m.create.screening.note}</p>
            </div>
          </div>
        )}
        {s.risk === "moderate" && (
          <p className="flex items-start gap-2 rounded-2xl p-3 text-sm ring-1 ring-line" style={{ color: "var(--ph-sources)" }}>
            <BookOpen className="mt-0.5 size-4 shrink-0" aria-hidden />
            {m.create.screening.moderateBody}
          </p>
        )}
      </div>
    );
  }
}
