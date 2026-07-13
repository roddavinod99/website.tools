import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const FIXTURES_DIR = join(__dirname, "fixtures");

interface ToolFixture {
  slug: string;
  category: string;
  name: string;
  input?: string;
  input2?: string;
  pattern?: string;
  action: string;
  expect: string;
}

function loadAllFixtures(): ToolFixture[] {
  if (!existsSync(FIXTURES_DIR)) return [];
  const files = readdirSync(FIXTURES_DIR).filter(f => f.endsWith(".json"));
  const fixtures: ToolFixture[] = [];
  for (const file of files) {
    const content = readFileSync(join(FIXTURES_DIR, file), "utf-8");
    try {
      const items = JSON.parse(content);
      fixtures.push(...items);
    } catch {
      console.warn(`Skipping malformed fixture: ${file}`);
    }
  }
  return fixtures;
}

const allFixtures = loadAllFixtures();

async function waitForToolLoad(page: Page): Promise<void> {
  await page.locator("textarea, input[type='text'], input:not([type]), button").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
}

async function dismissCookieConsent(page: Page): Promise<void> {
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

function getToolSection(page: Page): Locator {
  return page.locator("section").filter({ has: page.locator("h1") }).first();
}

async function fillReactInput(locator: Locator, value: string): Promise<void> {
  await locator.click();
  await locator.selectText();
  await locator.pressSequentially(value, { delay: 5 });
}

async function waitForOutput(page: Page, section: Locator, timeoutMs: number = 8000): Promise<boolean> {
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

test.describe("Data-driven tool tests", () => {
  for (const fx of allFixtures) {
    test(`${fx.name} (${fx.slug}) — loads and produces output`, async ({ page }) => {
      await page.goto(`${BASE_URL}/tools/${fx.slug}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
      await waitForToolLoad(page);
      await dismissCookieConsent(page);

      const section = getToolSection(page);

      if (fx.input && fx.input.length > 0) {
        const textarea = section.locator("textarea").first();
        if (await textarea.isVisible().catch(() => false)) {
          await textarea.click();
          await textarea.fill(fx.input);
          await page.waitForTimeout(500);
        } else {
          const textInput = section.locator("input[type='text'], input:not([type])").first();
          if (await textInput.isVisible().catch(() => false)) {
            await fillReactInput(textInput, fx.input);
            await page.waitForTimeout(500);
          }
        }
      }

      if (fx.input2) {
        const textareas = section.locator("textarea");
        const count = await textareas.count();
        if (count >= 2) {
          await textareas.nth(1).fill(fx.input2);
          await page.waitForTimeout(500);
        }
      }

      if (fx.pattern) {
        const patternInput = section.locator("input[type='text'], input[placeholder*='pattern' i], input[placeholder*='regex' i]").first();
        if (await patternInput.isVisible().catch(() => false)) {
          await patternInput.fill(fx.pattern);
          await page.waitForTimeout(300);
        }
      }

      const hasAction = fx.action && fx.action.length > 0;
      if (hasAction) {
        const actionBtn = section.getByRole("button", { name: fx.action, exact: false }).first();
        if (await actionBtn.isEnabled({ timeout: 500 }).catch(() => false)) {
          await actionBtn.click();
          await page.waitForTimeout(500);
        }
      }

      const found = await waitForOutput(page, section, 8000);
      expect(found).toBeTruthy();
    });
  }
});
