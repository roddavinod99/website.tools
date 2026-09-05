import { test } from "@playwright/test";

const PAGES = [
  { name: "home", path: "/" },
  { name: "tools", path: "/tools" },
  { name: "tool-detail", path: "/tools/json-formatter" },
  { name: "categories", path: "/categories" },
  { name: "blog", path: "/blog" },
  { name: "privacy", path: "/privacy" },
  { name: "accessibility", path: "/accessibility" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
];

const MODES = ["light", "dark"] as const;

for (const mode of MODES) {
  test.describe(`redesign snapshots (${mode})`, () => {
    test.use({ colorScheme: mode });
    for (const page of PAGES) {
      test(`${page.name} ${mode}`, async ({ page: p }) => {
        await p.addInitScript((m: string) => {
          try {
            localStorage.setItem("theme", m);
          } catch {}
        }, mode);
        await p.goto(page.path, { waitUntil: "networkidle" });
        await p.screenshot({
          path: `tests/snapshots/redesign/${mode}/${page.name}.png`,
          fullPage: true,
        });
      });
    }
  });
}