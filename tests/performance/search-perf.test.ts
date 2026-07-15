import { describe, it, expect } from "vitest";
import { searchTools } from "@/lib/search";
import { allTools } from "@/lib/constants";

describe("Search Performance", () => {
  it("should search through all tools in under 50ms", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      searchTools(allTools, "json");
    }
    const elapsed = performance.now() - start;
    console.log(`100 searches took ${elapsed.toFixed(2)}ms (${(elapsed / 100).toFixed(3)}ms avg)`);
    expect(elapsed).toBeLessThan(5000); // 50ms per search average
  });

  it("should return relevant results for common queries", () => {
    const jsonResults = searchTools(allTools, "json formatter");
    expect(jsonResults.length).toBeGreaterThan(0);
    expect(jsonResults[0].slug).toBe("json-formatter");
  });

  it("should handle empty queries gracefully", () => {
    const results = searchTools(allTools, "");
    expect(results).toHaveLength(0);
  });

  it("should handle very long queries without hanging", () => {
    const longQuery = "a".repeat(1000);
    const start = performance.now();
    searchTools(allTools, longQuery);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
