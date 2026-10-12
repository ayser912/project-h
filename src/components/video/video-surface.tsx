"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { useMediaUrl } from "@/lib/store/media-db";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/components/ui/cn";

function setCaptionMode(video: HTMLVideoElement | null, on: boolean) {
  const track = video?.textTracks?.[0];
  if (track) track.mode = on ? "showing" : "hidden";
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Video with captions, mute and play controls. Pauses whenever it leaves the
 * viewport or its route is hidden. `autoPlayInView` is used by the clips
 * viewer and is ignored when the person prefers reduced motion.
 */
export function VideoSurface({
  media,
  autoPlayInView = false,
  className,
  fit = "cover",
  controlsAt = "bottom",
}: {
  media: MediaItem;
  autoPlayInView?: boolean;
  className?: string;
  fit?: "cover" | "contain";
  /** Full-screen viewer puts controls at the top, clear of the caption overlay. */
  controlsAt?: "top" | "bottom";
}) {
  const { m, locale } = useI18n();
  const ref = useRef<HTMLVideoElement>(null);
  const src = useMediaUrl(media.src, media.localKey);
  const poster = useMediaUrl(media.posterSrc, media.posterLocalKey);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(true);
  const captionSrc = media.captions?.[locale] ?? media.captions?.ar ?? media.captions?.en;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
          el.pause();
        } else if (autoPlayInView && !prefersReducedMotion()) {
          el.play().catch(() => setPlaying(false));
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [autoPlayInView, src]);

  useEffect(() => {
    setCaptionMode(ref.current, captions);
  }, [captions, captionSrc, src]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      <video
        ref={ref}
        src={media.webmSrc ? undefined : src}
        poster={poster}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        aria-label={media.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
      >
        {media.webmSrc && <source src={media.webmSrc} type="video/webm" />}
        {media.webmSrc && src && <source src={src} type="video/mp4" />}
        {captionSrc && (
          <track kind="captions" src={captionSrc} srcLang={locale} label={locale === "ar" ? "العربية" : "English"} default />
        )}
      </video>

      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={m.video.play}
          className="absolute inset-0 flex items-center justify-center bg-black/10"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-secondary shadow-float">
            <Play className="size-7 translate-x-0.5" fill="currentColor" aria-hidden />
          </span>
        </button>
      )}

      <div className={cn("absolute end-3 flex gap-2", controlsAt === "top" ? "top-16" : "bottom-3")}>
        {playing && (
          <ControlButton label={m.video.pause} onClick={toggle}>
            <Pause className="size-4" fill="currentColor" aria-hidden />
          </ControlButton>
        )}
        {media.webmSrc && <source src={media.webmSrc} type="video/webm" />}
        {media.webmSrc && src && <source src={src} type="video/mp4" />}
        {captionSrc && (
          <ControlButton
            label={captions ? m.video.captionsOff : m.video.captionsOn}
            pressed={captions}
            onClick={() => setCaptions((c) => !c)}
          >
            <Captions className="size-4" aria-hidden />
          </ControlButton>
        )}
        <ControlButton label={muted ? m.video.unmute : m.video.mute} onClick={() => setMuted((v) => !v)}>
          {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  pressed,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/70"
    >
      {children}
    </button>
  );
}
