import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// These pages render SSR'd components that historically used inline styles
// blocked by the site's CSP (style-src 'self' 'nonce-...').
const PAGES_TO_TEST = [
  "/",
  "/tools",
  "/tools/json-formatter",
  "/guides/getting-started-json",
  "/blog/how-to-format-json-online",
  "/categories/formatters",
];

test.describe("CSP inline-style audit", () => {
  for (const pagePath of PAGES_TO_TEST) {
    test(`${pagePath} — no CSP style violations and no blocked SSR inline styles`, async ({ page }) => {
      // Keep the test deterministic: block third-party ad/analytics requests that
      // inject runtime styles/iframes unrelated to our SSR output.
      await page.route(/googlesyndication\.com|doubleclick\.net|googleusercontent|gstatic|cloudflareinsights|google-analytics|googletagmanager|recaptcha/, (route) =>
        route.abort().catch(() => {})
      );

      const cspViolations: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && msg.text().includes("Applying inline style") && msg.text().includes("Content Security Policy")) {
          cspViolations.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);

      // Re-assert the policy is still strict (guard against 'unsafe-inline' regressions).
      const cspHeader = await page.evaluate(async () => {
        const res = await fetch(location.href);
        return res.headers.get("content-security-policy");
      });
      expect(cspHeader).toBeTruthy();
      expect(cspHeader).not.toContain("'unsafe-inline'");

      // No SSR'd inline style attributes may remain on app-owned elements:
      // ad containers, ad <ins> units, and table-of-contents items.
      const offenders = await page.evaluate(() => {
        const results: string[] = [];
        const describe = (el: Element) =>
          `${el.tagName}:${(el.getAttribute("class") ?? "").trim().slice(0, 60)}`;
        document.querySelectorAll('[role="complementary"][aria-label^="Advert"], ins.adsbygoogle').forEach((el) => {
          if (el.hasAttribute("style")) results.push(`AD ${describe(el)}`);
        });
        document
          .querySelectorAll('nav[aria-label="Table of contents"] a, [data-search-result]')
          .forEach((el) => {
            if (el.hasAttribute("style")) results.push(`UI ${describe(el)}`);
          });
        return results;
      });

      expect(cspViolations).toEqual([]);
      expect(offenders).toEqual([]);
    });
  }
});