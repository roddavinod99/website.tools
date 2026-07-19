import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;

function readPackage() {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
}

function writePackage(pkg) {
  writeFileSync(join(ROOT, "package.json"), JSON.stringify(pkg, null, 2) + "\n", "utf-8");
}

function exec(command) {
  try {
    return execSync(command, { encoding: "utf-8", timeout: 5000, cwd: ROOT }).trim();
  } catch {
    return "";
  }
}

function getGitInfo() {
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

function getBuildNumber() {
  const path = join(ROOT, "data", "build-number.json");
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw).buildNumber || 0;
  } catch {
    return 0;
  }
}

function incrementBuildNumber() {
  const current = getBuildNumber();
  const next = current + 1;
  const dir = join(ROOT, "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "build-number.json"), JSON.stringify({ buildNumber: next }, null, 2) + "\n", "utf-8");
  return next;
}

function readChangelog(path) {
  const entries = [];
  try {
    const content = readFileSync(path, "utf-8");
    const lines = content.split("\n");
    let currentCat = null;
    for (const line of lines) {
      const catMatch = line.match(/^###\s+(.+)/);
      if (catMatch) {
        currentCat = catMatch[1].toLowerCase().trim();
        continue;
      }
      const entryMatch = line.match(/^-\s+(.+)/);
      if (entryMatch && currentCat) {
        entries.push({ type: currentCat, description: entryMatch[1].trim() });
      }
    }
  } catch {}
  return entries;
}

function detectDuplicate(existing, description) {
  const norm = description.trim().toLowerCase();
  return existing.some((e) => e.description.trim().toLowerCase() === norm);
}

const CATEGORY_NAMES = {
  added: "Added", fixed: "Fixed", changed: "Changed", removed: "Removed",
  security: "Security", performance: "Performance", refactored: "Refactored",
  infrastructure: "Infrastructure", seo: "SEO", accessibility: "Accessibility",
  dx: "Developer Experience", documentation: "Documentation", deprecated: "Deprecated",
};

const CATEGORY_KEYS = Object.keys(CATEGORY_NAMES);

function parseEntryLine(line) {
  const match = line.match(/^\[(\w+)\]\s+(.+)/);
  if (match && CATEGORY_NAMES[match[1].toLowerCase()]) {
    return { type: match[1].toLowerCase(), description: match[2].trim() };
  }
  return null;
}

function groupEntries(entries) {
  const grouped = {};
  for (const e of entries) {
    if (!grouped[e.type]) grouped[e.type] = [];
    grouped[e.type].push(e.description);
  }
  return grouped;
}

function formatReleaseSummary(entries, grouped) {
  const total = entries.length;
  const byType = Object.entries(CATEGORY_NAMES)
    .filter(([key]) => grouped[key]?.length)
    .map(([key, name]) => `  ${name}: ${grouped[key].length}`)
    .join("\n");
  return `Total changes: ${total}\n${byType}`;
}

const VALID_CATEGORIES = CATEGORY_KEYS.join(", ");

async function promptUser(query) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (answer) => { rl.close(); resolve(answer.trim()); }));
}

