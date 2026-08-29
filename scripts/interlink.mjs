import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// Load all data sources
const guidesDataPath = path.join(root, 'src', 'lib', 'data', 'guides.ts');
const blogDataPath = path.join(root, 'src', 'lib', 'blog.ts');
const toolsDataPath = path.join(root, 'src', 'lib', 'data', 'tools.ts');
const comparisonsDataPath = path.join(root, 'src', 'lib', 'data', 'comparisons.ts');
const categoriesDataPath = path.join(root, 'src', 'lib', 'data', 'categories.ts');
const workflowsDataPath = path.join(root, 'src', 'lib', 'data', 'workflows.ts');
const toolkitsDataPath = path.join(root, 'src', 'lib', 'toolkits.ts');

function loadModule(modPath, exportName) {
  const content = fs.readFileSync(modPath, 'utf8');
  const startIdx = content.indexOf(`export const ${exportName}`);
  if (startIdx === -1) return null;
  const eqIdx = content.indexOf('=', startIdx);
  if (eqIdx === -1) return null;
  // Find the first '{' or '[' after '='
  const braceStart = content.indexOf('{', eqIdx);
  const bracketStart = content.indexOf('[', eqIdx);
  const arrStart = (braceStart !== -1 && (bracketStart === -1 || braceStart < bracketStart)) ? braceStart : bracketStart;
  if (arrStart === -1) return null;
  const openChar = content[arrStart];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let i = arrStart;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  const structStr = content.slice(arrStart, i + 1);
  // eslint-disable-next-line no-eval
  return eval(`(${structStr})`);
}

const guidesTopics = loadModule(guidesDataPath, 'guidesTopics');
const blogPosts = loadModule(blogDataPath, 'blogPosts');
const allTools = loadModule(toolsDataPath, 'allTools');
const comparisons = loadModule(comparisonsDataPath, 'comparisons');
const categories = loadModule(categoriesDataPath, 'categoryMetas');
const workflows = loadModule(workflowsDataPath, 'workflows');

// Load toolkits manually since it contains function calls
const toolkitsContent = fs.readFileSync(toolkitsDataPath, 'utf8');
const toolkitsArray = parseToolkits(toolkitsContent);

if (!guidesTopics || !blogPosts || !allTools || !comparisons || !categories || !workflows || !toolkitsArray.length) {
  console.error('Failed to load one or more data sources');
  process.exit(1);
}

// Build lookup maps
const guideBySlug = Object.fromEntries(guidesTopics.map((g) => [g.slug, g]));
const blogBySlug = Object.fromEntries(blogPosts.map((b) => [b.slug, b]));
const toolBySlug = Object.fromEntries(allTools.map((t) => [t.slug, t]));
const comparisonBySlug = Object.fromEntries(comparisons.map((c) => [c.slug, c]));
const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
const workflowBySlug = Object.fromEntries(workflows.map((w) => [w.slug, w]));
const toolkitBySlug = Object.fromEntries(toolkitsArray.map((tk) => [tk.slug, tk]));

// Build reverse mappings for bidirectional linking
const toolToGuides = new Map();
const toolToBlogs = new Map();
const toolToComparisons = new Map();
const toolToWorkflows = new Map();
const toolToToolkits = new Map();
const toolToCategories = new Map();

for (const guide of guidesTopics) {
  for (const toolSlug of guide.tools || []) {
    if (!toolToGuides.has(toolSlug)) toolToGuides.set(toolSlug, []);
    toolToGuides.get(toolSlug).push(guide);
  }
  if (guide.category) {
    if (!toolToCategories.has(guide.category)) toolToCategories.set(guide.category, []);
    toolToCategories.get(guide.category).push(guide);
  }
}

for (const blog of blogPosts) {
  const relatedGuide = blog.slug && guidesTopics.find(g => g.slug === blog.slug.replace('-guide', '').replace('-tutorial', ''));
  if (relatedGuide) {
    for (const toolSlug of relatedGuide.tools || []) {
      if (!toolToBlogs.has(toolSlug)) toolToBlogs.set(toolSlug, []);
      toolToBlogs.get(toolSlug).push(blog);
    }
  }
  if (blog.category) {
    if (!toolToCategories.has(blog.category)) toolToCategories.set(blog.category, []);
    toolToCategories.get(blog.category).push(blog);
  }
}

for (const comparison of comparisons) {
  for (const toolSlug of comparison.tools || []) {
    if (!toolToComparisons.has(toolSlug)) toolToComparisons.set(toolSlug, []);
    toolToComparisons.get(toolSlug).push(comparison);
  }
}

