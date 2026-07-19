import { describe, it, expect } from "vitest";
import {
  parseSemVer,
  formatVersion,
  isVersionString,
  compareVersions,
  validateReleaseSchema,
  detectDuplicateChangelogEntry,
  validateBuildNumber,
} from "@/lib/version/validation";
import type { ChangelogEntry } from "@/lib/version/types";

describe("parseSemVer", () => {
  it("parses standard version", () => {
    const result = parseSemVer("1.2.3");
    expect(result.valid).toBe(true);
    expect(result.version).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it("parses version with prerelease", () => {
    const result = parseSemVer("1.0.0-beta.1");
    expect(result.valid).toBe(true);
    expect(result.version?.major).toBe(1);
    expect(result.version?.prerelease).toBe("beta.1");
  });

  it("parses version with build metadata", () => {
    const result = parseSemVer("2.0.0+build.42");
    expect(result.valid).toBe(true);
    expect(result.version?.build).toBe("build.42");
  });

  it("rejects empty string", () => {
    const result = parseSemVer("");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rejects invalid format", () => {
    const result = parseSemVer("abc");
    expect(result.valid).toBe(false);
  });

  it("rejects partial version", () => {
    const result = parseSemVer("1.2");
    expect(result.valid).toBe(false);
  });

  it("rejects negative numbers", () => {
    const result = parseSemVer("-1.0.0");
    expect(result.valid).toBe(false);
  });

  it("rejects null", () => {
    const result = parseSemVer(null as unknown as string);
    expect(result.valid).toBe(false);
  });
});

describe("formatVersion", () => {
  it("formats standard version", () => {
    expect(formatVersion({ major: 1, minor: 2, patch: 3 })).toBe("1.2.3");
  });

  it("formats with prerelease", () => {
    expect(formatVersion({ major: 1, minor: 0, patch: 0, prerelease: "alpha" })).toBe("1.0.0-alpha");
  });

  it("formats with build metadata", () => {
    expect(formatVersion({ major: 2, minor: 0, patch: 1, build: "123" })).toBe("2.0.1+123");
  });
});

describe("isVersionString", () => {
  it("returns true for valid versions", () => {
    expect(isVersionString("1.0.0")).toBe(true);
    expect(isVersionString("0.0.1")).toBe(true);
    expect(isVersionString("999.999.999")).toBe(true);
  });

  it("returns false for invalid versions", () => {
    expect(isVersionString("1.0")).toBe(false);
    expect(isVersionString("abc")).toBe(false);
    expect(isVersionString("")).toBe(false);
  });
});

describe("compareVersions", () => {
  it("compares major versions", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
  });

  it("compares minor versions", () => {
    expect(compareVersions("1.2.0", "1.1.0")).toBe(1);
  });

  it("compares patch versions", () => {
    expect(compareVersions("1.0.2", "1.0.1")).toBe(1);
  });

  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("compares Version objects", () => {
    expect(compareVersions(
      { major: 3, minor: 0, patch: 0 },
      { major: 2, minor: 9, patch: 9 }
    )).toBe(1);
  });
});

describe("validateReleaseSchema", () => {
  it("validates a correct release manifest", () => {
    const result = validateReleaseSchema({
      version: "1.0.0",
      buildNumber: 42,
      gitCommit: "abc123def456",
      buildDate: "2026-07-20T00:00:00.000Z",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects null", () => {
    const result = validateReleaseSchema(null);
    expect(result.valid).toBe(false);
  });

  it("rejects missing version", () => {
    const result = validateReleaseSchema({ buildNumber: 42 });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid version string", () => {
    const result = validateReleaseSchema({
      version: "abc",
      buildNumber: 42,
      gitCommit: "abc",
      buildDate: "date",
    });
    expect(result.valid).toBe(false);
  });
});

describe("detectDuplicateChangelogEntry", () => {
  it("detects duplicate entries", () => {
    const existing: ChangelogEntry[] = [
      { type: "added", description: "New feature" },
    ];
    expect(detectDuplicateChangelogEntry(existing, { type: "added", description: "New feature" })).toBe(true);
  });

  it("ignores different entries", () => {
    const existing: ChangelogEntry[] = [
      { type: "added", description: "Feature A" },
    ];
    expect(detectDuplicateChangelogEntry(existing, { type: "added", description: "Feature B" })).toBe(false);
  });

  it("is case-insensitive", () => {
    const existing: ChangelogEntry[] = [
      { type: "fixed", description: "Fixed Bug" },
    ];
    expect(detectDuplicateChangelogEntry(existing, { type: "fixed", description: "fixed bug" })).toBe(true);
  });
});

describe("validateBuildNumber", () => {
  it("accepts valid build numbers", () => {
    expect(validateBuildNumber(0).valid).toBe(true);
    expect(validateBuildNumber(1).valid).toBe(true);
    expect(validateBuildNumber(999999).valid).toBe(true);
  });

  it("rejects negative numbers", () => {
    expect(validateBuildNumber(-1).valid).toBe(false);
  });

  it("rejects floats", () => {
    expect(validateBuildNumber(1.5).valid).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(validateBuildNumber("abc").valid).toBe(false);
  });
});
