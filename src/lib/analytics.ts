"use client";

type AnalyticsEvent = {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  timestamp: number;
};

const ANALYTICS_KEY = "devstackio_analytics";
const MAX_EVENTS = 100;

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const events = getStoredEvents();
    events.push(event);
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    sessionStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {}
}

export function trackEvent(event: string, options?: { category?: string; label?: string; value?: number }): void {
  const analyticsEvent: AnalyticsEvent = {
    event,
    category: options?.category,
    label: options?.label,
    value: options?.value,
    timestamp: Date.now(),
  };
  storeEvent(analyticsEvent);

  // Also push to dataLayer if available (GTM)
  if (typeof window !== "undefined" && "dataLayer" in window) {
    (window as unknown as { dataLayer: Array<Record<string, unknown>> }).dataLayer.push({
      event,
      event_category: options?.category,
      event_label: options?.label,
      value: options?.value,
    });
  }
}

export function trackToolUsage(toolSlug: string, action: "view" | "use" | "copy" | "export"): void {
  trackEvent("tool_interaction", {
    category: "tools",
    label: `${toolSlug}:${action}`,
  });
}

export function trackSearch(query: string, resultCount: number): void {
  trackEvent("search", {
    category: "navigation",
    label: query,
    value: resultCount,
  });
}

export function trackPageView(path: string): void {
  trackEvent("page_view", {
    category: "navigation",
    label: path,
  });
}

export function trackError(error: string, source?: string): void {
  trackEvent("error", {
    category: "error",
    label: source ? `${source}: ${error}` : error,
  });
}

export function trackPerformance(metric: string, value: number): void {
  trackEvent("performance", {
    category: "performance",
    label: metric,
    value,
  });
}

export function getAnalyticsSummary(): Record<string, number> {
  const events = getStoredEvents();
  const summary: Record<string, number> = {};
  events.forEach((e) => {
    summary[e.event] = (summary[e.event] || 0) + 1;
  });
  return summary;
}
