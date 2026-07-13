import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  let healthy = true;

  try {
    const mem = process.memoryUsage();
    const heapUsedMB = mem.heapUsed / 1024 / 1024;

    if (heapUsedMB > 400) {
      healthy = false;
    }
  } catch {
    healthy = false;
  }

  const statusCode = healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      healthy,
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
