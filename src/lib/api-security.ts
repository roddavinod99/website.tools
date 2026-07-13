import { NextResponse } from "next/server";
import { logSecurityEvent } from "./security-logger";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getPath(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

export function rejectOversizeBody(request: Request, maxBytes: number): NextResponse | null {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    const ip = getClientIp(request);
    const path = getPath(request);
    logSecurityEvent("body_too_large", ip, path, `Content-Length: ${contentLength}, max: ${maxBytes}`);
    return NextResponse.json(
      { error: "Request body too large." },
      { status: 413 }
    );
  }
  return null;
}

export function rejectInvalidContentType(
  request: Request,
  allowedTypes: string[]
): NextResponse | null {
  const contentType = request.headers.get("content-type") || "";
  const isAllowed = allowedTypes.some((type) => contentType.includes(type));
  if (!isAllowed) {
    const ip = getClientIp(request);
    const path = getPath(request);
    logSecurityEvent("missing_content_type", ip, path, `Content-Type: ${contentType}`);
    return NextResponse.json(
      { error: "Invalid request format." },
      { status: 415 }
    );
  }
  return null;
}

export function rejectInvalidOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  if (!origin) return null;

  try {
    const originHost = new URL(origin).hostname;
    const expectedHost = new URL(request.url).hostname;
    if (originHost !== expectedHost) {
      const ip = getClientIp(request);
      const path = getPath(request);
      logSecurityEvent("invalid_origin", ip, path, `Origin: ${originHost}`);
      return NextResponse.json(
        { error: "Request not allowed." },
        { status: 403 }
      );
    }
  } catch {
    const ip = getClientIp(request);
    const path = getPath(request);
    logSecurityEvent("invalid_origin", ip, path, "Malformed origin header");
    return NextResponse.json(
      { error: "Request not allowed." },
      { status: 403 }
    );
  }
  return null;
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("enoent") || msg.includes("eacces") || msg.includes("eperm")) {
      return "Service temporarily unavailable.";
    }
    if (msg.includes("enomem") || msg.includes("heap") || msg.includes("memory")) {
      return "Service temporarily unavailable.";
    }
    if (msg.includes("timeout") || msg.includes("aborted")) {
      return "Request timed out.";
    }
  }
  return "An error occurred. Please try again.";
}

export function createSecureErrorResponse(
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function detectPathTraversal(input: string): boolean {
  const patterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e/i,
    /\.\.%2f/i,
    /\.\.%5c/i,
    /%2e%2e%2f/i,
    /%2e%2e\//i,
    /\.\./,
  ];
  return patterns.some((p) => p.test(input));
}

export { getClientIp, getPath };
