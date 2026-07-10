import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("API Endpoint Tests", () => {
  test("GET /api/health — returns status OK", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
    expect(body).toHaveProperty("memory");
  });

  test.describe("POST /api/submit", () => {
    test("valid submission — returns success", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { name: "Test User", email: "test@example.com", message: "Hello from test" },
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
    });

    test("missing fields — returns 400", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/submit`, {
        data: { name: "" },
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/dns-lookup", () => {
    test("valid domain — returns DNS records", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/dns-lookup?domain=example.com`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("records");
    });

    test("invalid domain — returns 400", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/dns-lookup?domain=not_a_valid_domain!!!`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("GET /api/ip-lookup", () => {
    test("public IP — returns location data", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/ip-lookup?ip=8.8.8.8`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("ip");
      expect(body).toHaveProperty("location");
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
