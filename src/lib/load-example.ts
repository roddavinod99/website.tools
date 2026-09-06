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
 *
 * Long-tail landing pages (PR 1 / PR 2 of the rapidtables-alternative
 * plan: PLAN.md) need a richer prefill — the unit converter, for
 * example, wants to prefill { value, fromUnit, toUnit, category }, not
 * just a single string. A second event `devstackio:prefill-tool` carries
 * the full Record<string, string> so the tool can apply it however it
 * wants. Tools that don't subscribe are unaffected.
 */

import { useEffect } from "react";
import type { ExampleSpec } from "./examples/types";
import { normalizeExamples } from "./examples/normalize";

export const LOAD_EXAMPLE_EVENT = "devstackio:load-example";
export const PREFILL_TOOL_EVENT = "devstackio:prefill-tool";

/**
 * Event detail for the "load example" event.
 *
 * Carries the full normalized `spec` plus a backwards-compatible `text`
 * field for tools that only have a single input. Object-form examples
 * (e.g. unit converter prefill { value, fromUnit, toUnit }) put their
 * full state in `spec.state` and leave `text` undefined.
 */
export interface LoadExampleDetail {
  slug: string;
  spec: ExampleSpec;
  text?: string;
  state?: Record<string, unknown>;
}

export interface PrefillToolDetail {
  slug: string;
  prefill: Record<string, string>;
}

/**
 * Dispatch a `devstackio:load-example` event with a single-string example.
 * Backwards-compatible shim — the event detail also includes a synthetic
 * `spec: { kind: 'text', text }` so subscribers that read the spec can use
 * the same code path as multi-input examples.
 */
export function dispatchLoadExample(slug: string, text: string) {
  if (typeof window === "undefined") return;
  const spec: ExampleSpec = { kind: "text", text };
  const detail: LoadExampleDetail = { slug, spec, text };
  window.dispatchEvent(new CustomEvent<LoadExampleDetail>(LOAD_EXAMPLE_EVENT, { detail }));
}

/**
 * Dispatch a `devstackio:load-example` event with a normalized spec
 * resolved from the raw `examples` registry value. Used by the tool page
 * to send a single example button click to a tool.
 */
export function dispatchLoadExampleSpec(
  slug: string,
  raw: unknown,
  keyOrIndex: string | number,
) {
  if (typeof window === "undefined") return;
  const all = normalizeExamples(raw);
  const spec = typeof keyOrIndex === "number" ? all[keyOrIndex] : all.find((e) => e.key === keyOrIndex);
  if (!spec) return;
  const detail: LoadExampleDetail = { slug, spec };
  if (spec.kind === "text") detail.text = spec.text;
  else detail.state = spec.state;
  window.dispatchEvent(new CustomEvent<LoadExampleDetail>(LOAD_EXAMPLE_EVENT, { detail }));
}

export function dispatchPrefillTool(slug: string, prefill: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PrefillToolDetail>(PREFILL_TOOL_EVENT, { detail: { slug, prefill } }),
  );
}

/**
 * Subscribe a tool component to load-example events. Pass the tool's own
 * slug (used as the address) and a callback that loads the example's
 * `text` into the tool's primary input. The hook filters out events for
 * other tools and ignores object-form examples (subscribe to
 * `useLoadExampleState` instead for those).
 *
 * Backwards-compatible: existing single-input tools that read `(text) => ...`
 * continue to work unchanged.
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
      if (typeof detail.text === "string") onLoad(detail.text);
    };
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler);
    return () => window.removeEventListener(LOAD_EXAMPLE_EVENT, handler);
  }, [slug, onLoad]);
}

/**
 * Subscribe to object-form load-example events. Tools with two or more
 * inputs (unit converter, BMI, mortgage, text transformer) consume the
 * full state object. Use this alongside or instead of `useLoadExample`.
 *
 * Example:
 *   useLoadExampleState("unit-converter", (state) => {
 *     setValue(String(state.value ?? ''));
 *     setFromUnit(String(state.fromUnit ?? ''));
 *     setToUnit(String(state.toUnit ?? ''));
 *   });
 */
export function useLoadExampleState(
  slug: string,
  onLoad: (state: Record<string, unknown>) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<LoadExampleDetail>).detail;
      if (!detail || detail.slug !== slug) return;
      if (detail.state) onLoad(detail.state);
    };
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler);
    return () => window.removeEventListener(LOAD_EXAMPLE_EVENT, handler);
  }, [slug, onLoad]);
}

/**
 * Subscribe a tool to prefill events. Unlike useLoadExample which only
 * passes a single string, this passes the full Record<string, string>
 * the landing-page route forwarded. Tools that have multi-input UIs
 * (unit converter, mortgage calculator, BMI) subscribe here.
 */
export function usePrefillTool(
  slug: string,
  onPrefill: (prefill: Record<string, string>) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<PrefillToolDetail>).detail;
      if (!detail || detail.slug !== slug) return;
      onPrefill(detail.prefill);
    };
    window.addEventListener(PREFILL_TOOL_EVENT, handler);
    return () => window.removeEventListener(PREFILL_TOOL_EVENT, handler);
  }, [slug, onPrefill]);
}

