import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('per-route JS budget', () => {
  it('keeps every route under 250KB gzipped', () => {
    if (!existsSync('data/route-js-sizes.json')) return;
    const sizes = JSON.parse(readFileSync('data/route-js-sizes.json', 'utf8'));
    for (const [route, bytes] of Object.entries(sizes)) {
      expect(bytes as number, `${route} exceeds 250KB`).toBeLessThan(250 * 1024);
    }
  });
});
