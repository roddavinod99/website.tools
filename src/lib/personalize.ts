"use client";

import { useCallback, useSyncExternalStore } from "react";

const PINNED_KEY = "devstackio:pinned-tools";
const RECENT_KEY = "devstackio:recent-tools";
const MAX_PINNED = 24;
const MAX_RECENT = 8;
const EMPTY: string[] = [];
const ALL_KEYS = [PINNED_KEY, RECENT_KEY] as const;

function parseStringArray(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return EMPTY;
    const out: string[] = [];
    for (const x of arr) {
      if (typeof x === "string") out.push(x);
    }
    return out;
  } catch {
    return EMPTY;
  }
}

function readArray(key: string): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    return parseStringArray(window.localStorage.getItem(key));
  } catch {
    return EMPTY;
  }
}

function writeArray(key: string, value: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded, private mode, storage disabled — silent fallback
  }
}

// Module-level snapshot caches so useSyncExternalStore sees a stable
// reference between renders. Invalidated by the storage event.
let pinnedCache: string[] | null = null;
let recentCache: string[] | null = null;

function getPinnedSnapshot(): string[] {
  if (pinnedCache === null) pinnedCache = readArray(PINNED_KEY);
  return pinnedCache;
}

function getRecentSnapshot(): string[] {
  if (recentCache === null) recentCache = readArray(RECENT_KEY);
  return recentCache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function dispatchPersonalizeEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("devstackio:personalize-change"));
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key && (ALL_KEYS as readonly string[]).includes(e.key)) {
      if (e.key === PINNED_KEY) pinnedCache = null;
      if (e.key === RECENT_KEY) recentCache = null;
      callback();
    }
  };
  const onLocal = () => {
    pinnedCache = null;
    recentCache = null;
    callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("devstackio:personalize-change", onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("devstackio:personalize-change", onLocal);
  };
}

export function usePinnedTools(): {
  pinned: string[];
  isPinned: (slug: string) => boolean;
  toggle: (slug: string) => void;
  clear: () => void;
} {
  const pinned = useSyncExternalStore(subscribe, getPinnedSnapshot, getServerSnapshot);

  const isPinned = useCallback((slug: string) => pinned.includes(slug), [pinned]);

  const toggle = useCallback((slug: string) => {
    const current = getPinnedSnapshot();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [slug, ...current].slice(0, MAX_PINNED);
    writeArray(PINNED_KEY, next);
    pinnedCache = next;
    dispatchPersonalizeEvent();
  }, []);

  const clear = useCallback(() => {
    writeArray(PINNED_KEY, []);
    pinnedCache = EMPTY;
    dispatchPersonalizeEvent();
  }, []);

  return { pinned, isPinned, toggle, clear };
}

export function useRecentTools(): {
  recent: string[];
  record: (slug: string) => void;
  clear: () => void;
} {
  const recent = useSyncExternalStore(subscribe, getRecentSnapshot, getServerSnapshot);

  const record = useCallback((slug: string) => {
    const current = getRecentSnapshot();
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX_RECENT);
    writeArray(RECENT_KEY, next);
    recentCache = next;
    dispatchPersonalizeEvent();
  }, []);

  const clear = useCallback(() => {
    writeArray(RECENT_KEY, []);
    recentCache = EMPTY;
    dispatchPersonalizeEvent();
  }, []);

  return { recent, record, clear };
}

export const PINNED_STORAGE_KEY = PINNED_KEY;
export const RECENT_STORAGE_KEY = RECENT_KEY;
export const MAX_PINNED_TOOLS = MAX_PINNED;
export const MAX_RECENT_TOOLS = MAX_RECENT;

/**
 * One-shot helper to record a tool view. Use this from event handlers or
 * `useEffect` callbacks — not from render. Writes directly to localStorage
 * and dispatches the personalize change event so subscribed hooks re-render.
 */
export function recordToolView(slug: string, limit: number = MAX_RECENT): void {
  if (typeof window === "undefined") return;
  try {
    const current = readArray(RECENT_KEY);
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, limit);
    writeArray(RECENT_KEY, next);
    recentCache = next;
    dispatchPersonalizeEvent();
  } catch {
    // silent
  }
}
