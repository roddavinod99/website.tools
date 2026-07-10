import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const content = [
    "# ads.txt file for DevStackIO",
    "# This file is used by Google AdSense and other ad networks",
    "# to verify ownership and manage authorized ad sellers.",
    "#",
    "# IMPORTANT: Replace the placeholders below with your actual",
    "# AdSense account information before deploying to production.",
    "#",
    "# Google AdSense",
    "# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0",
    "#",
    "# Other ad networks (if applicable):",
    "# example.com, 12345, DIRECT",
    "",
    "",
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, must-revalidate",
    },
  });
}
