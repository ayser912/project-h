"use client";

import { useSyncExternalStore } from "react";

/**
 * Current time for rendering. Returns null during server prerendering (so the
 * static shell never bakes in a timestamp) and a 30-second-granular value on
 * the client that ticks while subscribed.
 */
let cached = 0;
function snapshot(): number {
  const t = Date.now();
  if (t - cached >= 30_000) cached = t;
  return cached;
}

function subscribe(notify: () => void) {
  const id = setInterval(notify, 30_000);
  return () => clearInterval(id);
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
