import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TOOLS_DATA_PATH = path.join(ROOT, "src", "lib", "data", "tools.ts");
const COMPONENTS_DIR = path.join(ROOT, "src", "components", "tools");

// Read tools.ts
const toolsContent = fs.readFileSync(TOOLS_DATA_PATH, "utf8");

// Extract utility tool entries (category: "Utilities")
// Simple regex to capture each tool object with category Utilities
// This regex looks for objects with category: "Utilities" and captures the slug and export name (from dynamic-tool-loader)
// But we also need the component export name. We'll get slug from registry, and component file name matches slug (except special cases).
// We'll get all tools with category Utilities.
const toolRegex = /\{[^}]*category:\s*"Utilities"[^}]*slug:\s*"([^"]+)"[^}]*\}/g;
const utilitySlugs = [];
let match;
while ((match = toolRegex.exec(toolsContent)) !== null) {
  utilitySlugs.push(match[1]);
}

// Remove already migrated tools (dns-lookup, ip-lookup)
const alreadyDone = ["dns-lookup", "ip-lookup"];
const targetSlugs = utilitySlugs.filter(s => !alreadyDone.includes(s));

console.log(`Found ${targetSlugs.length} utility tools to migrate:`);
console.log(targetSlugs.join(", "));

// Read dynamic-tool-loader to get component export names
const loaderPath = path.join(COMPONENTS_DIR, "dynamic-tool-loader.tsx");
const loaderContent = fs.readFileSync(loaderPath, "utf8");
const loaderRegex = /"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)\.then\(\(m\)\s*=>\s*\{\s*default:\s*m\.(\w+)\s*\}\)/g;
const loaderMap = {};
let loaderMatch;
while ((loaderMatch = loaderRegex.exec(loaderContent)) !== null) {
  loaderMap[loaderMatch[1]] = {
    importPath: loaderMatch[2],
    exportName: loaderMatch[3],
  };
}

// For each target slug, check component file
const report = [];
for (const slug of targetSlugs) {
  const componentFile = path.join(COMPONENTS_DIR, `${slug}.tsx`);
  if (!fs.existsSync(componentFile)) {
    console.warn(`Component file not found for ${slug}: ${componentFile}`);
    continue;
  }
  const compContent = fs.readFileSync(componentFile, "utf8");

  // Check if UtilityShell import already present
  const hasImport = /import\s+\{[^}]*UtilityShell[^}]*\}\s+from\s+["']@\/components\/ui["']/.test(compContent);

  // If not, we will add it later (but for now just report)
  const loaderEntry = loaderMap[slug];
  const exportName = loaderEntry?.exportName || slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

  // Determine primary action and stats heuristically
  // We'll leave these as suggestions to be filled manually.
  // Get description from tools.ts for this slug
  const descRegex = new RegExp(`\\{[^}]*slug:\\s*"${slug}"[^}]*description:\\s*"([^"]+)"[^}]*\\}`);
  const descMatch = toolsContent.match(descRegex);
  const description = descMatch ? descMatch[1] : "";

  report.push({
    slug,
    componentFile: componentFile.replace(ROOT + path.sep, ""),
    exportName,
    hasUtilityShellImport: hasImport,
    suggestedTitle: exportName.replace(/([A-Z])/g, " $1").trim(),
    suggestedDescription: description,
    suggestedPrimaryAction: "Run", // placeholder
    suggestedStats: [], // placeholder
  });
}

// Write migration report
const reportPath = path.join(ROOT, "migration-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Migration report written to ${reportPath}`);

// Now add missing imports
for (const entry of report) {
  if (!entry.hasUtilityShellImport) {
    const compContent = fs.readFileSync(entry.componentFile, "utf8");
    // Find the first import block and add UtilityShell import
    // We'll insert after the last import from "@/components/ui"
    const importRegex = /(import\s+\{[^}]*\}\s+from\s+["']@\/components\/ui["'];)/;
    const match = compContent.match(importRegex);
    if (match) {
      const newImport = `${match[1]}\nimport { UtilityShell } from "@/components/ui";`;
      const newContent = compContent.replace(importRegex, newImport);
      fs.writeFileSync(entry.componentFile, newContent, "utf8");
      console.log(`Added UtilityShell import to ${entry.componentFile}`);
    } else {
      // If no import from @/components/ui, add after first import line
      const firstImport = compContent.match(/^import .+;/m);
      if (firstImport) {
        const newContent = compContent.replace(firstImport[0], `${firstImport[0]}\nimport { UtilityShell } from "@/components/ui";`);
        fs.writeFileSync(entry.componentFile, newContent, "utf8");
        console.log(`Added UtilityShell import to ${entry.componentFile} (fallback)`);
      } else {
        console.warn(`Could not find place to add import in ${entry.componentFile}`);
      }
    }
  }
}

console.log("Done.");