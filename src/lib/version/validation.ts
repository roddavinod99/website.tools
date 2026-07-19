import type { Version, ReleaseManifest, ChangelogEntry } from "./types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function parseSemVer(str: string): ValidationResult & { version?: Version } {
  if (!str || typeof str !== "string") {
    return { valid: false, error: "Version string is required" };
  }

  const trimmed = str.trim();
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;
  const match = trimmed.match(regex);

  if (!match) {
    return { valid: false, error: `Invalid SemVer format: "${str}". Expected format: major.minor.patch (e.g., 1.0.0)` };
  }

  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  const patch = parseInt(match[3], 10);

  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    return { valid: false, error: "Version segments must be valid numbers" };
  }

  if (major < 0 || minor < 0 || patch < 0) {
    return { valid: false, error: "Version segments cannot be negative" };
  }

  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor) || !Number.isSafeInteger(patch)) {
    return { valid: false, error: "Version segment value exceeds safe integer range" };
  }

  return {
    valid: true,
    version: {
      major,
      minor,
      patch,
      prerelease: match[4] || undefined,
      build: match[5] || undefined,
    },
  };
}

export function formatVersion(version: Version): string {
  let str = `${version.major}.${version.minor}.${version.patch}`;
  if (version.prerelease) str += `-${version.prerelease}`;
  if (version.build) str += `+${version.build}`;
  return str;
}

export function validateVersionString(str: string): ValidationResult {
  return parseSemVer(str);
}

export function isVersionString(str: string): boolean {
  return parseSemVer(str).valid;
}

export function compareVersions(a: Version | string, b: Version | string): -1 | 0 | 1 {
  const aVer = typeof a === "string" ? parseSemVer(a).version : a;
  const bVer = typeof b === "string" ? parseSemVer(b).version : b;

  if (!aVer || !bVer) return 0;

  if (aVer.major !== bVer.major) return aVer.major > bVer.major ? 1 : -1;
  if (aVer.minor !== bVer.minor) return aVer.minor > bVer.minor ? 1 : -1;
  if (aVer.patch !== bVer.patch) return aVer.patch > bVer.patch ? 1 : -1;

  return 0;
}

export function validateReleaseSchema(obj: unknown): ValidationResult {
  if (!obj || typeof obj !== "object") {
    return { valid: false, error: "Release manifest must be an object" };
  }

  const manifest = obj as Record<string, unknown>;

  if (!manifest.version || typeof manifest.version !== "string") {
    return { valid: false, error: "Release manifest must have a 'version' string" };
  }

  const versionCheck = parseSemVer(manifest.version);
  if (!versionCheck.valid) {
    return { valid: false, error: `Invalid version in release manifest: ${versionCheck.error}` };
  }

  if (typeof manifest.buildNumber !== "number") {
    return { valid: false, error: "Release manifest must have a 'buildNumber' number" };
  }

  if (typeof manifest.gitCommit !== "string") {
    return { valid: false, error: "Release manifest must have a 'gitCommit' string" };
  }

  if (typeof manifest.buildDate !== "string") {
    return { valid: false, error: "Release manifest must have a 'buildDate' string" };
  }

  return { valid: true };
}

export function detectDuplicateChangelogEntry(
  existing: ChangelogEntry[],
  newEntry: ChangelogEntry
): boolean {
  const normalizedNew = newEntry.description.trim().toLowerCase();
  return existing.some(
    (e) => e.description.trim().toLowerCase() === normalizedNew
  );
}

export function validateBuildNumber(num: unknown): ValidationResult {
  if (typeof num !== "number") {
    return { valid: false, error: "Build number must be a number" };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, error: "Build number must be an integer" };
  }
  if (num < 0) {
    return { valid: false, error: "Build number cannot be negative" };
  }
  if (!Number.isSafeInteger(num)) {
    return { valid: false, error: "Build number exceeds safe integer range" };
  }
  return { valid: true };
}
