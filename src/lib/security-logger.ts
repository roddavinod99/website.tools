type SecurityEvent =
  | "upload_rejected_size"
  | "upload_rejected_type"
  | "upload_rejected_zip_bomb"
  | "rate_limit_violation"
  | "path_traversal_attempt"
  | "malicious_request"
  | "invalid_origin"
  | "body_too_large"
  | "missing_content_type";

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

function truncateLog(): void {
  if (SECURITY_LOG.length > MAX_LOG_ENTRIES) {
    SECURITY_LOG.splice(0, SECURITY_LOG.length - MAX_LOG_ENTRIES);
  }
}

export function logSecurityEvent(
  event: SecurityEvent,
  ip: string,
  path: string,
  details: string,
  userAgent?: string
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: ip.replace(/::ffff:/, ""),
    path,
    details,
    userAgent,
  };

  SECURITY_LOG.push(entry);
  truncateLog();

  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    const safeEntry = { ...entry, ip: "***" };
    console.error(JSON.stringify(safeEntry));
  }
}

export function getSecurityLog(): readonly SecurityLogEntry[] {
  return SECURITY_LOG;
}

export function getSecurityLogByEvent(event: SecurityEvent): SecurityLogEntry[] {
  return SECURITY_LOG.filter((e) => e.event === event);
}

export function getSecurityLogByIP(ip: string): SecurityLogEntry[] {
  const cleanIp = ip.replace(/::ffff:/, "");
  return SECURITY_LOG.filter((e) => e.ip === cleanIp);
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
