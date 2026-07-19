import { execSync } from "node:child_process";
import type { GitInfo } from "./types";

function exec(command: string): string {
  try {
    return execSync(command, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return "";
  }
}

export function getGitInfo(): GitInfo {
  const commit = exec("git log -1 --format=%H");
  const branch = exec("git rev-parse --abbrev-ref HEAD");
  const countStr = exec("git rev-list --count HEAD");
  const status = exec("git status --porcelain");

  const count = parseInt(countStr, 10);

  return {
    commit: commit || "0000000000000000000000000000000000000000",
    shortHash: commit ? commit.slice(0, 7) : "0000000",
    branch: branch || "unknown",
    commitCount: !isNaN(count) && count > 0 ? count : 0,
    isDirty: status.length > 0,
  };
}

export function isGitAvailable(): boolean {
  try {
    execSync("git --version", { encoding: "utf-8", timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
