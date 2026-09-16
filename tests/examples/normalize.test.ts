import { describe, it, expect } from 'vitest';
import { normalizeExamples, type ExampleSpec } from '../../src/lib/examples/normalize';

describe('normalizeExamples', () => {
  it('normalizes a string array as text examples', () => {
    const out = normalizeExamples(['hello', 'world']);
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'text', text: 'hello' },
      { kind: 'text', text: 'world' },
    ]);
  });

  it('normalizes an object record as keyed text examples', () => {
    const out = normalizeExamples({ valid: '{"a":1}', errors: '{"a":}' });
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'text', text: '{"a":1}', key: 'valid' },
      { kind: 'text', text: '{"a":}', key: 'errors' },
    ]);
  });

  it('normalizes a from/to object as object examples', () => {
    const out = normalizeExamples([{ from: 'hi', to: 'aGk=' }]);
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'object', state: { from: 'hi', to: 'aGk=' } },
    ]);
  });
});
