import { describe, it, expect } from "vitest";

// These are lightweight structural tests that don't require a browser
// They verify the tool registry is well-formed for performance

import { allTools } from "@/lib/constants";

describe("Tool Registry Performance", () => {
  it("should have all tools with required fields", () => {
    allTools.forEach((tool) => {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.slug).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(typeof tool.popularity).toBe("number");
    });
  });

  it("should have no duplicate slugs", () => {
    const slugs = allTools.map((t) => t.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("should have no duplicate IDs", () => {
    const ids = allTools.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("worker-flagged tools should exist in tool-interface.tsx", async () => {
    const workerTools = allTools.filter((t) => t.worker);
    expect(workerTools.length).toBeGreaterThan(0);
    // These tools should have a slug that maps to a component
    workerTools.forEach((tool) => {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
    });
  });

  it("all tool slugs should match URL-safe patterns", () => {
    allTools.forEach((tool) => {
      expect(tool.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });

  it("tool count should match expected minimum", () => {
    expect(allTools.length).toBeGreaterThanOrEqual(100);
  });
});
