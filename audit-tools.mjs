import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);

// Read all data sources
const toolsContent = fs.readFileSync(path.join(projectRoot, "src", "lib", "data", "tools.ts"), "utf8");
const loaderContent = fs.readFileSync(path.join(projectRoot, "src", "components", "tools", "dynamic-tool-loader.tsx"), "utf8");

// Get component files
const componentsDir = path.join(projectRoot, "src", "components", "tools");
const componentFiles = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith(".tsx") && !["dynamic-tool-loader.tsx", "finance-disclaimer.tsx", "share-buttons.tsx"].includes(f))
  .map(f => f.replace(".tsx", ""));

// Get content files
const contentDir = path.join(projectRoot, "src", "content", "tools");
const contentFiles = fs.readdirSync(contentDir)
  .filter(f => f.endsWith(".json"))
  .map(f => f.replace(".json", ""));

// Parse registry
const toolRegex = /\{[^}]*id:\s*"([^"]+)"[^}]*name:\s*"([^"]+)"[^}]*description:\s*"([^"]*)"[^}]*category:\s*"([^"]+)"[^}]*slug:\s*"([^"]+)"[^}]*popularity:\s*(\d+)[^}]*icon:\s*"([^"]+)"([^}]*)\}/g;
const registryTools = [];
let match;
while ((match = toolRegex.exec(toolsContent)) !== null) {
  const extra = match[8];
  registryTools.push({
    id: match[1],
    name: match[2],
    description: match[3],
    category: match[4],
    slug: match[5],
    popularity: parseInt(match[6]),
    icon: match[7],
    featured: extra.includes("featured: true"),
    trending: extra.includes("trending: true"),
    new: extra.includes("new: true"),
    noindex: extra.includes("noindex: true"),
    worker: extra.includes("worker: true"),
    wasm: extra.includes("wasm: true"),
    processing: extra.includes("processing: \"server\"") ? "server" : "client",
    aliasSlugs: extra.match(/aliasSlugs:\s*\[([^\]]*)\]/)?.[1]?.split(",").map(s => s.trim().replace(/["']/g, "")) || [],
    keywords: extra.match(/keywords:\s*\[([^\]]*)\]/)?.[1]?.split(",").map(s => s.trim().replace(/["']/g, "")) || [],
  });
}

// Parse dynamic tool loader
const loaderMap = {};
const loaderRegex = /"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)\.then\(\(m\)\s*=>\s*\{\s*default:\s*m\.(\w+)\s*\}\)/g;
let loaderMatch;
while ((loaderMatch = loaderRegex.exec(loaderContent)) !== null) {
  loaderMap[loaderMatch[1]] = {
    importPath: loaderMatch[2],
    exportName: loaderMatch[3]
  };
}

// Read sample content files to understand structure
function readContentFile(slug) {
  const contentPath = path.join(contentDir, slug + ".json");
  if (fs.existsSync(contentPath)) {
    return JSON.parse(fs.readFileSync(contentPath, "utf8"));
  }
  return null;
}

// Analyze component for advanced features
function analyzeComponent(slug) {
  const componentPath = path.join(componentsDir, slug + ".tsx");
  if (!fs.existsSync(componentPath)) return null;
  
  const content = fs.readFileSync(componentPath, "utf8");
  
  const features = {
    hasSearch: /searchTerm|searchMatches|searchIndex/.test(content),
    hasCopy: /navigator\.clipboard\.writeText|copyResult|copy\(/.test(content),
    hasDownload: /URL\.createObjectURL|download|Blob.*download/.test(content),
    hasHistory: /history|getStorageJSON|setStorageJSON/.test(content),
    hasKeyboardShortcuts: /keydown|KeyboardEvent|ctrlKey|metaKey/.test(content),
    hasValidation: /error|validation|invalid|try.*catch/.test(content),
    hasSyntaxHighlighting: /tokenize|syntax|highlight|color|prism|shiki/.test(content),
    hasTabs: /tabs|TabList|TabPanel|TabsContent/.test(content),
    hasMultipleOutputs: /multiple.*output|output.*array|results.*map/.test(content),
    hasFileUpload: /type="file"|handleFile|handleFiles|drag.*drop|dropRef/.test(content),
    hasDragDrop: /onDrop|onDragOver|onDragLeave|dragging/.test(content),
    hasDebounce: /debounce|setTimeout.*300|useRef.*debounce/.test(content),
    hasWorker: /new Worker|worker:|useWorker/.test(content),
    hasWasm: /wasm|tryWasm|WASM/.test(content),
    hasMultipleInputs: /input2|second.*input|compare.*mode/.test(content),
    hasExport: /export|download|saveResults/.test(content),
    hasImport: /import|upload|file.*input/.test(content),
    hasRealTime: /real.time|debounce|onChange.*format|auto.*format/.test(content),
    hasCopyButtons: /Copy|copy/.test(content),
    hasClearButton: /clear|Clear/.test(content),
    hasStats: /stats|character|word|line|count/.test(content),
    hasExamples: /example|Example/.test(content),
    hasComparison: /compare|diff|Compare/.test(content),
    hasBatchProcessing: /bulk|batch|multiple.*file|forEach.*file/.test(content),
    hasProgress: /progress|Progress|loading/.test(content),
    hasThemeToggle: /theme|dark|light/.test(content),
    hasResponsive: /grid.*cols|flex.*wrap|sm:|md:|lg:/.test(content),
  };
  
  return features;
}

// Build audit for each tool
const audit = registryTools.map(tool => {
  const componentSlug = tool.slug;
  // Handle special mappings
  let actualComponentSlug = componentSlug;
  if (componentSlug === "capital-gains-tax") actualComponentSlug = "capital-gains-calculator";
  if (componentSlug === "vat-gst") actualComponentSlug = "vat-gst-calculator";
  if (componentSlug === "income-tax-calculator") actualComponentSlug = "income-tax-calculator"; // also has us-income-tax-calculator
  
  const componentExists = componentFiles.includes(actualComponentSlug);
  const contentExists = contentFiles.includes(tool.slug);
  const loaderEntry = loaderMap[componentSlug] || loaderMap[actualComponentSlug] || null;
  const contentData = readContentFile(tool.slug);
  
  let contentStructure = null;
  if (contentData) {
    contentStructure = {
      whatItDoes: !!contentData.whatItDoes,
      whyItExists: !!contentData.whyItExists,
      whoShouldUse: !!contentData.whoShouldUse,
      useCases: Array.isArray(contentData.useCases) ? contentData.useCases.length : 0,
      instructions: Array.isArray(contentData.instructions) ? contentData.instructions.length : 0,
      examples: Array.isArray(contentData.examples) ? contentData.examples.length : 0,
      bestPractices: Array.isArray(contentData.bestPractices) ? contentData.bestPractices.length : 0,
      commonMistakes: Array.isArray(contentData.commonMistakes) ? contentData.commonMistakes.length : 0,
      faq: Array.isArray(contentData.faq) ? contentData.faq.length : 0,
      features: Array.isArray(contentData.features) ? contentData.features.length : 0,
      references: Array.isArray(contentData.references) ? contentData.references.length : 0,
    };
  }
  
  const componentFeatures = analyzeComponent(actualComponentSlug);
  
  // Identify UI problems
  const uiProblems = [];
  if (!componentExists) {
    uiProblems.push("Component missing - will show 'coming soon' placeholder");
  }
  if (!contentExists) {
    uiProblems.push("Content file missing - page will 404");
  }
  if (!loaderEntry) {
    uiProblems.push("Not registered in dynamic-tool-loader.tsx - will show 'coming soon' placeholder");
  }
  if (componentFeatures) {
    if (!componentFeatures.hasCopy && tool.category !== "Utilities") {
      uiProblems.push("Missing copy to clipboard functionality");
    }
    if (!componentFeatures.hasDownload && ["Converters", "Generators", "Formatters", "Image Tools"].includes(tool.category)) {
      uiProblems.push("Missing download/export functionality");
    }
    if (!componentFeatures.hasValidation) {
      uiProblems.push("No visible error handling/validation feedback");
    }
    if (tool.worker && !componentFeatures.hasWorker) {
      uiProblems.push("Marked as worker: true but no Web Worker usage detected in component");
    }
    if (!componentFeatures.hasKeyboardShortcuts) {
      uiProblems.push("No keyboard shortcuts detected (e.g., Ctrl+Enter to submit)");
    }
    if (componentFeatures.hasFileUpload && !componentFeatures.hasDragDrop) {
      uiProblems.push("File upload present but no drag-and-drop support");
    }
  }
  
  // Check for component/loader slug mismatches
  if (componentSlug !== actualComponentSlug) {
    uiProblems.push(`Slug mismatch: registry="${componentSlug}", component="${actualComponentSlug}"`);
  }
  
  return {
    registry: {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      popularity: tool.popularity,
      icon: tool.icon,
      featured: tool.featured,
      trending: tool.trending,
      new: tool.new,
      noindex: tool.noindex,
      worker: tool.worker,
      wasm: tool.wasm,
      processing: tool.processing,
      aliasSlugs: tool.aliasSlugs,
      keywords: tool.keywords,
    },
    component: {
      exists: componentExists,
      actualSlug: actualComponentSlug,
      registeredInLoader: !!loaderEntry,
      loaderExportName: loaderEntry?.exportName || null,
      loaderImportPath: loaderEntry?.importPath || null,
    },
    content: {
      exists: contentExists,
      structure: contentStructure,
    },
    apiPowered: tool.processing === "server",
    advancedFeatures: componentFeatures,
    uiProblems: uiProblems,
  };
});

fs.writeFileSync(path.join(projectRoot, "tools-audit.json"), JSON.stringify(audit, null, 2));
console.log("Audit saved to tools-audit.json");
console.log("Total tools:", audit.length);

const capabilityMap = {
  hasWorker: "worker",
  hasWasm: "wasm",
  hasCopy: "copy",
  hasDownload: "download",
  hasValidation: "validation",
  hasFileUpload: "fileUpload",
  hasDragDrop: "dragDrop",
  hasRealTime: "realTime",
  hasMultipleInputs: "multipleInputs",
  hasComparison: "comparison",
  hasSyntaxHighlighting: "syntaxHighlighting",
  hasTabs: "tabs",
};

const capabilities = audit.map((tool) => {
  const caps = {};
  for (const [auditKey, capKey] of Object.entries(capabilityMap)) {
    caps[capKey] = tool.advancedFeatures?.[auditKey] === true;
  }
  return {
    slug: tool.registry.slug,
    category: tool.registry.category,
    capabilities: caps,
    registryFlags: {
      featured: tool.registry.featured === true,
      trending: tool.registry.trending === true,
      new: tool.registry.new === true,
      processing: tool.registry.processing || "client",
    },
    content: {
      faqCount: tool.content?.structure?.faq || 0,
      examplesCount: tool.content?.structure?.examples || 0,
    },
  };
});

fs.writeFileSync(path.join(projectRoot, "src", "lib", "data", "tool-capabilities.json"), JSON.stringify(capabilities, null, 2));
console.log("Capabilities saved to src/lib/data/tool-capabilities.json");