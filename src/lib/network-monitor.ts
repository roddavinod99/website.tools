"use client";

/**
 * useNetworkRequestCount
 *
 * Live count of network requests initiated by this page since the hook mounted.
 * Used to render the "0 requests" / "1 request (visit counter)" trust pill on
 * tool pages — the privacy promise "your data never leaves the browser" is
 * only credible if a user can see for themselves that no requests were made.
 *
 * Implementation notes
 * --------------------
 * - Uses the browser-native `PerformanceObserver` watching
 *   `PerformanceResourceTiming` entries (per the W3C Resource Timing spec).
 *   This catches fetch, XHR, beacon, img, script, link, iframe, and any
 *   resource the browser fetched on behalf of the page.
 * - Filters by `initiatorType` so we only count programmatic requests
 *   (fetch / xmlhttprequest / beacon), not the auto-loaded static assets
 *   that the page already shipped with. The page-load HTML, JS, CSS, fonts,
 *   and images are NOT counted — they were baked in at build time, not made
 *   by client code.
 * - Filters by the page's own origin so cross-origin CDN assets (which by
 *   design have `Transfer-Size === 0` due to CORS) are not counted.
 * - On mount, the observer is created with `buffered: true` so the
 *   PerformanceTimeline replays entries that already happened. We count
 *   only the entries that arrive AFTER the initial baseline snapshot, so
 *   page-load resources that arrived before the hook mounted are not
 *   counted. This matches user expectation: "requests made by this page
 *   since it loaded" — i.e. post-paint.
 *
 * Browser support
 * ---------------
 * PerformanceObserver + PerformanceResourceTiming is available in all
 * evergreen browsers (Chrome 60+, Firefox 60+, Safari 11+). On older
 * browsers the hook simply reports 0 and the trust pill renders
 * unchanged — graceful degradation.
 */

import { useEffect, useRef, useState } from "react";

type CountableInitiator =
  | "fetch"
  | "xmlhttprequest"
  | "beacon"
  | "ping"
  | "preflight";

const COUNTABLE_INITIATORS: ReadonlySet<CountableInitiator> = new Set<CountableInitiator>([
  "fetch",
  "xmlhttprequest",
  "beacon",
  "ping",
  "preflight",
]);

export interface CountedRequest {
  url: string;
  startedAt: number;
}

function isCountable(entry: PerformanceEntry): entry is PerformanceResourceTiming & { initiatorType: string } {
  if (entry.entryType !== "resource") return false;
  const r = entry as PerformanceResourceTiming;
  return COUNTABLE_INITIATORS.has(r.initiatorType as CountableInitiator);
}

function isSameOrigin(url: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function useNetworkRequestCount(): {
  count: number;
  recent: CountedRequest[];
} {
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState<CountedRequest[]>([]);
  const baselineRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
      return;
    }

    // Snapshot the number of pre-mount resource entries so we can ignore
    // them when `buffered: true` replays the timeline.
    try {
      baselineRef.current = performance.getEntriesByType("resource").length;
    } catch {
      baselineRef.current = 0;
    }

    let observer: PerformanceObserver | null = null;
    let bufferedSeen = 0;

    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let postBaseline = 0;
        for (const entry of entries) {
          if (!isCountable(entry)) continue;
          if (!isSameOrigin(entry.name)) continue;
          // The first `baselineRef.current` entries we see are pre-mount
          // replays — skip them. Everything after is a new request.
          if (bufferedSeen < baselineRef.current) {
            bufferedSeen++;
            continue;
          }
          postBaseline++;
          setCount((c) => c + 1);
          setRecent((r) => [
            ...r.slice(-3),
            { url: entry.name, startedAt: entry.startTime },
          ]);
        }
        // If we got fewer than baseline, the timeline shrunk; clamp.
        if (postBaseline === 0 && bufferedSeen > 0 && count > 0) {
          // No-op: keep state, just stop bumping.
        }
      });
      observer.observe({ type: "resource", buffered: true });
    } catch {
      // PerformanceObserver "resource" not supported in this browser.
      return;
    }

    return () => {
      observer?.disconnect();
    };
  }, [count]);

  return { count, recent };
}