for (const workflow of workflows) {
  for (const step of workflow.steps || []) {
    if (!toolToWorkflows.has(step.toolSlug)) toolToWorkflows.set(step.toolSlug, []);
    toolToWorkflows.get(step.toolSlug).push(workflow);
  }
}

for (const toolkit of toolkitsArray) {
  for (const tool of toolkit.tools || []) {
    if (!toolToToolkits.has(tool.slug)) toolToToolkits.set(tool.slug, []);
    toolToToolkits.get(tool.slug).push({ slug: toolkit.slug, title: toolkit.title });
  }
}

function parseToolkits(content) {
  const toolkits = [];
  const toolkitRegex = /"([^"]+)"\s*:\s*\{([\s\S]*?)\n\s*\}/g;
  let match;
  const toolkitSlugs = {
    "json-toolkit": [
      "json-formatter", "json-validator", "json-minifier", "json-beautifier",
      "json-diff", "json-to-csv", "json-to-yaml", "json-to-xml",
      "xml-to-json", "json-to-typescript", "json-to-go",
      "json-schema-generator", "json-path-finder",
    ],
    "encoder-toolkit": [
      "base64", "url-encoder", "html-entity", "binary",
      "hex", "escape-unescape", "image-to-base64", "morse-code",
    ],
    "generator-toolkit": [
      "uuid-generator", "password-generator", "qr-generator",
      "barcode-generator", "lorem-ipsum", "random-data",
      "ascii-art", "cron-expression",
    ],
    "security-toolkit": [
      "hash-generator", "jwt-decoder", "jwt-generator",
      "totp-generator", "ssl-decoder", "csp-generator", "file-checksum",
    ],
    "image-toolkit": [
      "image-compressor", "image-resizer", "svg-optimizer",
      "favicon-generator", "placeholder-image", "exif-reader",
      "svg-to-css", "color-eyedropper",
    ],
    "text-toolkit": [
      "word-counter", "text-analyzer", "case-converter",
      "text-sorter", "diff-checker", "slug-generator",
      "string-length", "number-to-words",
    ],
    "dev-toolkit": [
      "css-formatter", "html-formatter", "sql-formatter",
      "xml-formatter", "yaml-formatter", "js-minifier",
      "ip-calculator", "url-parser", "http-header-parser",
      "user-agent-parser", "regex-tester", "markdown-preview",
      "timestamp-converter", "color-converter", "unit-converter",
      "base-converter",
    ],
  };
  while ((match = toolkitRegex.exec(toolkitsContent)) !== null) {
    const slug = match[1];
    const body = match[2];
    const nameMatch = body.match(/name:\s*"([^"]+)"/);
    const descMatch = body.match(/description:\s*"([^"]+)"/);
    const iconMatch = body.match(/icon:\s*"([^"]+)"/);
    const colorMatch = body.match(/color:\s*"([^"]+)"/);
    if (nameMatch) {
      const toolSlugs = toolkitSlugs[slug] || [];
      const toolCount = toolSlugs.length;
      toolkits.push({
        slug: match[1],
        name: nameMatch[1],
        description: descMatch?.[1] || '',
        icon: iconMatch?.[1] || '',
        toolCount,
        color: colorMatch?.[1] || 'bg-gray-500',
      });
    }
  }
  return toolkits;
}

// Helper functions
function relatedGuidesFor(category, excludeSlug) {
  return guidesTopics.filter(g => g.category === category && g.slug !== excludeSlug).slice(0, 5);
}

function relatedBlogsFor(category, excludeSlug) {
  return blogPosts.filter(b => (b.category === category || (b.tags && b.tags.includes(category))) && b.slug !== excludeSlug).slice(0, 5);
}

function relatedToolsFor(toolSlugs) {
  return toolSlugs?.slice(0, 5) || [];
}

function buildRelatedSection(title, items, basePath) {
  if (!items.length) return '';
  const lines = items.map(i => `- [${i.title || i.name}](${basePath}/${i.slug || i})`);
  return `\n## ${title}\n\n${lines.join('\n')}\n`;
}

function formatToolLink(tool) {
  return `- [${tool.name}](/tools/${tool.slug})`;
}

function formatGuideLink(guide) {
  return `- [${guide.title}](/guides/${guide.slug})`;
}

function formatBlogLink(blog) {
  return `- [${blog.title}](/blog/${blog.slug})`;
}

function formatComparisonLink(comp) {
  return `- [${comp.title}](/compare/${comp.slug})`;
}

function formatWorkflowLink(wf) {
  return `- [${wf.title}](/workflows/${wf.slug})`;
}

function formatToolkitLink(tk) {
  return `- [${tk.title}](/toolkits/${tk.slug})`;
}

function formatCategoryLink(cat) {
  return `- [${cat.name}](/categories/${cat.slug})`;
}

