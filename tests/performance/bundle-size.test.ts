import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const NEXT_BUILD_DIR = join(process.cwd(), ".next");

function getBuildChunkSizes(): { name: string; size: number }[] {
  try {
    const chunksDir = join(NEXT_BUILD_DIR, "static", "chunks");
    const files = readdirSync(chunksDir);
    return files
      .filter((f) => f.endsWith(".js"))
      .map((f) => ({
        name: f,
        size: statSync(join(chunksDir, f)).size,
      }))
      .sort((a, b) => b.size - a.size);
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

describe("Bundle Size Budgets", () => {
  const chunks = getBuildChunkSizes();

  if (chunks.length === 0) {
    it.skip("No build artifacts found. Run `npm run build` first.", () => {});
    return;
  }

  it("should not have any single chunk over 500 KB", () => {
    const oversized = chunks.filter((c) => c.size > 500 * 1024);
    if (oversized.length > 0) {
      console.error(
        "Oversized chunks:",
        oversized.map((c) => `  ${c.name}: ${formatBytes(c.size)}`).join("\n")
      );
    }
    expect(oversized).toHaveLength(0);
  });

  it("should report largest chunks for monitoring", () => {
    const top5 = chunks.slice(0, 5);
    console.log("Top 5 largest chunks:");
    top5.forEach((c) => console.log(`  ${c.name}: ${formatBytes(c.size)}`));
    expect(top5.length).toBeGreaterThan(0);
  });

  it("total JS bundle should be under 5 MB", () => {
    const totalSize = chunks.reduce((acc, c) => acc + c.size, 0);
    console.log(`Total JS size: ${formatBytes(totalSize)}`);
    expect(totalSize).toBeLessThan(5 * 1024 * 1024);
  });
});
