import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BuildInfo } from "./types";
import { readPackageVersionString, incrementBuildNumber } from "./version";
import { getGitInfo } from "./git";

let _cachedBuildInfo: BuildInfo | null = null;

function getNextVersion(): string {
  try {
    const nextPkgPath = join(process.cwd(), "node_modules", "next", "package.json");
    const nextPkg = readFileSync(nextPkgPath, "utf-8");
    return JSON.parse(nextPkg).version || "unknown";
  } catch {
    return "unknown";
  }
}

export function generateBuildInfo(): BuildInfo {
  const version = readPackageVersionString();
  const buildNumber = incrementBuildNumber();
  const git = getGitInfo();
  const now = new Date();

  const info: BuildInfo = {
    version,
    buildNumber,
    git,
    buildTime: now.getTime(),
    buildDate: now.toISOString(),
    nodeVersion: process.version,
    nextVersion: getNextVersion(),
    environment: (process.env.NODE_ENV as BuildInfo["environment"]) || "development",
  };

  _cachedBuildInfo = info;
  return info;
}

export function getBuildInfo(): BuildInfo | null {
  return _cachedBuildInfo;
}

export function readCachedBuildInfo(): BuildInfo | null {
  if (_cachedBuildInfo) return _cachedBuildInfo;

  try {
    const root = process.cwd();
    const releasePath = join(root, "data", "release.json");
    const raw = readFileSync(releasePath, "utf-8");
    const manifest = JSON.parse(raw);
    return {
      version: manifest.version,
      buildNumber: manifest.buildNumber,
      git: {
        commit: manifest.gitCommit || "0000000000000000000000000000000000000000",
        shortHash: (manifest.gitCommit || "0000000").slice(0, 7),
        branch: "unknown",
        commitCount: 0,
        isDirty: false,
      },
      buildTime: new Date(manifest.buildDate).getTime(),
      buildDate: manifest.buildDate,
      nodeVersion: "unknown",
      nextVersion: "unknown",
      environment: manifest.environment || "production",
    };
  } catch {
    return null;
  }
}
