/**
 * Tiny pub/sub bus for the "load example" affordance.
 *
 * The tool page renders a <TryExamples> button strip below the tool
 * interface. When the user clicks an example, the page dispatches a
 * window-level CustomEvent. Individual tool components subscribe in a
 * useEffect and load the example into their own input state.
 *
 * Why a DOM event instead of a React context?
 * - The tool components are loaded lazily by `dynamic-tool-loader.tsx`,
 *   so they live in a different React tree from the tool page. A
 *   context provider on the page would not reach the dynamic component.
 * - A DOM event is the standard browser-native way to bridge two
 *   independently-mounted React trees, and it has zero bundle cost.
 *
 * Conventions:
 * - Event name: `devstackio:load-example`
 * - detail: { slug: string, text: string }
 * - Tools that opt in check `event.detail.slug === "<their slug>"` before
 *   acting, so the event is harmless for tools that don't subscribe.
 */

import { useEffect } from "react";

export const LOAD_EXAMPLE_EVENT = "devstackio:load-example";

export interface LoadExampleDetail {
  slug: string;
  text: string;
}

export function dispatchLoadExample(slug: string, text: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<LoadExampleDetail>(LOAD_EXAMPLE_EVENT, { detail: { slug, text } }),
  );
}

/**
 * Subscribe a tool component to load-example events. Pass the tool's own
 * slug (used as the address) and a callback that loads `text` into the
 * tool's input. The hook filters out events for other tools.
 *
 * Example:
 *   useLoadExample("json-formatter", (text) => setInput(text));
 */
export function useLoadExample(slug: string, onLoad: (text: string) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<LoadExampleDetail>).detail;
      if (!detail || detail.slug !== slug) return;
      onLoad(detail.text);
    };
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler);
    return () => window.removeEventListener(LOAD_EXAMPLE_EVENT, handler);
  }, [slug, onLoad]);
}

