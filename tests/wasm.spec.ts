import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// Minimal valid WebAssembly module (only the 8-byte header). Compiling this
// exercises the 'wasm-unsafe-eval' CSP directive: when absent, Chrome throws
// a SecurityError on instantiation.
const MINIMAL_WASM_BASE64 = "AGFzbQEAAAA=";

async function tryInstantiateWasm(page: import("@playwright/test").Page): Promise<boolean> {
  return page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    try {
      const result = await WebAssembly.instantiate(bytes, {});
      return result.instance !== null;
    } catch {
      return false;
    }
  }, MINIMAL_WASM_BASE64);
}

test.describe("WASM CSP scoping", () => {
  test("WebAssembly instantiation succeeds on /tools page", async ({ page }) => {
    await page.route(/googlesyndication\.com|doubleclick\.net|gstatic|cloudflareinsights|google-analytics|googletagmanager/, (route) =>
      route.abort().catch(() => {})
    );
    await page.goto(`${BASE_URL}/tools/json-formatter`);
    await page.waitForLoadState("networkidle");

    expect(await tryInstantiateWasm(page)).toBe(true);

    const cspHeader = await page.evaluate(async () => {
      const res = await fetch(location.href);
      return res.headers.get("content-security-policy");
    });
    expect(cspHeader).toContain("'wasm-unsafe-eval'");
  });

  test("WebAssembly instantiation is blocked on non-tool pages", async ({ page }) => {
    await page.route(/googlesyndication\.com|doubleclick\.net|gstatic|cloudflareinsights|google-analytics|googletagmanager/, (route) =>
      route.abort().catch(() => {})
    );
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");

    expect(await tryInstantiateWasm(page)).toBe(false);

    const cspHeader = await page.evaluate(async () => {
      const res = await fetch(location.href);
      return res.headers.get("content-security-policy");
    });
    expect(cspHeader).not.toContain("'wasm-unsafe-eval'");
  });
});