import { NextResponse } from "next/server";
import os from "node:os";

export const runtime = "nodejs";

const startTime = Date.now();

export async function GET() {
  let healthy = true;
  const issues: string[] = [];

  const mem = process.memoryUsage();
  const heapUsedMB = mem.heapUsed / 1024 / 1024;
  const heapTotalMB = mem.heapTotal / 1024 / 1024;

  if (heapUsedMB > 400) {
    healthy = false;
    issues.push("heap usage exceeds 400MB");
  }

  let loadAvg: number[] = [];
  try {
    loadAvg = os.loadavg();
  } catch {
    // loadavg not available on all platforms
  }

  const statusCode = healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      healthy,
      issues: issues.length > 0 ? issues : undefined,
      version: "0.1.0",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: {
        heapUsedMB: Math.round(heapUsedMB * 100) / 100,
        heapTotalMB: Math.round(heapTotalMB * 100) / 100,
        rssMB: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
      },
      cpu: loadAvg.length > 0 ? {
        loadAvg1: loadAvg[0],
        loadAvg5: loadAvg[1],
        loadAvg15: loadAvg[2],
      } : undefined,
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
