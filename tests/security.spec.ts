import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Security Tests", () => {
  test.describe("Health Endpoint - No Information Disclosure", () => {
    test("health endpoint returns only safe fields", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      expect(response.status()).toBe(200);
      const body = await response.json();

      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("healthy");
      expect(body).toHaveProperty("timestamp");

      // Must NOT expose internal info
      expect(body).not.toHaveProperty("version");
      expect(body).not.toHaveProperty("uptime");
      expect(body).not.toHaveProperty("memory");
      expect(body).not.toHaveProperty("nodeVersion");
      expect(body).not.toHaveProperty("platform");
      expect(body).not.toHaveProperty("buildVersion");
      expect(body).not.toHaveProperty("envVars");
    });

    test("health endpoint does not cache", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      const cacheControl = response.headers()["cache-control"] || "";
      const isCacheDisabled =
        cacheControl.includes("no-store") ||
        cacheControl.includes("max-age=0") ||
        cacheControl.includes("must-revalidate");
      expect(isCacheDisabled).toBe(true);
    });
  });

  test.describe("Contact Endpoint - Security", () => {
    test("rejects non-JSON content type", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: "not json",
        headers: { "Content-Type": "text/plain" },
      });
      expect(response.status()).toBe(415);
      const body = await response.json();
      expect(body.error).toMatch(/format|not allowed/i);
    });

    test("rejects oversized body", async ({ request }) => {
      const largeBody = JSON.stringify({
        name: "Test",
        email: "test@example.com",
        subject: "Test",
        message: "x".repeat(20000),
      });
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: largeBody,
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test("honeypot field triggers silent rejection", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: "Bot",
          email: "bot@example.com",
          subject: "Spam",
          message: "Buy stuff",
          website_url: "http://spam.com",
        },
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(400);
    });

    test("missing required fields returns 400", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: { name: "Test" },
        headers: { "Content-Type": "application/json" },
      });
      expect([400, 429]).toContain(response.status());
    });
  });

  test.describe("Submit Endpoint - Security", () => {
    test("rejects missing origin header", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "suggest", name: "Test", email: "test@example.com", message: "Hello" },
        headers: { "Content-Type": "application/json" },
      });
      expect([403, 429]).toContain(response.status());
    });

    test("rejects cross-origin requests", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "suggest", name: "Test", email: "test@example.com", message: "Hello" },
        headers: { "Content-Type": "application/json", "Origin": "http://evil.com" },
      });
      expect([403, 429]).toContain(response.status());
    });

    test("rejects missing form type", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { name: "Test", email: "test@example.com", message: "Hello" },
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      });
      expect([400, 429]).toContain(response.status());
    });

    test("rejects invalid form type", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "invalid-type", name: "Test", email: "test@example.com", message: "Hello" },
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      });
      expect([400, 429]).toContain(response.status());
    });
  });

  test.describe("Path Traversal Blocking", () => {
    const traversalPayloads = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32",
      "%2e%2e%2f%2e%2e%2f",
      "..%2f..%2f",
    ];

    for (const payload of traversalPayloads) {
      test(`blocks traversal: ${payload}`, async ({ request }) => {
        const response = await request.get(`${BASE_URL}/${payload}`, {
          maxRedirects: 0,
        });
        expect([400, 403, 404]).toContain(response.status());
      });
    }
  });

  test.describe("Attack Path Blocking", () => {
    const attackPaths = [
      "/wp-admin",
      "/wp-login.php",
      "/.env",
      "/.git/config",
      "/.htaccess",
    ];

    for (const path of attackPaths) {
      test(`blocks: ${path}`, async ({ request }) => {
        const response = await request.get(`${BASE_URL}${path}`);
        expect([400, 403, 404]).toContain(response.status());
      });
    }
  });

  test.describe("Rate Limiting", () => {
    test("submit endpoint enforces rate limit", async ({ request }) => {
      const requests = Array.from({ length: 8 }, () =>
        request.post(`${BASE_URL}/api/submit`, {
          data: { type: "suggest", name: "Test", email: "test@example.com", message: "Hello" },
          headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
        })
      );
      const responses = await Promise.all(requests);
      const statuses = responses.map((r) => r.status());
      const has429 = statuses.some((s) => s === 429);
      expect(has429).toBe(true);
    });

    test("contact endpoint enforces rate limit", async ({ request }) => {
      const requests = Array.from({ length: 6 }, () =>
        request.post(`${BASE_URL}/api/contact`, {
          data: {
            name: "Test User",
            email: "test@example.com",
            subject: "Test Subject",
            message: "This is a test message with enough chars",
          },
          headers: { "Content-Type": "application/json" },
        })
      );
      const responses = await Promise.all(requests);
      const statuses = responses.map((r) => r.status());
      const has429 = statuses.some((s) => s === 429);
      expect(has429).toBe(true);
    });
  });

  test.describe("Security Headers", () => {
    test("main page has security headers", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`);
      const headers = response.headers();

      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-xss-protection"]).toBe("1; mode=block");
      expect(headers["strict-transport-security"]).toContain("max-age");
      expect(headers["referrer-policy"]).toBeTruthy();
    });

    test("API responses have security headers", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      const headers = response.headers();

      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
    });
  });
});
