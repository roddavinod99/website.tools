import { describe, it, expect } from 'vitest';
import { getRelatedTools } from '../../src/lib/links/related';
import { allTools } from '../../src/lib/data/tools';

describe('getRelatedTools', () => {
  it('returns N tools from the same category first', () => {
    const me = allTools.find((t) => t.slug === 'json-formatter')!;
    const out = getRelatedTools(me, 8);
    expect(out).toHaveLength(8);
    expect(out[0]!.category).toBe(me.category);
  });

  it('excludes the tool itself', () => {
    const me = allTools.find((t) => t.slug === 'json-formatter')!;
    const out = getRelatedTools(me, 8);
    expect(out.find((t) => t.slug === me.slug)).toBeUndefined();
  });
});