async function promptMultiLine(query) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(query);
  const lines = [];
  return new Promise((resolve) => {
    rl.on("line", (line) => {
      if (line.trim() === "") {
        rl.close();
        resolve(lines);
      } else {
        lines.push(line.trim());
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isNonInteractive = args.includes("--file") || args.includes("--entry");

  // Parse current version
  const pkg = readPackage();
  const currentVersion = pkg.version || "0.0.0";
  const [majorStr, minorStr, patchStr] = currentVersion.split(".");
  const major = parseInt(majorStr, 10) || 0;
  const minor = parseInt(minorStr, 10) || 0;
  const patch = parseInt(patchStr, 10) || 0;

  console.log(`\n  Current version: ${currentVersion}\n`);

  // Get release type
  let releaseType;
  if (isNonInteractive) {
    const typeIndex = args.findIndex((a) => ["major", "minor", "patch", "custom"].includes(a));
    releaseType = typeIndex >= 0 ? args[typeIndex] : "patch";
  } else {
    const answer = (await promptUser("  Choose release type [major/minor/patch/custom]: ")).toLowerCase();
    releaseType = answer || "patch";
  }

  if (!["major", "minor", "patch", "custom"].includes(releaseType)) {
    console.error(`\n  Invalid release type: ${releaseType}`);
    process.exit(1);
  }

  // Calculate next version
  let nextMajor = major, nextMinor = minor, nextPatch = patch;
  if (releaseType === "major") { nextMajor++; nextMinor = 0; nextPatch = 0; }
  else if (releaseType === "minor") { nextMinor++; nextPatch = 0; }
  else if (releaseType === "patch") { nextPatch++; }
  const nextVersion = `${nextMajor}.${nextMinor}.${nextPatch}`;
  const today = new Date().toISOString().split("T")[0];

  console.log(`  Next version: ${nextVersion}\n`);

  // Collect changelog entries
  const existingEntries = readChangelog(join(ROOT, "CHANGELOG.md"));
  const entries = [];

  if (args.includes("--file")) {
    const fileIndex = args.indexOf("--file") + 1;
    if (fileIndex < args.length) {
      try {
        const content = readFileSync(join(ROOT, args[fileIndex]), "utf-8");
        for (const line of content.split("\n").filter(Boolean)) {
          const parsed = parseEntryLine(line);
          if (parsed) entries.push(parsed);
        }
      } catch (err) {
        console.error(`  Error reading file: ${err.message}`);
        process.exit(1);
      }
    }
  } else if (args.includes("--entry")) {
    const entryIndex = args.indexOf("--entry") + 1;
    if (entryIndex < args.length) {
      const parsed = parseEntryLine(args[entryIndex]);
      if (parsed) entries.push(parsed);
    }
    const typeIndex = args.indexOf("--type");
    if (typeIndex >= 0 && typeIndex + 1 < args.length) {
      const type = args[typeIndex + 1].toLowerCase();
      if (CATEGORY_NAMES[type] && entries.length === 0) {
        entries.push({ type, description: args[entryIndex] || "Update" });
      }
    }
  } else {
    console.log("  Enter changelog entries (one per line, format: [Category] description)");
    console.log(`  Categories: ${VALID_CATEGORIES}`);
    console.log("  Empty line to finish:\n");

    const lines = await promptMultiLine("  > ");
    for (const line of lines) {
      const parsed = parseEntryLine(line);
      if (parsed) {
        if (detectDuplicate(existingEntries, parsed.description)) {
          console.log(`  ⚠ Duplicate skipped: "${parsed.description}"`);
          continue;
        }
        entries.push(parsed);
      } else {
        console.log(`  ⚠ Could not parse (skipped): "${line}"`);
        console.log(`    Use format: [Category] description (e.g., [Added] New feature)`);
      }
    }
  }

  if (entries.length === 0) {
    console.log("\n  No entries collected. Adding default entry.");
    entries.push({ type: "changed", description: "Maintenance update" });
  }

  const grouped = groupEntries(entries);
  console.log(`\n  Collected ${entries.length} change(s):`);
  for (const [type, descs] of Object.entries(grouped)) {
    console.log(`    ${CATEGORY_NAMES[type] || type}:`);
    for (const d of descs) {
      console.log(`      - ${d}`);
    }
  }

  // Preview
  console.log("\n  --- Preview ---");
  console.log(`  ## [${nextVersion}] - ${today}\n`);
  for (const [type, descs] of Object.entries(grouped)) {
    console.log(`  ### ${CATEGORY_NAMES[type] || type}`);
    for (const d of descs) {
      console.log(`  - ${d}`);
    }
    console.log("");
  }

  // Confirm
  if (!isNonInteractive) {
    const confirm = (await promptUser("\n  Confirm release? [y/N]: ")).toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("\n  Release cancelled.");
      process.exit(0);
    }
  }

  // Execute release
  console.log("\n  Releasing...");

  // 1. Update package.json
  pkg.version = nextVersion;
  writePackage(pkg);
  console.log(`  ✓ Updated package.json to ${nextVersion}`);

  // 2. Generate build number
  const buildNumber = incrementBuildNumber();
  console.log(`  ✓ Build number: ${buildNumber}`);

  // 3. Write release.json
  const git = getGitInfo();
  const releaseManifest = {
    version: nextVersion,
    buildNumber,
    gitCommit: git.commit,
    buildDate: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: (grouped.added || []).filter(Boolean),
    fixes: (grouped.fixed || []).filter(Boolean),
    breakingChanges: [...(grouped.removed || []), ...(grouped.changed || [])].filter(Boolean),
    security: (grouped.security || []).filter(Boolean),
    performance: (grouped.performance || []).filter(Boolean),
    infrastructure: (grouped.infrastructure || []).filter(Boolean),
  };

  const dataDir = join(ROOT, "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "release.json"), JSON.stringify(releaseManifest, null, 2) + "\n", "utf-8");
  console.log("  ✓ Generated release.json");

  // Archive
  const archiveDir = join(dataDir, "releases");
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
  writeFileSync(join(archiveDir, `${nextVersion}.json`), JSON.stringify(releaseManifest, null, 2) + "\n", "utf-8");
  console.log(`  ✓ Archived data/releases/${nextVersion}.json`);

  // 4. Update CHANGELOG.md
  const changelogPath = join(ROOT, "CHANGELOG.md");
  let changelogContent;
  try {
    changelogContent = readFileSync(changelogPath, "utf-8");
  } catch {
    changelogContent = "# Changelog\n\n";
  }

  let newSection = `\n## [${nextVersion}] - ${today}\n`;
  let appended = 0;
  for (const [type, descs] of Object.entries(grouped)) {
    newSection += `\n### ${CATEGORY_NAMES[type] || type}\n`;
    for (const d of descs) {
      newSection += `\n- ${d}`;
      appended++;
    }
  }

  const templateIndex = changelogContent.indexOf("\n## Template");
  const insertPoint = templateIndex >= 0 ? templateIndex : changelogContent.length;
  changelogContent = changelogContent.slice(0, insertPoint) + newSection + changelogContent.slice(insertPoint);
  writeFileSync(changelogPath, changelogContent, "utf-8");
  console.log(`  ✓ Updated CHANGELOG.md (${appended} entries)`);

  // 5. Generate release notes
  const releaseNotes = [
    `# Release ${nextVersion}\n`,
    ...Object.entries(grouped).flatMap(([type, descs]) => [
      `## ${CATEGORY_NAMES[type] || type}\n`,
      ...descs.map((d) => `- ${d}`),
      "",
    ]),
  ].join("\n");

  const notesPath = join(ROOT, "data", `release-notes-${nextVersion}.md`);
  writeFileSync(notesPath, releaseNotes, "utf-8");
  console.log(`  ✓ Generated release notes: data/release-notes-${nextVersion}.md`);

  // 6. Regenerate prebuild data
  try {
    exec("node scripts/prebuild.mjs");
    console.log("  ✓ Regenerated build data");
  } catch {
    console.log("  ⚠ Could not regenerate build data (run 'npm run prebuild' manually)");
  }

  // Summary
  console.log("\n  ─────────────────────────────");
  console.log("  Release Complete");
  console.log("  ─────────────────────────────");
  console.log(`  Version:    ${currentVersion} → ${nextVersion}`);
  console.log(`  Build:      ${buildNumber}`);
  console.log(`  Branch:     ${git.branch}`);
  console.log(`  Commit:     ${git.shortHash}`);
  console.log(`  Changes:    ${entries.length}`);
  console.log("  ─────────────────────────────");
  console.log(`\n  To deploy: git add -A && git commit -m "release: v${nextVersion}" && git push\n`);
}

main().catch((err) => {
  console.error("\n  Release failed:", err.message);
  process.exit(1);
});
