import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const content = [
    "# ads.txt file for DevStackIO",
    "# Used by Google AdSense to verify ownership and manage authorized sellers.",
    "",
    "google.com, pub-1180041811751267, DIRECT, f08c47fec0942fa0",
    "",
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, must-revalidate",
    },
  });
}
