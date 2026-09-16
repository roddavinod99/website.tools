import type { ExampleSpec } from './types';
import { normalizeExamples } from './normalize';

/**
 * Resolve a single example from a raw `examples` value by index or key.
 * Returns `null` if no match. Used by the tool page to find the example
 * a deep-link (e.g. `?example=valid` or `?example=0`) refers to.
 */
export function loadExampleFor(
  raw: unknown,
  keyOrIndex: string | number,
): ExampleSpec | null {
  const all = normalizeExamples(raw);
  if (typeof keyOrIndex === 'number') {
    return all[keyOrIndex] ?? null;
  }
  // Keyed lookup first (e.g. ?example=valid). A numeric string (e.g.
  // ?example=0) falls back to positional index so shareable URLs work
  // for plain string[] registries whose specs carry no key.
  const byKey = all.find((e) => e.key === keyOrIndex);
  if (byKey) return byKey;
  if (/^\d+$/.test(keyOrIndex)) {
    return all[Number(keyOrIndex)] ?? null;
  }
  return null;
}
