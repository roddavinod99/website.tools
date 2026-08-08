import { execSync } from "node:child_process";

const RELEASE_TYPE_ORDER = ["patch", "minor", "major"];

function exec(command) {
  try {
    return execSync(command, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return "";
  }
}

export function parseSemVer(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    build: match[5] || null,
  };
}

export function formatVersion(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

export function incrementVersion(current, type) {
  const v = { ...current };
  if (type === "major") {
    v.major++;
    v.minor = 0;
    v.patch = 0;
  } else if (type === "minor") {
    v.minor++;
    v.patch = 0;
  } else if (type === "patch") {
    v.patch++;
  }
  return v;
}

export function getReleaseTypeForCommit(subject, body = "") {
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();
  
  if (/\b(breaking change|breaks?)\b/.test(bodyLower) || /^feat!|^fix!|^feat\([^)]*\)!/.test(subjectLower)) {
    return "major";
  }
  
  if (/^feat\(|^feat:/.test(subjectLower)) {
    return "minor";
  }
  
  if (/^(fix|chore|docs|perf|refactor|build|ci|test|style|security)(\(|:)/.test(subjectLower)) {
    return "patch";
  }
  
  return "patch";
}

export function getMaxReleaseType(types) {
  if (!types.length) return "patch";
  const idx = Math.max(...types.map(t => RELEASE_TYPE_ORDER.indexOf(t)));
  return RELEASE_TYPE_ORDER[idx];
}

const CATEGORY_MAP = {
  feat: "added",
  feature: "added",
  fix: "fixed",
  perf: "performance",
  chore: "infrastructure",
  build: "infrastructure",
  ci: "infrastructure",
  docs: "documentation",
  refactor: "refactored",
  security: "security",
  test: "changed",
  style: "changed",
};

export function getCategoryFromSubject(subject) {
  const match = subject.match(/^(\w+)(\(|:)/);
  if (!match) return "changed";
  const prefix = match[1].toLowerCase();
  return CATEGORY_MAP[prefix] || "changed";
}

const CONVENTIONAL_PREFIX_REGEX = /^\w+(\([^)]*\))?:\s*/;

export function stripConventionalPrefix(subject) {
  return subject.replace(CONVENTIONAL_PREFIX_REGEX, "");
}

export function createChangelogEntry(subject) {
  const category = getCategoryFromSubject(subject);
  const description = stripConventionalPrefix(subject);
  return { category, description };
}

export function getCommitsSince(baseRef) {
  const subjects = exec(`git log --format=%s ${baseRef}..HEAD`);
  const bodies = exec(`git log --format=%B ${baseRef}..HEAD`);
  
  if (!subjects) return [];
  
  const lines = subjects.split("\n").filter(Boolean);
  const bodiesArr = bodies.split("\n\n\n").filter(Boolean);
  
  return lines.map((subject, i) => ({
    subject,
    _body: bodiesArr[i] || "",
  }));
}

export function findLastVersionTag() {
  // No shell glob: "git tag -l 'v[0-9]*'" breaks under cmd.exe on Windows.
  const tags = exec("git tag --list --sort=-v:refname");
  if (!tags) return null;
  const versionTag = tags
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => /^v[0-9]/.test(t))[0];
  return versionTag || null;
}

export function findVersionCommit(version) {
  const commits = exec(`git log --format=%H -- package.json`);
  if (!commits) return null;
  for (const commit of commits.split("\n").filter(Boolean)) {
    const pkgContent = exec(`git show ${commit}:package.json`);
    try {
      const pkg = JSON.parse(pkgContent);
      if (pkg.version === version) return commit;
    } catch {}
  }
  return null;
}

export function determineBaseRef(currentVersion) {
  const tag = findLastVersionTag();
  if (tag) return tag;
  
  const versionCommit = findVersionCommit(currentVersion);
  if (versionCommit) return versionCommit;
  
  return exec("git rev-list --max-parents=0 HEAD");
}

export function computeRelease(currentVersion) {
  const baseRef = determineBaseRef(currentVersion);
  const commits = getCommitsSince(baseRef);
  
  if (!commits.length) {
    return { bumped: false, version: currentVersion, entries: [], reason: "no new commits since last release" };
  }
  
  const types = commits.map(c => getReleaseTypeForCommit(c.subject, c._body));
  const releaseType = getMaxReleaseType(types);
  const entries = commits.map(c => createChangelogEntry(c.subject));
  
  const current = parseSemVer(currentVersion);
  const next = incrementVersion(current, releaseType);
  const nextVersion = formatVersion(next);
  
  return { bumped: true, version: nextVersion, entries, releaseType, baseRef };
}

export async function writeEntriesFile(entries, path) {
  const lines = entries.map(e => `[${e.category.charAt(0).toUpperCase() + e.category.slice(1)}] ${e.description}`);
  const content = lines.join("\n") + "\n";
  const fs = await import("node:fs");
  const pathModule = await import("node:path");
  const dir = pathModule.dirname(path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path, content, "utf-8");
  return path;
}