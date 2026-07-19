import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    healthy: true,
    timestamp: new Date().toISOString(),
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
