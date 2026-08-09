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
  "/blog/how-to-format-json-online",
  "/guides",
  "/guides/getting-started-json",
  "/learning",
  "/tutorials",
  "/best-practices",
  "/search?q=json",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/changelog",
  "/roadmap",
  "/status",
  "/popular",
  "/new",
  "/toolkits/json-toolkit",
  "/sitemap",
];

test.describe("Accessibility audit (@axe-core/playwright)", () => {
  for (const pagePath of PAGES_TO_TEST) {
    test(`${pagePath} — no critical or serious violations`, async ({ page }) => {
      // Keep audits deterministic: block third-party ad/analytics requests so
      // long-lived sockets (ads, GA/GTM pixels) don't stall networkidle.
      await page.route(/googlesyndication\.com|doubleclick\.net|gstatic|cloudflareinsights|google-analytics|googletagmanager|recaptcha|gravatar/, (route) =>
        route.abort().catch(() => {})
      );

      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: "domcontentloaded" });
      await page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => {});
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();

      const criticalSerious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      if (criticalSerious.length > 0) {
        console.log(`\n=== ${pagePath} violations ===`);
        criticalSerious.forEach((v) => {
          console.log(`  ${v.impact}: ${v.id} - ${v.description}`);
          console.log(`    Help: ${v.helpUrl}`);
          console.log(`    Nodes: ${v.nodes.length}`);
          v.nodes.forEach((n) => console.log(`      ${n.html}`));
        });
      }

      expect(criticalSerious.length).toBe(0);
    });
  }
});
