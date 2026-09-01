import { describe, it, expect } from "vitest";
import {
  isNoiseCommit,
  NOISE_COMMIT_PATTERNS,
  getReleaseTypeForCommit,
  parseSemVer,
  incrementVersion,
  formatVersion,
  createChangelogEntry,
  stripConventionalPrefix,
  getCategoryFromSubject,
  getMaxReleaseType,
} from "../scripts/lib/auto-version.mjs";

describe("isNoiseCommit", () => {
  it("flags bare version subjects as noise", () => {
    expect(isNoiseCommit("v1.1.12")).toBe(true);
    expect(isNoiseCommit("v1.0")).toBe(true);
  });

  it("flags 'release: vX.Y.Z' / 'release vX.Y.Z' subjects", () => {
    expect(isNoiseCommit("release: v1.1.12")).toBe(true);
    expect(isNoiseCommit("release v1.1.12")).toBe(true);
    expect(isNoiseCommit("Release: v1.1.0")).toBe(true);
  });

  it("flags one-word / placeholder subjects", () => {
    expect(isNoiseCommit("rose")).toBe(true);
    expect(isNoiseCommit("done")).toBe(true);
    expect(isNoiseCommit("WIP")).toBe(true);
    expect(isNoiseCommit("typo")).toBe(true);
    expect(isNoiseCommit("merge")).toBe(true);
  });

  it("flags 'solved deploy issue.' style subjects", () => {
    expect(isNoiseCommit("solved deploy issue.")).toBe(true);
    expect(isNoiseCommit("solved the css bug")).toBe(true);
  });

  it("flags empty / whitespace-only subjects", () => {
    expect(isNoiseCommit("")).toBe(true);
    expect(isNoiseCommit("   ")).toBe(true);
  });

  it("does NOT flag conventional commits", () => {
    expect(isNoiseCommit("feat(seo): add sitemap")).toBe(false);
    expect(isNoiseCommit("fix: resolve crash on /tools")).toBe(false);
    expect(isNoiseCommit("refactor(tools): centralize JSON-LD")).toBe(false);
  });

  it("does NOT flag legitimate descriptive subjects", () => {
    expect(isNoiseCommit("guide page issue solved")).toBe(false);
    expect(isNoiseCommit("Update README")).toBe(false);
  });

  it("exports the pattern list for inspection", () => {
    expect(Array.isArray(NOISE_COMMIT_PATTERNS)).toBe(true);
    expect(NOISE_COMMIT_PATTERNS.length).toBeGreaterThan(0);
  });
});

describe("getReleaseTypeForCommit", () => {
  it("promotes to major on 'BREAKING CHANGE:' footer", () => {
    expect(
      getReleaseTypeForCommit("feat(api): add endpoint", "BREAKING CHANGE: drops v1"),
    ).toBe("major");
  });

  it("promotes to major on 'Breaking Change:' in body", () => {
    expect(
      getReleaseTypeForCommit("feat: thing", "Some body.\n\nBreaking change: removed legacy mode"),
    ).toBe("major");
  });

  it("promotes to major on 'feat!' / 'feat(scope)!' subjects", () => {
    expect(getReleaseTypeForCommit("feat!: drop legacy")).toBe("major");
    expect(getReleaseTypeForCommit("feat(api)!, drop legacy")).toBe("major");
    expect(getReleaseTypeForCommit("fix!: behavior change")).toBe("major");
  });

  it("returns minor for plain feat:", () => {
    expect(getReleaseTypeForCommit("feat: add thing")).toBe("minor");
    expect(getReleaseTypeForCommit("feat(ui): add button")).toBe("minor");
  });

  it("returns patch for fix / chore / docs / perf / refactor / build / ci / test / style / security", () => {
    expect(getReleaseTypeForCommit("fix: bug")).toBe("patch");
    expect(getReleaseTypeForCommit("chore: cleanup")).toBe("patch");
    expect(getReleaseTypeForCommit("docs: readme")).toBe("patch");
    expect(getReleaseTypeForCommit("perf: optimize")).toBe("patch");
    expect(getReleaseTypeForCommit("refactor: dedupe")).toBe("patch");
    expect(getReleaseTypeForCommit("build: bump")).toBe("patch");
    expect(getReleaseTypeForCommit("ci: workflow")).toBe("patch");
    expect(getReleaseTypeForCommit("test: add unit")).toBe("patch");
    expect(getReleaseTypeForCommit("style: format")).toBe("patch");
    expect(getReleaseTypeForCommit("security: patch xss")).toBe("patch");
  });
});

describe("getMaxReleaseType", () => {
  it("returns the highest rank across commits", () => {
    expect(getMaxReleaseType(["patch", "minor"])).toBe("minor");
    expect(getMaxReleaseType(["patch", "major"])).toBe("major");
    expect(getMaxReleaseType(["minor", "patch", "patch"])).toBe("minor");
  });

  it("returns patch for an empty list", () => {
    expect(getMaxReleaseType([])).toBe("patch");
  });
});

describe("semver", () => {
  it("parses a plain X.Y.Z", () => {
    expect(parseSemVer("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3, prerelease: null, build: null });
  });

  it("rejects garbage", () => {
    expect(parseSemVer("not-a-version")).toBe(null);
  });

  it("increments correctly", () => {
    expect(formatVersion(incrementVersion({ major: 1, minor: 2, patch: 3 }, "patch"))).toBe("1.2.4");
    expect(formatVersion(incrementVersion({ major: 1, minor: 2, patch: 3 }, "minor"))).toBe("1.3.0");
    expect(formatVersion(incrementVersion({ major: 1, minor: 2, patch: 3 }, "major"))).toBe("2.0.0");
  });
});

describe("changelog entry helpers", () => {
  it("strips conventional prefixes", () => {
    expect(stripConventionalPrefix("feat(seo): add sitemap")).toBe("add sitemap");
    expect(stripConventionalPrefix("fix: bug")).toBe("bug");
  });

  it("maps prefixes to changelog categories", () => {
    expect(getCategoryFromSubject("feat: x")).toBe("added");
    expect(getCategoryFromSubject("fix: x")).toBe("fixed");
    expect(getCategoryFromSubject("perf: x")).toBe("performance");
    expect(getCategoryFromSubject("chore: x")).toBe("infrastructure");
    expect(getCategoryFromSubject("docs: x")).toBe("documentation");
    expect(getCategoryFromSubject("refactor: x")).toBe("refactored");
    expect(getCategoryFromSubject("security: x")).toBe("security");
    expect(getCategoryFromSubject("random subject")).toBe("changed");
  });

  it("creates a changelog entry from a subject", () => {
    expect(createChangelogEntry("fix: a bug")).toEqual({ category: "fixed", description: "a bug" });
  });
});
