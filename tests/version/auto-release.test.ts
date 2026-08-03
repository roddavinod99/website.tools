import { describe, it, expect } from "vitest";
import {
  parseSemVer,
  formatVersion,
  incrementVersion,
  getReleaseTypeForCommit,
  getMaxReleaseType,
  getCategoryFromSubject,
  stripConventionalPrefix,
  createChangelogEntry,
} from "../../scripts/lib/auto-version.mjs";

describe("auto-version lib", () => {
  describe("parseSemVer", () => {
    it("parses basic semver", () => {
      const v = parseSemVer("1.2.3");
      expect(v).toEqual({ major: 1, minor: 2, patch: 3, prerelease: null, build: null });
    });

    it("parses semver with prerelease", () => {
      const v = parseSemVer("1.2.3-alpha.1");
      expect(v).toEqual({ major: 1, minor: 2, patch: 3, prerelease: "alpha.1", build: null });
    });

    it("parses semver with build", () => {
      const v = parseSemVer("1.2.3+build.123");
      expect(v).toEqual({ major: 1, minor: 2, patch: 3, prerelease: null, build: "build.123" });
    });

    it("returns null for invalid", () => {
      expect(parseSemVer("not-a-version")).toBeNull();
    });
  });

  describe("formatVersion", () => {
    it("formats version object", () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3 })).toBe("1.2.3");
    });
  });

  describe("incrementVersion", () => {
    it("increments major", () => {
      expect(incrementVersion({ major: 1, minor: 2, patch: 3 }, "major")).toEqual({ major: 2, minor: 0, patch: 0 });
    });

    it("increments minor", () => {
      expect(incrementVersion({ major: 1, minor: 2, patch: 3 }, "minor")).toEqual({ major: 1, minor: 3, patch: 0 });
    });

    it("increments patch", () => {
      expect(incrementVersion({ major: 1, minor: 2, patch: 3 }, "patch")).toEqual({ major: 1, minor: 2, patch: 4 });
    });
  });

  describe("getReleaseTypeForCommit", () => {
    it("detects major from breaking change in body", () => {
      expect(getReleaseTypeForCommit("feat: add thing", "BREAKING CHANGE: api changed")).toBe("major");
    });

    it("detects major from feat! prefix", () => {
      expect(getReleaseTypeForCommit("feat!: new api", "")).toBe("major");
    });

    it("detects major from fix! prefix", () => {
      expect(getReleaseTypeForCommit("fix!: hotfix", "")).toBe("major");
    });

    it("detects minor from feat:", () => {
      expect(getReleaseTypeForCommit("feat: add feature", "")).toBe("minor");
    });

    it("detects minor from feat(scope):", () => {
      expect(getReleaseTypeForCommit("feat(auth): add login", "")).toBe("minor");
    });

    it("detects patch from fix:", () => {
      expect(getReleaseTypeForCommit("fix: bug fix", "")).toBe("patch");
    });

    it("detects patch from chore:", () => {
      expect(getReleaseTypeForCommit("chore: cleanup", "")).toBe("patch");
    });

    it("detects patch from docs:", () => {
      expect(getReleaseTypeForCommit("docs: update readme", "")).toBe("patch");
    });

    it("detects patch from perf:", () => {
      expect(getReleaseTypeForCommit("perf: improve speed", "")).toBe("patch");
    });

    it("detects patch from refactor:", () => {
      expect(getReleaseTypeForCommit("refactor: clean code", "")).toBe("patch");
    });

    it("detects patch from build:", () => {
      expect(getReleaseTypeForCommit("build: update deps", "")).toBe("patch");
    });

    it("detects patch from ci:", () => {
      expect(getReleaseTypeForCommit("ci: fix pipeline", "")).toBe("patch");
    });

    it("detects patch from test:", () => {
      expect(getReleaseTypeForCommit("test: add tests", "")).toBe("patch");
    });

    it("detects patch from style:", () => {
      expect(getReleaseTypeForCommit("style: format", "")).toBe("patch");
    });

    it("detects patch from security:", () => {
      expect(getReleaseTypeForCommit("security: fix vuln", "")).toBe("patch");
    });

    it("defaults to patch for non-conventional", () => {
      expect(getReleaseTypeForCommit("New updates", "")).toBe("patch");
      expect(getReleaseTypeForCommit("WIP", "")).toBe("patch");
    });
  });

  describe("getMaxReleaseType", () => {
    it("returns highest type", () => {
      expect(getMaxReleaseType(["patch", "minor"])).toBe("minor");
      expect(getMaxReleaseType(["patch", "major"])).toBe("major");
      expect(getMaxReleaseType(["minor", "major"])).toBe("major");
      expect(getMaxReleaseType(["patch"])).toBe("patch");
    });

    it("defaults to patch for empty", () => {
      expect(getMaxReleaseType([])).toBe("patch");
    });
  });

  describe("getCategoryFromSubject", () => {
    it("maps feat to added", () => {
      expect(getCategoryFromSubject("feat: add thing")).toBe("added");
    });

    it("maps feature to added", () => {
      expect(getCategoryFromSubject("feature: add thing")).toBe("added");
    });

    it("maps fix to fixed", () => {
      expect(getCategoryFromSubject("fix: bug fix")).toBe("fixed");
    });

    it("maps perf to performance", () => {
      expect(getCategoryFromSubject("perf: speed up")).toBe("performance");
    });

    it("maps chore to infrastructure", () => {
      expect(getCategoryFromSubject("chore: cleanup")).toBe("infrastructure");
    });

    it("maps build to infrastructure", () => {
      expect(getCategoryFromSubject("build: update deps")).toBe("infrastructure");
    });

    it("maps ci to infrastructure", () => {
      expect(getCategoryFromSubject("ci: fix pipeline")).toBe("infrastructure");
    });

    it("maps docs to documentation", () => {
      expect(getCategoryFromSubject("docs: update readme")).toBe("documentation");
    });

    it("maps refactor to refactored", () => {
      expect(getCategoryFromSubject("refactor: clean code")).toBe("refactored");
    });

    it("maps security to security", () => {
      expect(getCategoryFromSubject("security: fix vuln")).toBe("security");
    });

    it("maps test to changed", () => {
      expect(getCategoryFromSubject("test: add tests")).toBe("changed");
    });

    it("maps style to changed", () => {
      expect(getCategoryFromSubject("style: format")).toBe("changed");
    });

    it("defaults to changed for unknown", () => {
      expect(getCategoryFromSubject("random: thing")).toBe("changed");
      expect(getCategoryFromSubject("WIP")).toBe("changed");
    });
  });

  describe("stripConventionalPrefix", () => {
    it("strips feat:", () => {
      expect(stripConventionalPrefix("feat: add thing")).toBe("add thing");
    });

    it("strips feat(scope):", () => {
      expect(stripConventionalPrefix("feat(auth): add login")).toBe("add login");
    });

    it("strips fix:", () => {
      expect(stripConventionalPrefix("fix: bug fix")).toBe("bug fix");
    });

    it("strips chore:", () => {
      expect(stripConventionalPrefix("chore: cleanup")).toBe("cleanup");
    });

    it("returns original for non-conventional", () => {
      expect(stripConventionalPrefix("New updates")).toBe("New updates");
      expect(stripConventionalPrefix("WIP")).toBe("WIP");
    });
  });

  describe("createChangelogEntry", () => {
    it("creates entry with category and stripped description", () => {
      const entry = createChangelogEntry("feat: add user login");
      expect(entry).toEqual({ category: "added", description: "add user login" });
    });

    it("creates entry for fix", () => {
      const entry = createChangelogEntry("fix: resolve login issue");
      expect(entry).toEqual({ category: "fixed", description: "resolve login issue" });
    });

    it("creates entry for non-conventional", () => {
      const entry = createChangelogEntry("New updates");
      expect(entry).toEqual({ category: "changed", description: "New updates" });
    });
  });
});