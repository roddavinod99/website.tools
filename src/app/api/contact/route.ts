import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security-logger";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const MAX_BODY_SIZE = 10000;

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length === 0) {
    requestLog.delete(ip);
  } else {
    requestLog.set(ip, recent);
  }
  return recent.length >= MAX_REQUESTS_PER_WINDOW;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .trim();
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    logSecurityEvent("rate_limit_violation", ip, "/api/contact", "Rate limit exceeded");
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    logSecurityEvent("missing_content_type", ip, "/api/contact", `Content-Type: ${contentType}`);
    return NextResponse.json(
      { error: "Invalid request format." },
      { status: 415 }
    );
  }

  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      logSecurityEvent("body_too_large", ip, "/api/contact", `Body size: ${text.length}`);
      return NextResponse.json(
        { error: "Request body too large." },
        { status: 413 }
      );
    }

    const body = JSON.parse(text);
    const { name, email, subject, message, website_url } = body;

    if (website_url) {
      logSecurityEvent("malicious_request", ip, "/api/contact", "Honeypot triggered");
      return NextResponse.json(
        { error: "Spam detected." },
        { status: 400 }
      );
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email).toLowerCase();
    const sanitizedSubject = sanitize(subject);
    const sanitizedMessage = sanitize(message);

    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (sanitizedSubject.length < 3) {
      return NextResponse.json(
        { error: "Subject must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (sanitizedMessage.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message received. We will respond within 24-48 hours." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
