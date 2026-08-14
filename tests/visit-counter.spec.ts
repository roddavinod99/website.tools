import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const ORIGIN = "http://localhost:3000";
const HUMAN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const BOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

test.describe("GET /api/visits", () => {
  test("returns a numeric count with no-store", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/visits`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.count).toBe("number");
    expect(body.count).toBeGreaterThanOrEqual(0);
    const cacheControl = response.headers()["cache-control"] || "";
    expect(cacheControl).toMatch(/no-store|max-age=0/);
  });
});

test.describe("POST /api/visits", () => {
  test("first visit increments the count and sets a session cookie", async ({ request }) => {
    const before = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;

    const response = await request.post(`${BASE_URL}/api/visits`, {
      headers: { "Content-Type": "application/json", Origin: ORIGIN, "User-Agent": HUMAN_UA },
      data: {},
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.count).toBe(before + 1);

    const setCookie = response.headers()["set-cookie"] || "";
    expect(setCookie).toContain("_dsio_visit=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toMatch(/Max-Age=\d+/);
  });

  test("repeat visit with the session cookie does not increment", async ({ request }) => {
    const first = await request.post(`${BASE_URL}/api/visits`, {
      headers: { "Content-Type": "application/json", Origin: ORIGIN, "User-Agent": HUMAN_UA },
      data: {},
    });
    const count = (await first.json()).count as number;
    const cookieValue = (first.headers()["set-cookie"] || "").split(";")[0];

    const second = await request.post(`${BASE_URL}/api/visits`, {
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
        "User-Agent": HUMAN_UA,
        Cookie: cookieValue,
      },
      data: {},
    });
    expect(second.status()).toBe(200);
    expect((await second.json()).count).toBe(count);
  });

  test("missing origin/referer is rejected", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/visits`, {
      headers: { "Content-Type": "application/json", "User-Agent": HUMAN_UA },
      data: {},
    });
    expect(response.status()).toBe(403);
  });

  test("cross-origin request is rejected", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/visits`, {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://evil.example",
        "User-Agent": HUMAN_UA,
      },
      data: {},
    });
    expect(response.status()).toBe(403);
  });

  test("non-JSON content type is rejected", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/visits`, {
      headers: { "Content-Type": "text/plain", Origin: ORIGIN, "User-Agent": HUMAN_UA },
      data: "{}",
    });
    expect(response.status()).toBe(415);
  });

  test("bot user agent does not increment the count", async ({ request }) => {
    const before = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;

    const response = await request.post(`${BASE_URL}/api/visits`, {
      headers: { "Content-Type": "application/json", Origin: ORIGIN, "User-Agent": BOT_UA },
      data: {},
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).count).toBe(before);
  });

  test("concurrent new visits are all counted (no lost updates)", async ({ request }) => {
    const before = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;
    const concurrent = 30;

    const results = await Promise.all(
      Array.from({ length: concurrent }, (_, i) =>
        request.post(`${BASE_URL}/api/visits`, {
          headers: {
            "Content-Type": "application/json",
            Origin: ORIGIN,
            "User-Agent": HUMAN_UA,
            "X-Forwarded-For": `10.0.0.${i + 1}`,
          },
          data: {},
        })
      )
    );

    for (const result of results) {
      expect(result.status()).toBe(200);
    }

    const after = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;
    expect(after - before).toBe(concurrent);
  });
});

test.describe("Footer visit counter", () => {
  test("displays a formatted count and only counts a fresh session", async ({ browser, request }) => {
    const contextA = await browser.newContext({ userAgent: HUMAN_UA });
    const pageA = await contextA.newPage();
    await pageA.goto(`${BASE_URL}/`);

    const counterA = pageA.locator("footer").getByText(/Total Number of Visitors till date:/);
    await expect(counterA).toBeVisible();

    const firstText = (await counterA.innerText()).trim();
    const firstMatch = firstText.match(/:\s*([\d,]+)\s*$/);
    expect(firstMatch).not.toBeNull();
    const firstCount = Number(firstMatch![1].replace(/,/g, ""));

    const serverCount = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;
    expect(firstCount).toBe(serverCount);
    expect(firstText).toContain(NUMBER_FORMATTER.format(firstCount));

    // A refresh and a client-side navigation within the same session do not add visits.
    await pageA.reload();
    const counterAfterReload = pageA.locator("footer").getByText(/Total Number of Visitors till date:/);
    await expect(counterAfterReload).toBeVisible();
    expect(await counterAfterReload.innerText()).toContain(NUMBER_FORMATTER.format(firstCount));

    await pageA.goto(`${BASE_URL}/tools`);
    const counterAfterNav = pageA.locator("footer").getByText(/Total Number of Visitors till date:/);
    await expect(counterAfterNav).toBeVisible();
    expect(await counterAfterNav.innerText()).toContain(NUMBER_FORMATTER.format(firstCount));

    // A brand-new browser session counts one more visit. The global count may
    // also advance from other parallel workers, so assert against the server's
    // authoritative value captured at this moment (must never regress).
    const beforeFresh = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;
    const contextB = await browser.newContext({ userAgent: HUMAN_UA });
    const pageB = await contextB.newPage();
    await pageB.goto(`${BASE_URL}/`);
    const counterB = pageB.locator("footer").getByText(/Total Number of Visitors till date:/);
    await expect(counterB).toBeVisible();
    const freshMatch = (await counterB.innerText()).match(/:\s*([\d,]+)\s*$/);
    expect(freshMatch).not.toBeNull();
    const freshCount = Number(freshMatch![1].replace(/,/g, ""));
    const afterFresh = (await (await request.get(`${BASE_URL}/api/visits`)).json()).count as number;
    expect(freshCount).toBeGreaterThanOrEqual(beforeFresh + 1);
    expect(freshCount).toBeLessThanOrEqual(afterFresh);
    expect(await counterB.innerText()).toContain(NUMBER_FORMATTER.format(freshCount));

    await contextA.close();
    await contextB.close();
  });
});