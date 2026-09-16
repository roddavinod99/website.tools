import { type Page, type Locator } from "@playwright/test";

// Shared black-box judges for tool pages. Imported by tests/tools.spec.ts
// and tests/audit/*.spec.ts. This module defines no tests itself.

export function getToolSection(page: Page): Locator {
  return page.locator("section").filter({ has: page.locator("h1") }).first();
}

export async function dismissCookieConsent(page: Page): Promise<void> {
  const dialog = page.locator("div[role='dialog'][aria-label='Cookie consent']");
  if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    const acceptBtn = dialog.getByText("Accept All", { exact: false });
    const rejectBtn = dialog.getByText("Reject All", { exact: false });
    if (await acceptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await acceptBtn.click();
    } else if (await rejectBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await rejectBtn.click();
    }
    await dialog.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
  }
}

export async function waitForOutput(page: Page, section: Locator, timeoutMs: number = 8000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const toolOutput = section.locator("[data-testid='tool-output']");
    if (await toolOutput.count() > 0) {
      const visible = await toolOutput.first().isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        const text = await toolOutput.first().textContent().catch(() => "");
        if (text && text.trim().length > 0) return true;
      }
    }

    const visibleImg = await section.locator("img[alt*='QR'], img[alt*='Code'], img[alt*='barcode'], img[src*='data:image'], img[src*='data:image/svg']").first().isVisible({ timeout: 500 }).catch(() => false);
    if (visibleImg) return true;

    const svgCount = await section.locator("div > svg, div svg").count().catch(() => 0);
    if (svgCount > 0) {
      const visibleSvg = await section.locator("div > svg, div svg").first().isVisible({ timeout: 500 }).catch(() => false);
      if (visibleSvg) return true;
    }

    const tableRows = await section.locator("table tbody tr, table thead tr").count().catch(() => 0);
    if (tableRows > 0) return true;

    for (const sel of ["pre", "textarea", "code"]) {
      const els = section.locator(sel);
      const count = await els.count();
      for (let i = 0; i < count; i++) {
        const el = els.nth(i);
        if (!(await el.isVisible().catch(() => false))) continue;
        const text = sel === "textarea"
          ? await el.inputValue().catch(() => el.evaluate((e: HTMLTextAreaElement) => e.value).catch(() => ""))
          : await el.textContent().catch(() => "");
        if (text && text.trim().length > 0) return true;
      }
    }

    const errorBox = section.locator("div:has(> p.text-red-700), div:has(> p.text-red-600), div:has(> p.dark\\:text-red-400), div.border-red-200, div.border-red-800");
    if (await errorBox.count() > 0) {
      const visibleError = await errorBox.first().isVisible({ timeout: 500 }).catch(() => false);
      if (visibleError) return true;
    }

    await page.waitForTimeout(300);
  }
  return false;
}
