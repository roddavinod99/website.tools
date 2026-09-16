import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

async function stabilizePage(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    // Hide ads to prevent layout shifts
    document.querySelectorAll('ins.adsbygoogle').forEach((el: Element) => {
      (el as HTMLElement).style.display = 'none';
    });
    document.querySelectorAll('[id^="google_ads_iframe"]').forEach((el: Element) => {
      (el as HTMLElement).style.display = 'none';
    });
    // The visit counter is a live value; mask it so snapshots are deterministic
    document.querySelectorAll('[data-testid="visit-counter"]').forEach((el: Element) => {
      (el as HTMLElement).style.display = 'none';
    });
  });
  await page.waitForTimeout(1500);
}

test.describe("Visual regression snapshots", () => {
  test("homepage — matches snapshot", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(8000);
    await stabilizePage(page);
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
    await stabilizePage(page);
    await expect(page).toHaveScreenshot("tool-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("category page — matches snapshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/formatters`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await stabilizePage(page);
    await expect(page).toHaveScreenshot("category-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("blog page — matches snapshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await stabilizePage(page);
    await expect(page).toHaveScreenshot("blog-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("P2-10 redesign baseline — every page type, both themes", () => {
  const targets = [
    { name: "homepage", url: "/", theme: "light" },
    { name: "homepage-dark", url: "/", theme: "dark" },
    { name: "tool-standard", url: "/tools/json-formatter", theme: "light" },
    { name: "tool-standard-dark", url: "/tools/json-formatter", theme: "dark" },
    { name: "category", url: "/categories/formatters", theme: "light" },
    { name: "listing", url: "/tools", theme: "light" },
    { name: "guide", url: "/guides/concepts/json-basics", theme: "light" },
    { name: "blog", url: "/blog/base64-encode-decode-online", theme: "light" },
    { name: "compare", url: "/compare/base64-vs-url-encoding", theme: "light" },
    { name: "search", url: "/search?q=json", theme: "light" },
    { name: "404", url: "/this-does-not-exist-xyz", theme: "light" },
  ] as const;

  for (const t of targets) {
    test(`snapshot ${t.name}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: t.theme as "light" | "dark" });
      await page.goto(`${BASE_URL}${t.url}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await stabilizePage(page);
      await expect(page).toHaveScreenshot(`redesign/${t.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01, animations: "disabled" });
    });
  }
});
