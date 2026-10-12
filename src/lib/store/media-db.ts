"use client";

import { useEffect, useState } from "react";

/**
 * Device-only media storage for demo mode (IndexedDB).
 * Phase 2 replaces this with Supabase Storage uploads (public bucket for
 * post media, private bucket for verification evidence).
 */
const DB = "projecth-media";
const STORE = "blobs";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putMedia(key: string, blob: Blob): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getMedia(key: string): Promise<Blob | undefined> {
  const db = await open();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

export async function clearMedia(): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* nothing stored */
  }
}

/** Resolve a seeded URL or a device-stored blob to something <img>/<video> can use. */
export function useMediaUrl(src?: string, localKey?: string): string | undefined {
  const [local, setLocal] = useState<{ key: string; url: string } | null>(null);
  useEffect(() => {
    if (!localKey) return;
    let objectUrl: string | undefined;
    let cancelled = false;
    getMedia(localKey)
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setLocal({ key: localKey, url: objectUrl });
      })
      .catch(() => setLocal(null));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localKey]);
  if (!localKey) return src;
  return local?.key === localKey ? local.url : undefined;
}

/**
 * Re-encode an image through a canvas. This drops EXIF metadata (GPS
 * location, camera details) and caps the longest side.
 */
export async function sanitizeImage(
  file: File,
  maxSide = 1600,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.86),
  );
  return { blob, width, height };
}

/** Read duration/size of a video and grab a poster frame. */
export async function inspectVideo(
  file: File,
): Promise<{ duration: number; width: number; height: number; poster?: Blob }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("unreadable video"));
    });
    const { duration, videoWidth: width, videoHeight: height } = video;
    let poster: Blob | undefined;
    try {
      video.currentTime = Math.min(0.5, duration / 2);
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        setTimeout(resolve, 1500);
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);
      poster = await new Promise<Blob | undefined>((r) =>
        canvas.toBlob((b) => r(b ?? undefined), "image/jpeg", 0.8),
      );
    } catch {
      poster = undefined;
    }
    return { duration, width, height, poster };
  } finally {
    URL.revokeObjectURL(url);
  }
}
