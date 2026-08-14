import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isSameOrigin } from "@/lib/api-security";
import {
  VISIT_COOKIE,
  getSessionMinutes,
  getVisitCount,
  hashIp,
  isBotRequest,
  isBurstDuplicate,
  recordVisit,
} from "@/lib/visit-counter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getVisitCookieValue(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${VISIT_COOKIE}=`)) {
      const value = trimmed.slice(VISIT_COOKIE.length + 1);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function buildSetCookie(request: Request, value: string): string {
  const parts = [
    `${VISIT_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${getSessionMinutes() * 60}`,
  ];
  const protocol = new URL(request.url).protocol;
  if (protocol === "https:") parts.push("Secure");
  return parts.join("; ");
}

function countResponse(count: number, request: Request, cookieValue?: string): NextResponse {
  const headers: Record<string, string> = { "Cache-Control": "no-store, max-age=0" };
  if (cookieValue !== undefined) {
    headers["Set-Cookie"] = buildSetCookie(request, cookieValue);
  }
  return NextResponse.json({ count }, { status: 200, headers });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Invalid request format." }, { status: 415 });
  }

  const ua = request.headers.get("user-agent") || "";
  if (isBotRequest(ua, request.headers)) {
    return countResponse(getVisitCount(), request);
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const existing = getVisitCookieValue(cookieHeader);

  if (existing !== null) {
    // Active session: roll the cookie TTL without counting a new visit.
    return countResponse(getVisitCount(), request, existing);
  }

  const ip = getClientIp(request);
  let count = getVisitCount();
  if (!isBurstDuplicate(hashIp(ip))) {
    count = recordVisit();
  }
  return countResponse(count, request, randomUUID());
}

export async function GET() {
  return NextResponse.json(
    { count: getVisitCount() },
    { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
