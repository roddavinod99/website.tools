import { describe, it, expect } from 'vitest';
import { expandQuery, SYNONYMS } from '../../src/lib/search/synonyms';

describe('expandQuery', () => {
  it('expands uuid to guid and keeps the original term first', () => {
    const out = expandQuery('uuid');
    expect(out[0]).toBe('uuid');
    expect(out).toContain('guid');
  });

  it('lowercases input before expansion', () => {
    expect(expandQuery('UUID')).toContain('guid');
  });

  it('returns [] for empty or blank queries', () => {
    expect(expandQuery('')).toEqual([]);
    expect(expandQuery('   ')).toEqual([]);
  });

  it('adds no junk terms when no synonym matches', () => {
    expect(expandQuery('json formatter')).toEqual(['json', 'formatter']);
  });

  it('dedupes overlapping synonym sets', () => {
    expect(expandQuery('uuid guid')).toEqual(['uuid', 'guid']);
  });

  it('exposes a bidirectional core map', () => {
    expect(SYNONYMS['guid']).toContain('uuid');
    expect(SYNONYMS['js']).toContain('javascript');
  });
});
