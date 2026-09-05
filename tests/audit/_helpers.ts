import { type Page } from '@playwright/test';

export type ToolVariant =
  | 'standard'
  | 'generator'
  | 'image'
  | 'calculator'
  | 'converter'
  | 'diff'
  | 'formatter'
  | 'lookup';

export function detectVariant(slug: string | undefined, _keywords: string[] = []): ToolVariant {
  if (!slug) return 'standard';
  const n = slug.toLowerCase();
  if (n.includes('generator') || n.includes('uuid') || n.includes('password') || n.includes('lorem') || n.includes('random-') || n.includes('ascii') || n.includes('barcode') || n.includes('cron') || n.includes('token') || n.includes('numeronym') || n.startsWith('qr-') || n.endsWith('-qr-generator')) return 'generator';
  if (n.includes('image') || n.includes('qr') || n.endsWith('-qr') || n === 'qr-generator' || n === 'wifi-qr-generator') return 'image';
  if (n.includes('calc') || n.includes('bmi') || n.includes('sip') || n.includes('emi') || n.includes('mortgage') || n.includes('loan') || n.includes('tip') || n.includes('percent')) return 'calculator';
  if (n.includes('convert') || n.includes('encoder') || n.includes('base64') || n.includes('hex') || n.includes('binary')) return 'converter';
  if (n.includes('diff')) return 'diff';
  if (n.includes('format') || n.includes('json') || n.includes('xml') || n.includes('yaml') || n.includes('sql') || n.includes('css') || n.includes('html') || n.includes('minif') || n.includes('beautif') || n.includes('lint') || n.includes('validate') || n.includes('view')) return 'formatter';
  if (n.includes('lookup') || n.includes('dns') || n.includes('whois') || n.includes('ip')) return 'lookup';
  return 'standard';
}

export async function runChecks(page: Page, variant: ToolVariant): Promise<Record<string, 'pass' | 'fail' | 'warn'>> {
  const results: Record<string, 'pass' | 'fail' | 'warn'> = {};
  const url = page.url();

  // pageLoads
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  results.pageLoads = response && response.status() === 200 ? 'pass' : 'fail';

  // noConsoleErrors (collect for 200ms after load)
  const errors: string[] = [];
  const onError = (e: Error) => errors.push(e.message);
  page.on('pageerror', onError);
  await page.waitForTimeout(200);
  page.off('pageerror', onError);
  results.noConsoleErrors = errors.length === 0 ? 'pass' : 'fail';

  // firstTextareaEditable (not for generator)
  if (variant !== 'generator') {
    const ta = page.locator('textarea').first();
    const exists = (await ta.count()) > 0;
    if (!exists) {
      results.firstTextareaEditable = 'warn'; // some tools (e.g. calculator) use input fields
    } else {
      const readonly = await ta.getAttribute('readonly');
      const disabled = await ta.getAttribute('disabled');
      results.firstTextareaEditable = !readonly && !disabled ? 'pass' : 'fail';
    }
  } else {
    results.firstTextareaEditable = 'pass';
  }

  return results;
}

export function summarize(results: Record<string, 'pass' | 'fail' | 'warn'>): 'pass' | 'fail' | 'warn' {
  const vals = Object.values(results);
  if (vals.includes('fail')) return 'fail';
  if (vals.includes('warn')) return 'warn';
  return 'pass';
}
