import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const healthy = true;

  return NextResponse.json(
    {
      status: "ok",
      healthy,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