function processGuideFile(filePath, guide) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('## Related Resources')) return;

  let section = '\n---\n\n## Related Resources\n';

  // Related guides same category
  const rg = relatedGuidesFor(guide.category, guide.slug);
  if (rg.length) section += buildRelatedSection('Related Guides', rg, '/guides');

  // Related blog posts same category
  const rb = relatedBlogsFor(guide.category, guide.slug);
  if (rb.length) section += buildRelatedSection('Related Blog Posts', rb, '/blog');

  // Related tools from guide
  const rt = relatedToolsFor(guide.tools);
  if (rt.length) {
    const toolLinks = rt.map(t => {
      const tool = toolBySlug[t];
      return tool ? formatToolLink(tool) : `- [${t}](/tools/${t})`;
    });
    section += `\n## Related Tools\n\n${toolLinks.join('\n')}\n`;
  }

  // Comparisons related to this guide's tools
  const comparisonsForGuide = new Set();
  for (const toolSlug of guide.tools || []) {
    for (const comp of toolToComparisons.get(toolSlug) || []) {
      comparisonsForGuide.add(comp);
    }
  }
  if (comparisonsForGuide.size > 0) {
    const compLinks = Array.from(comparisonsForGuide).slice(0, 3).map(formatComparisonLink);
    section += `\n## Related Comparisons\n\n${compLinks.join('\n')}\n`;
  }

  // Workflows using this guide's tools
  const workflowsForGuide = new Set();
  for (const toolSlug of guide.tools || []) {
    for (const wf of toolToWorkflows.get(toolSlug) || []) {
      workflowsForGuide.add(wf);
    }
  }
  if (workflowsForGuide.size > 0) {
    const wfLinks = Array.from(workflowsForGuide).slice(0, 2).map(formatWorkflowLink);
    section += `\n## Related Workflows\n\n${wfLinks.join('\n')}\n`;
  }

  // Category link
  const cat = categoryBySlug[guide.category];
  if (cat) section += `\n## Category\n\n${formatCategoryLink(cat)}\n`;

  content = content.trimEnd() + section + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated guide:', path.relative(root, filePath));
}

function processBlogFile(filePath, blog) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('## Related Resources')) return;

  let section = '\n---\n\n## Related Resources\n';

  // Find related guide
  const guide = guidesTopics.find(g => g.slug === blog.slug.replace('-guide', '').replace('-tutorial', ''));
  if (guide) {
    section += `- [Guide: ${guide.title}](/guides/${guide.slug})\n`;
    const rt = relatedToolsFor(guide.tools);
    if (rt.length) {
      const toolLinks = rt.map(t => {
        const tool = toolBySlug[t];
        return tool ? formatToolLink(tool) : `- [${t}](/tools/${t})`;
      });
      section += `\n## Related Tools\n\n${toolLinks.join('\n')}\n`;
    }
  }

  // Blog posts by category
  const otherBlogs = blogPosts.filter(b => b.category === blog.category && b.slug !== blog.slug).slice(0, 5);
  if (otherBlogs.length) section += buildRelatedSection('More Blog Posts', otherBlogs, '/blog');

  // Related guides by category
  const rg = relatedGuidesFor(blog.category, '');
  if (rg.length) section += buildRelatedSection('Related Guides', rg, '/guides');

  // Tools for this blog
  if (blog.tools) {
    const toolLinks = relatedToolsFor(blog.tools).map(t => {
      const tool = toolBySlug[t];
      return tool ? formatToolLink(tool) : `- [${t}](/tools/${t})`;
    });
    if (toolLinks.length) section += `\n## Related Tools\n\n${toolLinks.join('\n')}\n`;
  }

  content = content.trimEnd() + section + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated blog:', path.relative(root, filePath));
}

