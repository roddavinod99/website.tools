import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, unknown> = {};
  let allOk = true;

  try {
    const start = Date.now();

    // Basic
    checks.timestamp = new Date().toISOString();
    checks.uptime = process.uptime().toFixed(1) + "s";
    checks.nodeVersion = process.version;
    checks.platform = process.platform;

    // Memory
    const mem = process.memoryUsage();
    checks.memoryHeapUsed = `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`;
    checks.memoryHeapTotal = `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`;
    checks.memoryRss = `${(mem.rss / 1024 / 1024).toFixed(1)}MB`;

    // Event loop (approximate via setTimeout delay)
    const loopStart = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const loopDelay = Date.now() - loopStart - 5;
    checks.eventLoopDelay = `${Math.max(0, loopDelay)}ms`;

    // Environment variables (existence check, not values)
    const requiredEnvVars = ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_GA_ID"];
    const envStatus: Record<string, boolean> = {};
    for (const v of requiredEnvVars) {
      envStatus[v] = !!process.env[v];
      if (v === "NEXT_PUBLIC_GA_ID" && !process.env[v]) envStatus[v] = true; // GA is optional
    }
    checks.envVars = envStatus;

    // PM2 detection
    checks.pm2 = !!process.env.PM2_HOME || !!process.env.pm_id;

    // Build version
    checks.buildVersion = process.env.npm_package_version || "0.1.0";

    // Response time
    checks.responseTime = `${Date.now() - start}ms`;

    checks.status = allOk ? "ok" : "degraded";
  } catch (err) {
    checks.status = "error";
    checks.error = err instanceof Error ? err.message : "Unknown error";
    allOk = false;
  }

  const statusCode = allOk ? 200 : 503;

  return NextResponse.json(
    {
      app: "DevStackIO Tools",
      healthy: allOk,
      ...checks,
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
