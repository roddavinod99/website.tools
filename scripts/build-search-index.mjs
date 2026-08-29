import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const OUTPUT_FILE = join(PUBLIC_DIR, "search-index.json");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function extractTextFromMarkdown(content) {
  return content
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .trim();
}

function readMarkdownFiles(dir, type) {
  const files = walk(dir).filter(f => f.endsWith(".md"));
  const docs = [];
  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      const relPath = relative(dir, file).replace(/\\/g, "/").replace(".md", "");
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const text = extractTextFromMarkdown(content);
      docs.push({
        id: `${type}:${relPath}`,
        title: titleMatch ? titleMatch[1] : relPath.split("/").pop().replace(/-/g, " "),
        text,
        url: `/${type}/${relPath}`,
        type,
      });
    } catch (e) {
      console.warn(`Failed to read ${file}:`, e.message);
    }
  }
  return docs;
}

function readToolContent() {
  const dir = join(ROOT, "src", "content", "tools");
  const files = walk(dir).filter(f => f.endsWith(".json"));
  const docs = [];
  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(file, "utf-8"));
      const slug = relative(dir, file).replace(/\\/g, "/").replace(".json", "");
      const sections = [
        content.whatItDoes,
        content.whyItExists,
        content.whoShouldUse,
        ...(content.useCases || []),
        ...(content.instructions || []),
        ...(content.examples || []),
        ...(content.bestPractices || []),
        ...(content.commonMistakes || []),
        ...(content.faq || []).flatMap(f => [f.question, f.answer]),
        ...(content.features || []),
        ...(content.references || []).map(r => r.label),
      ].filter(Boolean);
      docs.push({
        id: `tool:${slug}`,
        title: content.title || slug,
        text: sections.join(" "),
        url: `/tools/${slug}`,
        type: "tool",
        category: content.category,
      });
    } catch (e) {
      console.warn(`Failed to read ${file}:`, e.message);
    }
  }
  return docs;
}

function readDataFile(filePath, type) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const exportMatch = content.match(new RegExp(`export const ${type === "blog" ? "blogPosts" : type === "guides" ? "guidesTopics" : type === "compare" ? "comparisons" : type} = (\\[[\\s\\S]*?\\]);`));
    if (!exportMatch) return [];
    const data = eval(`(${exportMatch[1]})`);
    const docs = [];
    for (const item of data) {
      const textParts = [];
      if (item.title) textParts.push(item.title);
      if (item.name) textParts.push(item.name);
      if (item.description) textParts.push(item.description);
      if (item.intro) textParts.push(item.intro);
      if (item.excerpt) textParts.push(item.excerpt);
      if (item.sections) textParts.push(...item.sections.map(s => s.body));
      if (item.faq) textParts.push(...item.faq.flatMap(f => [f.question, f.answer]));
      if (item.body) textParts.push(item.body);
      docs.push({
        id: `${type}:${item.slug}`,
        title: item.title || item.name || item.slug,
        text: textParts.join(" "),
        url: `/${type}/${item.slug}`,
        type,
        category: item.category,
      });
    }
    return docs;
  } catch (e) {
    console.warn(`Failed to read ${filePath}:`, e.message);
    return [];
  }
}

function readToolsRegistry() {
  try {
    const content = readFileSync(join(ROOT, "src", "lib", "data", "tools.ts"), "utf-8");
    const match = content.match(/export const allTools: Tool\[\] = (\[[\s\S]*?\]);/);
    if (!match) return [];
    const tools = eval(`(${match[1]})`);
    const docs = [];
    for (const tool of tools) {
      if (tool.noindex) continue;
      docs.push({
        id: `tool:${tool.slug}`,
        title: tool.name,
        text: [tool.name, tool.description, tool.category, ...(tool.keywords || [])].join(" "),
        url: `/tools/${tool.slug}`,
        type: "tool",
        category: tool.category,
        popularity: tool.popularity || 0,
      });
    }
    return docs;
  } catch (e) {
    console.warn("Failed to read tools registry:", e.message);
    return [];
  }
}

function readCategories() {
  try {
    const content = readFileSync(join(ROOT, "src", "lib", "data", "categories.ts"), "utf-8");
    const match = content.match(/export const categoryMetas: Array<Omit<Category, "toolCount">> = (\[[\s\S]*?\]);/);
    if (!match) return [];
    const categories = eval(`(${match[1]})`);
    const docs = [];
    for (const cat of categories) {
      docs.push({
        id: `category:${cat.slug}`,
        title: cat.name,
        text: [cat.name, cat.description, ...(cat.seoKeywords || []), ...(cat.seoFeatures || [])].join(" "),
        url: `/categories/${cat.slug}`,
        type: "category",
      });
    }
    return docs;
  } catch (e) {
    console.warn("Failed to read categories:", e.message);
    return [];
  }
}

function readWorkflows() {
  try {
    const content = readFileSync(join(ROOT, "src", "lib", "data", "workflows.ts"), "utf-8");
    const match = content.match(/export const workflows: Workflow\[\] = (\[[\s\S]*?\]);/);
    if (!match) return [];
    const workflows = eval(`(${match[1]})`);
    const docs = [];
    for (const wf of workflows) {
      docs.push({
        id: `workflow:${wf.slug}`,
        title: wf.title,
        text: [wf.title, wf.description, wf.category, ...wf.steps.map(s => s.label + " " + s.description)].join(" "),
        url: `/workflows/${wf.slug}`,
        type: "workflow",
      });
    }
    return docs;
  } catch (e) {
    console.warn("Failed to read workflows:", e.message);
    return [];
  }
}

function readComparisons() {
  return readDataFile(join(ROOT, "src", "lib", "data", "comparisons.ts"), "compare");
}

function readBlogPosts() {
  return readDataFile(join(ROOT, "src", "lib", "blog.ts"), "blog");
}

function readGuides() {
  return readDataFile(join(ROOT, "src", "lib", "data", "guides.ts"), "guides");
}

function readToolkits() {
  try {
    const content = readFileSync(join(ROOT, "src", "lib", "toolkits.ts"), "utf-8");
    const match = content.match(/export const toolkits = (\[[\s\S]*?\]);/);
    if (!match) return [];
    const toolkits = eval(`(${match[1]})`);
    const docs = [];
    for (const tk of toolkits) {
      docs.push({
        id: `toolkit:${tk.slug}`,
        title: tk.title,
        text: [tk.title, tk.description, tk.category, ...tk.tools.map(t => t.name)].join(" "),
        url: `/toolkits/${tk.slug}`,
        type: "toolkit",
      });
    }
    return docs;
  } catch (e) {
    console.warn("Failed to read toolkits:", e.message);
    return [];
  }
}

function main() {
  console.log("[build-search-index] Building search index...");

  const allDocs = [
    ...readToolsRegistry(),
    ...readCategories(),
    ...readComparisons(),
    ...readBlogPosts(),
    ...readGuides(),
    ...readWorkflows(),
    ...readToolkits(),
    ...readToolContent(),
    ...readMarkdownFiles(join(ROOT, "src", "content", "blog"), "blog"),
    ...readMarkdownFiles(join(ROOT, "src", "content", "guides"), "guides"),
  ];

  console.log(`[build-search-index] Indexed ${allDocs.length} documents`);

  const indexData = {
    version: 1,
    generatedAt: new Date().toISOString(),
    docs: allDocs,
  };

  if (!existsSync(PUBLIC_DIR)) {
    console.error("[build-search-index] public directory not found");
    process.exit(1);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(indexData), "utf-8");
  console.log(`[build-search-index] Written to ${OUTPUT_FILE}`);
}

main();