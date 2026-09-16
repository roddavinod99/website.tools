/**
 * A single example button payload. Two shapes are supported:
 *
 * - `text`: a single string the tool loads into its primary input.
 *   Used by tools that have exactly one user-editable input
 *   (json-formatter, regex-tester, etc.).
 *
 * - `object`: a record of named state the tool applies to its inputs.
 *   Used by tools with two or more inputs (unit converter: value+fromUnit+toUnit,
 *   text transformer: from→to, mortgage calculator: principal+rate+term, etc.).
 *   Tools consume this however they want — there is no fixed schema.
 *
 * `key` is the registry-side identifier (only set when the example was
 * keyed in the registry, e.g. { valid: '...', errors: '...' } → key === 'valid'|'errors').
 * `label` is an optional human-readable label rendered on the button instead
 * of the example text itself (useful for object examples where the state
 * object is too long to render).
 */
export type ExampleSpec =
  | { kind: 'text'; text: string; label?: string; key?: string }
  | { kind: 'object'; state: Record<string, unknown>; label?: string; key?: string };
