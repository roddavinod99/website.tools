import { describe, it, expect } from 'vitest';
import { buildCompare } from '../../src/lib/compare/build';

describe('buildCompare', () => {
  it('builds a comparison with two tools, properties, and a verdict', () => {
    const data = buildCompare('json-formatter', 'xml-formatter');
    expect(data).not.toBeNull();
    expect(data!.left.slug).toBe('json-formatter');
    expect(data!.right.slug).toBe('xml-formatter');
    expect(data!.rows.length).toBeGreaterThan(0);
  });

  it('normalizes to alphabetical order', () => {
    const a = buildCompare('xml-formatter', 'json-formatter');
    const b = buildCompare('json-formatter', 'xml-formatter');
    expect(a!.canonical).toBe(b!.canonical);
  });
});
