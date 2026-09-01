import { execSync } from "node:child_process";

const RELEASE_TYPE_ORDER = ["patch", "minor", "major"];

function exec(command) {
  try {
    return execSync(command, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return "";
  }
}

/**
 * Subject patterns that identify a commit as not user-facing changelog
 * material. These commits are excluded from generated CHANGELOG entries
 * and the bump signal (i.e. they never trigger a version bump on their
 * own). The list is intentionally explicit and conservative — false
 * positives hide real work.
 */
export const NOISE_COMMIT_PATTERNS = [
  // `release: v1.2.3` / `release v1.2.3` / `Release: v1.2.3`
  /^release:?\s*v?\d/i,
  // Bare version tags written as commit subjects, e.g. `v1.1.10`
  /^v\d+\.\d+(\.\d+)?$/i,
  // One-word / placeholder subjects that carry no meaning
  /^(rose|done|wip|test|tests|typo|merge|updates?)$/i,
  // `solved X` / `fixed X` with no scope — too vague to be a useful entry
  /^solved\s+(deploy|the\s+)/i,
];

export function isNoiseCommit(subject) {
  if (typeof subject !== "string") return false;
  const trimmed = subject.trim();
  if (!trimmed) return true;
  return NOISE_COMMIT_PATTERNS.some((re) => re.test(trimmed));
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

  if (
    /\bbreaking change\b/.test(bodyLower) ||
    /\bbreaking[- ]change:/i.test(bodyLower) ||
    /^feat!|^fix!|^feat\([^)]*\)!/i.test(subjectLower)
  ) {
    return "major";
  }

  if (/^feat(\(|\:)/.test(subjectLower)) {
    return "minor";
  }

  if (/^(fix|chore|docs|perf|refactor|build|ci|test|style|security)(\(|\:)/.test(subjectLower)) {
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

export function getCommitsSince(baseRef, { includeNoise = false } = {}) {
  const subjects = exec(`git log --format=%s ${baseRef}..HEAD`);
  const bodies = exec(`git log --format=%B ${baseRef}..HEAD`);

  if (!subjects) return [];

  const subjectLines = subjects.split("\n").filter(Boolean);
  const bodyChunks = bodies.split("\n\n\n").filter(Boolean);

  const commits = subjectLines.map((subject, i) => ({
    subject,
    _body: bodyChunks[i] || "",
  }));

  if (includeNoise) return commits;
  return commits.filter((c) => !isNoiseCommit(c.subject));
}

export function findLastVersionTag() {
  // Use `git describe --tags --abbrev=0 --match='v[0-9]*' HEAD` so we get
  // the most recent tag that is REACHABLE from HEAD, not just the highest
  // semver tag globally (the previous `git tag --list --sort=-v:refname`
  // could return a tag that isn't an ancestor of HEAD if e.g. someone
  // tagged a feature branch out of order). `--abbrev=0` strips the
  // distance/hash suffix. `--tags` covers lightweight tags too. `git
  // describe` exits non-zero when no matching tag is reachable, so the
  // wrapping `exec()` returns "" in that case.
  const tag = exec("git describe --tags --abbrev=0 --match='v[0-9]*' HEAD");
  return tag || null;
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

export function computeRelease(currentVersion, { includeNoise = false } = {}) {
  const baseRef = determineBaseRef(currentVersion);
  const commits = getCommitsSince(baseRef, { includeNoise });

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