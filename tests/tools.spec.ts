import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { waitForOutput, getToolSection, dismissCookieConsent } from "./helpers/tool-page";

export { waitForOutput, getToolSection, dismissCookieConsent };

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

async function fillReactInput(locator: Locator, value: string): Promise<void> {
  await locator.click();
  await locator.selectText();
  await locator.pressSequentially(value, { delay: 5 });
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
