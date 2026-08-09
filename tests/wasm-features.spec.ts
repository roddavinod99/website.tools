import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// "hello world" is a well-known vector for both algorithms.
const VECTOR_INPUT = "hello world";
const SHA224_HELLO_WORLD = "2f05477fc24bb4faefd86517156dafdecec45b8ad3cf2522a563582b";
const SHA256_HELLO_WORLD = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

async function blockExternalRequests(page: import("@playwright/test").Page) {
  await page.route(
    /googlesyndication\.com|doubleclick\.net|gstatic|cloudflareinsights|google-analytics|googletagmanager/,
    (route) => route.abort().catch(() => {})
  );
}

// These tools use WASM for SHA-224 (WebCrypto has no SHA-224) with a pure-JS
// fallback. The tests assert the user-facing result equals the known vector
// regardless of which path (wasm or JS fallback) produced it. This is where
// the "must fall back gracefully when WASM is unavailable" requirement lands.
test.describe("WASM-gated hashing tools", () => {
  test("file-checksum text mode SHA-224 matches the reference vector", async ({ page }) => {
    await blockExternalRequests(page);
    await page.goto(`${BASE_URL}/tools/file-checksum`);
    await page.waitForLoadState("networkidle");

    // SHA-224 is off by default; enable it before computing.
    await page.getByLabel("SHA-224").check();

    await page.getByPlaceholder("Or type/paste text to compute its checksum...").fill(VECTOR_INPUT);
    await page.getByRole("button", { name: "Compute" }).click();

    const sha224Row = page.locator("div.flex.items-center.rounded.border").filter({ hasText: "SHA-224" });
    await expect(sha224Row.locator("code")).toContainText(SHA224_HELLO_WORLD, { timeout: 10000 });
  });

  test("hash-generator produces the SHA-256 vector and never 'Error'", async ({ page }) => {
    await blockExternalRequests(page);
    await page.goto(`${BASE_URL}/tools/hash-generator`);
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("Enter text to hash (real-time)...").fill(VECTOR_INPUT);

    const sha256Block = page.locator("div.rounded-lg.border").filter({ hasText: "SHA-256" });
    await expect(sha256Block.locator("code")).toContainText(SHA256_HELLO_WORLD, { timeout: 10000 });

    // The fallback chain must never leak "Error" into any algorithm result.
    await expect(page.locator("code").filter({ hasText: "Error" })).toHaveCount(0);
  });
});