import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Tool smoke tests (5 runs each)", () => {
  for (let run = 1; run <= 5; run++) {
    test.describe(`Run ${run}/5`, () => {
      test("Base64 Encoder/Decoder - encode and decode", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/base64`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea").first();
        await textarea.fill("Hello World!");

        const encodeBtn = page.getByText("Encode").first();
        await encodeBtn.click();
        await page.waitForTimeout(300);

        const output = page.locator("textarea, pre, code, [class*='output'], [class*='result']").last();
        const outputText = await output.inputValue().catch(() => output.textContent());
        expect(outputText).toBeTruthy();

        const decodeBtn = page.getByText("Decode").first();
        if (await decodeBtn.isVisible()) {
          await decodeBtn.click();
          await page.waitForTimeout(300);
        }
      });

      test("JSON Formatter - format JSON", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/json-formatter`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea").first();
        await textarea.fill('{"name":"test","value":123}');

        const formatBtn = page.getByText("Format").first();
        await formatBtn.click();
        await page.waitForTimeout(500);

        const output = page.locator("textarea, pre, code, [class*='output'], [class*='result']").last();
        const outputText = await output.inputValue().catch(() => output.textContent());
        expect(outputText).toBeTruthy();
      });

      test("UUID Generator - generate UUID", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/uuid-generator`);
        await page.waitForLoadState("networkidle");

        const generateBtn = page.getByText("Generate", { exact: false }).first();
        await generateBtn.click();
        await page.waitForTimeout(500);

        const output = page.locator('[class*="uuid"], [class*="output"], pre, code').first();
        const text = await output.textContent().catch(() => "");
        expect(text).toBeTruthy();
      });

      test("Password Generator - generate password", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/password-generator`);
        await page.waitForLoadState("networkidle");

        const generateBtn = page.getByText("Generate", { exact: false }).first();
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
          await page.waitForTimeout(500);
        }

        const output = page.locator('code[class*="select-all"]').first();
        const text = await output.textContent().catch(() => "");
        expect(text).toBeTruthy();
      });

      test("QR Code Generator - generate QR code", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/qr-generator`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea, input[type='text']").first();
        await textarea.fill("https://example.com");

        const generateBtn = page.getByText("Generate", { exact: false }).first();
        await generateBtn.click();
        await page.waitForTimeout(1000);

        const svg = page.locator("svg").first();
        await expect(svg).toBeVisible({ timeout: 3000 });
      });

      test("Hash Generator - generate hash", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/hash-generator`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea").first();
        await textarea.fill("test input");

        await page.waitForTimeout(500);
        const output = page.locator("textarea, pre, code, [class*='hash'], [class*='output'], [class*='result']").last();
        const outputText = await output.inputValue().catch(() => output.textContent().catch(() => ""));
        expect(outputText).toBeTruthy();
      });

      test("Text Analyzer - analyze text", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/text-analyzer`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea").first();
        await textarea.fill("This is a sample text for testing the text analyzer tool. It should detect words, sentences, and provide writing suggestions.");

        await page.waitForTimeout(500);

        const suggestions = page.getByText("Writing Suggestions").first();
        await expect(suggestions).toBeVisible({ timeout: 3000 });

        const stats = page.getByText("Words", { exact: false }).first();
        await expect(stats).toBeVisible({ timeout: 3000 });
      });

      test("URL Encoder - encode and decode URL", async ({ page }) => {
        await page.goto(`${BASE_URL}/tools/url-encoder`);
        await page.waitForLoadState("networkidle");

        const textarea = page.locator("textarea").first();
        await textarea.fill("https://example.com/path?name=test&value=hello world");

        const encodeBtn = page.getByText("Encode").first();
        await encodeBtn.click();
        await page.waitForTimeout(300);

        const output = page.locator("textarea, pre, code").last();
        const outputText = await output.inputValue().catch(() => output.textContent().catch(() => ""));
        expect(outputText).toBeTruthy();
      });
    });
  }
});
