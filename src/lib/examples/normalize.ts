import type { ExampleSpec } from './types';
export type { ExampleSpec } from './types';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function looksLikeObjectRecord(raw: Record<string, unknown>): raw is Record<string, string> {
  for (const v of Object.values(raw)) {
    if (typeof v !== 'string') return false;
  }
  return true;
}

function isKeyedTextRecord(raw: unknown): raw is Record<string, string> {
  if (!isPlainObject(raw)) return false;
  return looksLikeObjectRecord(raw);
}

/**
 * Normalize the raw `examples` value from a tool registry entry into a
 * canonical list of `ExampleSpec` objects.
 *
 * Accepted shapes:
 *
 * 1. `string[]` — each entry becomes a `text` example.
 *    `['hello', 'world']` → `[{ kind: 'text', text: 'hello' }, { kind: 'text', text: 'world' }]`
 *
 * 2. `Record<string, string>` (top-level) — each key becomes a `key` and each
 *    value becomes a `text`. This is the keyed-text shape for tools that
 *    want named buttons (e.g. { valid: '...', errors: '...' }).
 *
 * 3. `Array<{ label?, from?, to?, ... }>` — each object becomes an `object`
 *    example. The `label` is preserved; the rest of the object is the state.
 *
 * 4. `Array<{ label?, text: string }>` — each object becomes a `text` example
 *    with the `label` preserved. (Convenience for registry authors who want
 *    labelled buttons without switching to the keyed-record shape.)
 *
 * 5. `string` (top-level, single) — wrapped into a one-element array of
 *    `text` examples.
 */
export function normalizeExamples(raw: unknown): ExampleSpec[] {
  if (raw == null) return [];

  // Top-level single string → wrap
  if (typeof raw === 'string') {
    return [{ kind: 'text', text: raw }];
  }

  // Top-level object (Record<string, string>) — keyed text
  if (isKeyedTextRecord(raw)) {
    return Object.entries(raw).map(([key, text]) => ({ kind: 'text', text, key }));
  }

  // Array of any kind
  if (Array.isArray(raw)) {
    return raw.map((entry): ExampleSpec => {
      if (typeof entry === 'string') {
        return { kind: 'text', text: entry };
      }
      if (isPlainObject(entry)) {
        const { label, key, text, ...rest } = entry as { label?: string; key?: string; text?: unknown; [k: string]: unknown };
        const extras = { ...(label !== undefined ? { label } : {}), ...(typeof key === 'string' ? { key } : {}) };
        if (typeof text === 'string' && Object.keys(rest).length === 0) {
          // Array<{ label?, key?, text: string }>
          return { kind: 'text', text, ...extras };
        }
        // Array<{ label?, key?, text?, ... }> — state keeps every field except label/key,
        // including text when it accompanies other state (e.g. { text, mode }).
        return {
          kind: 'object',
          state: typeof text === 'string' ? { text, ...rest } : rest,
          ...extras,
        };
      }
      return { kind: 'text', text: String(entry) };
    });
  }

  // Top-level single object — wrap as a one-element object example
  if (isPlainObject(raw)) {
    const { label, ...rest } = raw as { label?: string; [k: string]: unknown };
    return [
      {
        kind: 'object',
        state: rest,
        ...(label !== undefined ? { label } : {}),
      },
    ];
  }

  return [];
}