function processToolContentFile(filePath, tool) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('## Related Resources')) return;

  let section = '\n---\n\n## Related Resources\n';

  // Guides that reference this tool
  const guidesForTool = toolToGuides.get(tool.slug) || [];
  if (guidesForTool.length > 0) {
    const guideLinks = guidesForTool.slice(0, 3).map(formatGuideLink);
    section += `\n## Guides Using This Tool\n\n${guideLinks.join('\n')}\n`;
  }

  // Blog posts that reference this tool
  const blogsForTool = toolToBlogs.get(tool.slug) || [];
  if (blogsForTool.length > 0) {
    const blogLinks = blogsForTool.slice(0, 3).map(formatBlogLink);
    section += `\n## Blog Posts Using This Tool\n\n${blogLinks.join('\n')}\n`;
  }

  // Comparisons for this tool
  const compsForTool = toolToComparisons.get(tool.slug) || [];
  if (compsForTool.length > 0) {
    const compLinks = compsForTool.slice(0, 3).map(formatComparisonLink);
    section += `\n## Comparisons Involving This Tool\n\n${compLinks.join('\n')}\n`;
  }

  // Workflows using this tool
  const workflowsForTool = toolToWorkflows.get(tool.slug) || [];
  if (workflowsForTool.length > 0) {
    const wfLinks = workflowsForTool.slice(0, 2).map(formatWorkflowLink);
    section += `\n## Workflows Using This Tool\n\n${wfLinks.join('\n')}\n`;
  }

  // Toolkits containing this tool
  const toolkitsForTool = toolToToolkits.get(tool.slug) || [];
  if (toolkitsForTool.length > 0) {
    const tkLinks = toolkitsForTool.slice(0, 2).map(formatToolkitLink);
    section += `\n## Toolkits Containing This Tool\n\n${tkLinks.join('\n')}\n`;
  }

  // Category
  const cat = categories.find(c => c.name === tool.category);
  if (cat) section += `\n## Category\n\n${formatCategoryLink(cat)}\n`;

  content = content.trimEnd() + section + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated tool content:', path.relative(root, filePath));
}

function processComparisonFile(filePath, comparison) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('## Related Resources')) return;

  let section = '\n---\n\n## Related Resources\n';

  // Tools in this comparison
  const toolLinks = comparison.tools
    .map(t => {
      const tool = toolBySlug[t];
      return tool ? formatToolLink(tool) : `- [${t}](/tools/${t})`;
    })
    .slice(0, 5);
  if (toolLinks.length) section += `\n## Tools Compared\n\n${toolLinks.join('\n')}\n`;

  // Guides for these tools
  const guidesForComp = new Set();
  for (const toolSlug of comparison.tools) {
    for (const g of toolToGuides.get(toolSlug) || []) guidesForComp.add(g);
  }
  if (guidesForComp.size > 0) {
    const guideLinks = Array.from(guidesForComp).slice(0, 3).map(formatGuideLink);
    section += `\n## Guides for These Tools\n\n${guideLinks.join('\n')}\n`;
  }

  // Blog posts for these tools
  const blogsForComp = new Set();
  for (const toolSlug of comparison.tools) {
    for (const b of toolToBlogs.get(toolSlug) || []) blogsForComp.add(b);
  }
  if (blogsForComp.size > 0) {
    const blogLinks = Array.from(blogsForComp).slice(0, 3).map(formatBlogLink);
    section += `\n## Blog Posts for These Tools\n\n${blogLinks.join('\n')}\n`;
  }

  // Category
  const cat = comparison.category ? categories.find(c => c.name === comparison.category) : null;
  if (cat) section += `\n## Category\n\n${formatCategoryLink(cat)}\n`;

  content = content.trimEnd() + section + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated comparison:', path.relative(root, filePath));
}

// Process all file types
function processFiles() {
  // Process guides
  const guidesContentDir = path.join(root, 'src', 'content', 'guides');
  function walkGuides(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkGuides(full);
      else if (entry.name.endsWith('.md')) {
        const rel = path.relative(guidesContentDir, full).replace(/\\/g, '/').replace('.md', '');
        const guide = guideBySlug[rel];
        if (guide) processGuideFile(full, guide);
      }
    }
  }
  walkGuides(guidesContentDir);

  // Process blogs
  const blogContentDir = path.join(root, 'src', 'content', 'blog');
  for (const file of fs.readdirSync(blogContentDir)) {
    if (!file.endsWith('.md')) continue;
    const full = path.join(blogContentDir, file);
    const slug = file.replace('.md', '');
    const blog = blogBySlug[slug];
    if (blog) processBlogFile(full, blog);
  }

  // Process tool content files
  const toolsContentDir = path.join(root, 'src', 'content', 'tools');
  for (const file of fs.readdirSync(toolsContentDir)) {
    if (!file.endsWith('.json')) continue;
    const full = path.join(toolsContentDir, file);
    const slug = file.replace('.json', '');
    const tool = toolBySlug[slug];
    if (tool) processToolContentFile(full, tool);
  }

  // Process comparison files
  const comparisonsContentDir = path.join(root, 'src', 'content', 'comparisons');
  if (fs.existsSync(comparisonsContentDir)) {
    for (const file of fs.readdirSync(comparisonsContentDir)) {
      if (!file.endsWith('.md')) continue;
      const full = path.join(comparisonsContentDir, file);
      const slug = file.replace('.md', '');
      const comparison = comparisonBySlug[slug];
      if (comparison) processComparisonFile(full, comparison);
    }
  }

  console.log('Interlinking complete - knowledge graph built!');
}

processFiles();