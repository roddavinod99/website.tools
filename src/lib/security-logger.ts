import { getIPHashSalt } from "./env";

type SecurityEvent =
  | "upload_rejected_size"
  | "upload_rejected_type"
  | "upload_rejected_zip_bomb"
  | "rate_limit_violation"
  | "path_traversal_attempt"
  | "malicious_request"
  | "invalid_origin"
  | "body_too_large"
  | "missing_content_type"
  | "submission_persist_failed";

interface SecurityLogEntry {
  timestamp: string;
  event: SecurityEvent;
  ip: string;
  path: string;
  details: string;
  userAgent?: string;
}

const SECURITY_LOG: SecurityLogEntry[] = [];
const MAX_LOG_ENTRIES = 1000;

async function hashIP(ip: string): Promise<string> {
  const salt = getIPHashSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(ip.replace(/::ffff:/, "") + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function truncateLog(): void {
  if (SECURITY_LOG.length > MAX_LOG_ENTRIES) {
    SECURITY_LOG.splice(0, SECURITY_LOG.length - MAX_LOG_ENTRIES);
  }
}

export async function logSecurityEvent(
  event: SecurityEvent,
  ip: string,
  path: string,
  details: string,
  userAgent?: string
): Promise<void> {
  const hashedIP = await hashIP(ip);
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: hashedIP,
    path,
    details,
    userAgent,
  };

  SECURITY_LOG.push(entry);
  truncateLog();

  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    console.error(JSON.stringify(entry));
  }
}

export function getSecurityLog(): readonly SecurityLogEntry[] {
  return SECURITY_LOG;
}

export function getSecurityLogByEvent(event: SecurityEvent): SecurityLogEntry[] {
  return SECURITY_LOG.filter((e) => e.event === event);
}

export async function getSecurityLogByIP(ip: string): Promise<SecurityLogEntry[]> {
  const hashed = await hashIP(ip);
  return SECURITY_LOG.filter((e) => e.ip === hashed);
}

export function clearSecurityLog(): void {
  SECURITY_LOG.length = 0;
}

export function getSecurityStats(): Record<SecurityEvent, number> {
  const stats = {} as Record<SecurityEvent, number>;
  for (const entry of SECURITY_LOG) {
    stats[entry.event] = (stats[entry.event] || 0) + 1;
  }
  return stats;
}
