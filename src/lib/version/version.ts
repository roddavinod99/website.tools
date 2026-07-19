import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Version, ReleaseType } from "./types";
import { parseSemVer, formatVersion, validateVersionString } from "./validation";

let _rootOverride: string | undefined;

export function setRootPath(path: string): void {
  _rootOverride = path;
}

function getRoot(): string {
  return _rootOverride || process.cwd();
}

function getPackageJsonPath(): string {
  return join(getRoot(), "package.json");
}

function getBuildNumberPath(): string {
  return join(getRoot(), "data", "build-number.json");
}

function readPackageRaw(): string {
  const path = getPackageJsonPath();
  try {
    return readFileSync(path, "utf-8");
  } catch {
    throw new Error(`Cannot read package.json at ${path}`);
  }
}

export function readPackageVersion(): Version {
  const raw = readPackageRaw();
  let pkg: { version?: string };
  try {
    pkg = JSON.parse(raw);
  } catch {
    throw new Error("package.json contains invalid JSON");
  }

  if (!pkg.version) {
    throw new Error("package.json does not contain a version field");
  }

  const result = parseSemVer(pkg.version);
  if (!result.valid || !result.version) {
    throw new Error(`Invalid version in package.json: ${result.error}`);
  }

  return result.version;
}

export function readPackageVersionString(): string {
  return formatVersion(readPackageVersion());
}

export function writePackageVersion(version: Version): void {
  const raw = readPackageRaw();
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw);
  } catch {
    throw new Error("package.json contains invalid JSON");
  }

  pkg.version = formatVersion(version);
  writeFileSync(getPackageJsonPath(), JSON.stringify(pkg, null, 2) + "\n", "utf-8");
}

export function incrementVersion(current: Version, type: ReleaseType): Version {
  switch (type) {
    case "major":
      return { major: current.major + 1, minor: 0, patch: 0 };
    case "minor":
      return { major: current.major, minor: current.minor + 1, patch: 0 };
    case "patch":
      return { major: current.major, minor: current.minor, patch: current.patch + 1 };
    case "custom":
      throw new Error("Custom version must be provided explicitly, not auto-incremented");
  }
}

export function generateNextVersion(type: ReleaseType): Version {
  const current = readPackageVersion();
  return incrementVersion(current, type);
}

export function getBuildNumber(): number {
  const path = getBuildNumberPath();
  if (!existsSync(path)) {
    return 0;
  }
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw);
    return typeof data.buildNumber === "number" ? data.buildNumber : 0;
  } catch {
    return 0;
  }
}

export function incrementBuildNumber(): number {
  const current = getBuildNumber();
  const next = current + 1;
  const dir = join(getRoot(), "data");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getBuildNumberPath(), JSON.stringify({ buildNumber: next }, null, 2) + "\n", "utf-8");
  return next;
}

export function validateCurrentVersion(): void {
  const version = readPackageVersionString();
  const check = validateVersionString(version);
  if (!check.valid) {
    throw new Error(`Current package.json version is invalid: ${check.error}`);
  }
}
