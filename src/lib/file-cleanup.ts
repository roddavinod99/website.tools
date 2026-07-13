const trackedURLs = new Set<string>();
let initialized = false;

export function trackObjectURL(url: string): string {
  trackedURLs.add(url);
  return url;
}

export function revokeObjectURL(url: string): void {
  if (trackedURLs.has(url)) {
    URL.revokeObjectURL(url);
    trackedURLs.delete(url);
  }
}

export function revokeAllObjectURLs(): void {
  for (const url of trackedURLs) {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
  trackedURLs.clear();
}

function cleanupOnLeave(): void {
  revokeAllObjectURLs();
  if (typeof window !== "undefined" && window.gc) {
    try {
      window.gc();
    } catch {}
  }
}

export function initCleanupListeners(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeunload", cleanupOnLeave);
  window.addEventListener("pagehide", cleanupOnLeave);

  if ("onpageswap" in window) {
    window.addEventListener("pageswap", cleanupOnLeave);
  }
}

export function getTrackedURLCount(): number {
  return trackedURLs.size;
}
