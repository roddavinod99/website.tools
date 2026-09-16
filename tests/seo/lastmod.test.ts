import { describe, it, expect } from 'vitest';
import { getLastModified } from '../../src/lib/seo/lastmod';

describe('getLastModified', () => {
  it('returns an ISO 8601 string', () => {
    const v = getLastModified('json-formatter', 'tool');
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
