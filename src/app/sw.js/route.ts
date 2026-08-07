import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  RELEASE_VERSION,
  RELEASE_BUILD_TIME,
} from "@/lib/version/__generated__/release-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  try {
    const sw = readFileSync(join(process.cwd(), "public", "sw.template.js"), "utf-8");
    const swVersion = `${RELEASE_VERSION}-${RELEASE_BUILD_TIME}`;
    const served = sw.replace("__SW_VERSION__", swVersion);
    return new NextResponse(served, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Service worker not found", { status: 404 });
  }
}