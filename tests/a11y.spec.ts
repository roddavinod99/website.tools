import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = "http://localhost:3000";

const PAGES_TO_TEST = [
  "/",
  "/tools",
  "/tools/json-formatter",
  "/tools/uuid-generator",
  "/tools/base64",
  "/tools/hash-generator",
  "/tools/qr-generator",
  "/tools/jwt-decoder",
  "/tools/password-generator",
  "/tools/url-encoder",
  "/categories",
  "/categories/formatters",
  "/categories/encoders",
  "/blog",
  "/blog/building-developer-tools-platform",
];

test.describe("Accessibility audit (@axe-core/playwright)", () => {
  for (const pagePath of PAGES_TO_TEST) {
    test(`${pagePath} — no critical or serious violations`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();

      const criticalSerious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      expect(criticalSerious.length).toBe(0);
    });
  }
});
