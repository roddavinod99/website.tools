import { type ConsoleMessage, type Page } from '@playwright/test';

type SmokeStatus = 'pass' | 'fail' | 'not-run';

// These checks establish initial load health only. They do not exercise tool
// inputs, correctness, copy/export, or errors triggered by later interaction.
export async function runChecks(page: Page, slug: string, timeout = 10000) {
  const checks: Record<string, SmokeStatus> = {
    pageLoads: 'not-run', workspaceLoads: 'not-run', noBrowserErrors: 'not-run',
  };
  const errors: string[] = [];
  const browserErrors: string[] = [];
  const onError = (error: Error) => browserErrors.push(error.message);
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  };
  page.on('pageerror', onError);
  page.on('console', onConsole);
  try {
    const response = await page.goto(`/tools/${slug}`, { waitUntil: 'domcontentloaded', timeout });
    checks.pageLoads = response?.status() === 200 ? 'pass' : 'fail';
    if (checks.pageLoads === 'fail') errors.push(`HTTP status: ${response?.status() ?? 'no response'}`);
    checks.workspaceLoads = 'fail';
    // Observe the actual loader's DOM, not the surrounding page or a fixed delay.
    const ready = await page.waitForFunction(id => {
      const workspace = document.getElementById(id);
      if (!workspace || workspace.getBoundingClientRect().height === 0 ||
          getComputedStyle(workspace).visibility === 'hidden') return false;
      const text = workspace.textContent?.trim() ?? '';
      if (text.includes('Loading tool...') || text.includes('Tool interface coming soon')) return false;
      return text.length > 0 || !!workspace.querySelector('input, textarea, select, button, canvas, img');
    }, `tool-interface-${slug}`, { timeout });
    await ready.dispose();
    checks.workspaceLoads = 'pass';
  } catch (error) {
    if (checks.pageLoads === 'not-run') checks.pageLoads = 'fail';
    errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    page.off('pageerror', onError);
    page.off('console', onConsole);
    checks.noBrowserErrors = browserErrors.length ? 'fail' : 'pass';
    errors.push(...browserErrors);
  }
  return { checks, errors };
}
