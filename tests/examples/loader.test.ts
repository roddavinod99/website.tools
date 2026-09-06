// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadExampleFor } from '../../src/lib/examples/loader';
import {
  dispatchLoadExampleSpec,
  LOAD_EXAMPLE_EVENT,
} from '../../src/lib/load-example';
import type { ExampleSpec } from '../../src/lib/examples/types';

describe('loadExampleFor', () => {
  it('resolves by numeric index', () => {
    const out = loadExampleFor(['a', 'b', 'c'], 1);
    expect(out).toEqual<ExampleSpec>({ kind: 'text', text: 'b' });
  });

  it('resolves by string key', () => {
    const out = loadExampleFor({ valid: 'ok', errors: 'bad' }, 'errors');
    expect(out).toEqual<ExampleSpec>({ kind: 'text', text: 'bad', key: 'errors' });
  });

  it('returns null on out-of-bounds index', () => {
    expect(loadExampleFor(['a'], 5)).toBeNull();
  });

  it('returns null on missing key', () => {
    expect(loadExampleFor({ a: '1' }, 'b')).toBeNull();
  });

  it('resolves an object-form example', () => {
    const out = loadExampleFor([{ from: 'hi', to: 'aGk=' }], 0);
    expect(out).toEqual<ExampleSpec>({
      kind: 'object',
      state: { from: 'hi', to: 'aGk=' },
    });
  });
});

describe('dispatchLoadExampleSpec', () => {
  beforeEach(() => {
    window.dispatchEvent(new Event('reset')); // no-op
  });
  afterEach(() => {
    // listeners are cleaned up per call but ensure no global state leaks
  });

  it('dispatches a text spec with the text in detail.text', () => {
    const handler = vi.fn();
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
    dispatchLoadExampleSpec('json-formatter', ['{"a":1}'], 0);
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.slug).toBe('json-formatter');
    expect(detail.spec).toEqual<ExampleSpec>({ kind: 'text', text: '{"a":1}' });
    expect(detail.text).toBe('{"a":1}');
    window.removeEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
  });

  it('dispatches an object spec with the state in detail.state', () => {
    const handler = vi.fn();
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
    dispatchLoadExampleSpec('unit-converter', [{ value: '1', fromUnit: 'm', toUnit: 'ft' }], 0);
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.slug).toBe('unit-converter');
    expect(detail.spec).toEqual<ExampleSpec>({
      kind: 'object',
      state: { value: '1', fromUnit: 'm', toUnit: 'ft' },
    });
    expect(detail.state).toEqual({ value: '1', fromUnit: 'm', toUnit: 'ft' });
    expect(detail.text).toBeUndefined();
    window.removeEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
  });

  it('does nothing when the index is out of range', () => {
    const handler = vi.fn();
    window.addEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
    dispatchLoadExampleSpec('json-formatter', ['only-one'], 5);
    expect(handler).not.toHaveBeenCalled();
    window.removeEventListener(LOAD_EXAMPLE_EVENT, handler as EventListener);
  });

  it('does nothing on the server side (no window)', () => {
    // simulate SSR by checking dispatchLoadExampleSpec doesn't throw when window is undefined
    const orig = globalThis.window;
    (globalThis as { window?: unknown }).window = undefined;
    expect(() => dispatchLoadExampleSpec('x', ['y'], 0)).not.toThrow();
    (globalThis as { window?: unknown }).window = orig;
  });
});
