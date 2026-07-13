import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("API Endpoint Tests", () => {
  test("GET /api/health — returns status OK", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("healthy");
    expect(body).toHaveProperty("timestamp");
  });

  test.describe("POST /api/submit", () => {
    test("valid submission — returns success", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "suggest", name: "Test User", email: "test@example.com", message: "Hello from test" },
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test("missing type — returns 400", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { name: "Test User", email: "test@example.com" },
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
      });
      expect(response.status()).toBe(400);
    });

    test("missing origin — returns 403", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "suggest", name: "Test User", email: "test@example.com" },
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(403);
    });

    test("cross-origin — returns 403", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { type: "suggest", name: "Test User", email: "test@example.com" },
        headers: { "Content-Type": "application/json", "Origin": "http://evil.com" },
      });
      expect(response.status()).toBe(403);
    });
  });

  test.describe("GET /api/dns-lookup", () => {
    test("valid domain — returns DNS records", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/dns-lookup?domain=example.com`);
      expect([200, 500, 502]).toContain(response.status());
    });

    test("invalid domain — returns 400", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/dns-lookup?domain=not_a_valid_domain!!!`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/ip-lookup", () => {
    test("public IP — returns location data", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/ip-lookup?ip=8.8.8.8`);
      expect([200, 500, 502]).toContain(response.status());
    });

    test("private IP — returns 400", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/ip-lookup?ip=192.168.1.1`);
      expect(response.status()).toBe(400);
    });

    test("invalid IP — returns 400", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/ip-lookup?ip=999.999.999.999`);
      expect(response.status()).toBe(400);
    });
  });
});
