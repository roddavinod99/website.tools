import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: 2,
  reporter: [["html", { open: "never" }], ["list"]],
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: process.env.AUDIT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // An explicit audit URL refers to an already-running local or remote server.
  webServer: process.env.AUDIT_BASE_URL ? undefined : {
    command: "node scripts/prepare-standalone.mjs && node .next/standalone/server.js",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000,
env: {
      PORT: "3000",
      HOSTNAME: "localhost",
      IP_HASH_SALT: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      VISIT_BURST_MS: "0",
    },
  },
});
