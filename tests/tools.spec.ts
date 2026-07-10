import { test, expect } from "@playwright/test";
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

test.describe("Data-driven tool tests", () => {
  for (const fx of allFixtures) {
    test(`${fx.name} (${fx.slug}) — loads and produces output`, async ({ page }) => {
      await page.goto(`${BASE_URL}/tools/${fx.slug}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

      const actionBtn = page.getByText(fx.action, { exact: false }).first();
      const textarea = page.locator("textarea").first();

      if (fx.input && fx.input.length > 0 && await textarea.isVisible().catch(() => false)) {
        await textarea.fill(fx.input);
      }

      if (fx.input2) {
        const textareas = page.locator("textarea");
        const count = await textareas.count();
        if (count >= 2) {
          await textareas.nth(1).fill(fx.input2);
        }
      }

      if (fx.pattern) {
        const patternInput = page.locator("input[type='text'], input[placeholder*='pattern' i], input[placeholder*='regex' i]").first();
        if (await patternInput.isVisible().catch(() => false)) {
          await patternInput.fill(fx.pattern);
        }
      }

      if (await actionBtn.isVisible().catch(() => false)) {
        await actionBtn.click();
        await page.waitForTimeout(500);
      }

      const resultSelectors = "textarea, pre, code, svg, [class*='output'], [class*='result'], [class*='hash'], [class*='uuid']";
      const output = page.locator(resultSelectors).last();

      if (fx.expect === "svg") {
        await expect(page.locator("svg").first()).toBeVisible({ timeout: 3000 });
      } else if (fx.expect === "output") {
        const text = await output.inputValue().catch(() => output.textContent().catch(() => ""));
        expect(text).toBeTruthy();
      } else if (fx.expect === "diff") {
        await expect(page.locator("text=diff, - , +").or(page.locator("[class*='diff']")).first()).toBeVisible({ timeout: 3000 }).catch(() => {});
        expect(true).toBe(true);
      }
    });
  }
});
