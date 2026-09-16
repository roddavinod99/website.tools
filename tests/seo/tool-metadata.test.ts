import { describe, it, expect } from 'vitest';
import { buildToolMetadata } from '../../src/lib/seo/tool-metadata';

const tool = { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and beautify JSON in your browser. Nothing is sent.' };

describe('buildToolMetadata', () => {
  it('builds a title with action verb in the form "{Name} — {description excerpt} | DevStackIO"', () => {
    const m = buildToolMetadata(tool);
    expect(m.title).toMatch(/^JSON Formatter — .+ \| DevStackIO$/);
    expect(m.title.length).toBeLessThanOrEqual(60);
  });
  it('uses the description as-is when within 160 chars', () => {
    const m = buildToolMetadata(tool);
    expect(m.description).toBe(tool.description);
    expect(m.description.length).toBeLessThanOrEqual(160);
  });
  it('truncates descriptions longer than 160 chars to 157 + ellipsis', () => {
    const long = 'A'.repeat(200);
    const m = buildToolMetadata({ ...tool, description: long });
    expect(m.description.length).toBe(160);
    expect(m.description.endsWith('…')).toBe(true);
  });
  it('sets canonical to absolute site URL with no trailing slash', () => {
    const m = buildToolMetadata(tool);
    expect(m.canonical).toBe('https://tools.devstackio.com/tools/json-formatter');
  });
});
