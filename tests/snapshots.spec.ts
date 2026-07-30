import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Visual regression snapshots", () => {
  test("homepage — matches snapshot", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(8000);
    await page.evaluate(() => {
      // Hide ads to prevent layout shifts
      document.querySelectorAll('ins.adsbygoogle').forEach((el: Element) => {
        (el as HTMLElement).style.display = 'none';
      });
      document.querySelectorAll('[id^="google_ads_iframe"]').forEach((el: Element) => {
        (el as HTMLElement).style.display = 'none';
      });
    });
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixels: 200,
      timeout: 10000,
    });
  });

  test("tool page — matches snapshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/json-formatter`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("tool-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("category page — matches snapshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/formatters`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("category-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("blog page — matches snapshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("blog-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
