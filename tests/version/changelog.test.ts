import { describe, it, expect } from "vitest";
import { generateReleaseNotes } from "@/lib/version/changelog";
import type { ChangelogEntry } from "@/lib/version/types";

describe("generateReleaseNotes", () => {
  it("generates notes with multiple categories", () => {
    const entries: ChangelogEntry[] = [
      { type: "added", description: "New tool: QR Code Generator" },
      { type: "fixed", description: "Fixed dark mode toggle" },
      { type: "security", description: "Updated CSP headers" },
    ];

    const notes = generateReleaseNotes("1.1.0", entries);

    expect(notes).toContain("# Release 1.1.0");
    expect(notes).toContain("## Added");
    expect(notes).toContain("New tool: QR Code Generator");
    expect(notes).toContain("## Fixed");
    expect(notes).toContain("Fixed dark mode toggle");
    expect(notes).toContain("## Security");
    expect(notes).toContain("Updated CSP headers");
  });

  it("handles empty entries", () => {
    const notes = generateReleaseNotes("1.0.0", []);
    expect(notes).toContain("# Release 1.0.0");
  });

  it("handles all known categories", () => {
    const categories: ChangelogEntry["type"][] = [
      "added", "changed", "deprecated", "removed", "fixed", "security",
      "performance", "refactored", "infrastructure", "seo",
      "accessibility", "documentation", "dx",
    ];
    const entries = categories.map((type) => ({ type, description: `Test ${type}` }));
    const notes = generateReleaseNotes("2.0.0", entries);
    for (const cat of categories) {
      expect(notes).toContain(`Test ${cat}`);
    }
  });
});
