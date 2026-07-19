import { NextResponse } from "next/server";
import {
  RELEASE_VERSION,
  RELEASE_BUILD_NUMBER,
  RELEASE_GIT_SHORT_HASH,
  RELEASE_ENVIRONMENT,
} from "@/lib/version/__generated__/release-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    healthy: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
    version: RELEASE_VERSION,
    build: RELEASE_BUILD_NUMBER,
    commit: RELEASE_GIT_SHORT_HASH,
    environment: RELEASE_ENVIRONMENT,
  };

  return NextResponse.json(
    { status: "ok", ...checks },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
