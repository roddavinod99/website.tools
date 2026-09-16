import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Prose } from '../../src/components/ui/prose';

describe('Prose', () => {
  it('exports Prose component', () => {
    expect(Prose).toBeDefined();
    expect(typeof Prose).toBe('function');
  });

  it('highlight-theme.css exists with token-driven colors', () => {
    const cssPath = join(process.cwd(), 'src/styles/highlight-theme.css');
    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toContain('--hl-keyword');
    expect(css).toContain('.hljs');
    expect(css).toContain('var(--hl-');
  });

  it('prose globals exist', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8');
    expect(css).toContain('.prose');
    expect(css).toContain('.prose h2');
  });
});
