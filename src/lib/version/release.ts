import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import type { ReleaseManifest, ReleaseType, ChangelogEntry } from "./types";
import { formatVersion } from "./validation";
import { readPackageVersion, incrementVersion, readPackageVersionString, getBuildNumber } from "./version";
import { getGitInfo } from "./git";

function getRoot(): string {
  return process.cwd();
}

function getReleaseJsonPath(): string {
  return join(getRoot(), "data", "release.json");
}

function getReleaseArchiveDir(): string {
  return join(getRoot(), "data", "releases");
}

export function generateReleaseManifest(
  type: ReleaseType,
  entries: ChangelogEntry[]
): ReleaseManifest {
  const current = readPackageVersion();
  const nextVersion = type === "custom" ? current : incrementVersion(current, type);
  const versionStr = formatVersion(nextVersion);
  const git = getGitInfo();
  const buildNumber = getBuildNumber() + 1;

  const manifest: ReleaseManifest = {
    version: versionStr,
    buildNumber,
    gitCommit: git.commit,
    buildDate: new Date().toISOString(),
    environment: (process.env.NODE_ENV as ReleaseManifest["environment"]) || "development",
    features: [],
    fixes: [],
    breakingChanges: [],
    security: [],
    performance: [],
    infrastructure: [],
  };

  for (const entry of entries) {
    switch (entry.type) {
      case "added":
        manifest.features.push(entry.description);
        break;
      case "fixed":
        manifest.fixes.push(entry.description);
        break;
      case "removed":
        manifest.breakingChanges.push(entry.description);
        break;
      case "security":
        manifest.security.push(entry.description);
        break;
      case "performance":
        manifest.performance.push(entry.description);
        break;
      case "infrastructure":
        manifest.infrastructure.push(entry.description);
        break;
      case "changed":
        manifest.breakingChanges.push(entry.description);
        break;
      default:
        break;
    }
  }

  return manifest;
}

export function writeReleaseManifest(manifest: ReleaseManifest): void {
  const dir = join(getRoot(), "data");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(
    getReleaseJsonPath(),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8"
  );

  const archiveDir = getReleaseArchiveDir();
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }

  const archivePath = join(archiveDir, `${manifest.version}.json`);
  writeFileSync(
    archivePath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8"
  );
}

export function readReleaseManifest(): ReleaseManifest | null {
  try {
    const raw = readFileSync(getReleaseJsonPath(), "utf-8");
    return JSON.parse(raw) as ReleaseManifest;
  } catch {
    return null;
  }
}

export function listReleaseArchives(): ReleaseManifest[] {
  const archiveDir = getReleaseArchiveDir();
  if (!existsSync(archiveDir)) return [];

  try {
    const { readdirSync } = require("node:fs");
    const files = readdirSync(archiveDir).filter((f: string) => f.endsWith(".json"));
    const releases: ReleaseManifest[] = [];

    for (const file of files) {
      try {
        const raw = readFileSync(join(archiveDir, file), "utf-8");
        releases.push(JSON.parse(raw));
      } catch {
        // skip corrupted files
      }
    }

    releases.sort((a, b) => new Date(b.buildDate).getTime() - new Date(a.buildDate).getTime());
    return releases;
  } catch {
    return [];
  }
}
