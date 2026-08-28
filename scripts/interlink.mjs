import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const guidesDataPath = path.join(root, 'src', 'lib', 'data', 'guides.ts');
const blogDataPath = path.join(root, 'src', 'lib', 'blog.ts');

function loadModule(modPath, exportName) {
  const content = fs.readFileSync(modPath, 'utf8');
  // Find the start of the export
  const startIdx = content.indexOf(`export const ${exportName}`);
  if (startIdx === -1) return null;
  // Find the '=' after that
  const eqIdx = content.indexOf('=', startIdx);
  if (eqIdx === -1) return null;
  // Find the first '[' after '='
  const arrStart = content.indexOf('[', eqIdx);
  if (arrStart === -1) return null;
  // Now parse brackets to find matching ']'
  let depth = 0;
  let i = arrStart;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  const arrayStr = content.slice(arrStart, i + 1);
  // eslint-disable-next-line no-eval
  return eval(`(${arrayStr})`);
}

const guidesTopics = loadModule(guidesDataPath, 'guidesTopics');
const blogPosts = loadModule(blogDataPath, 'blogPosts');

if (!guidesTopics || !blogPosts) {
  console.error('Failed to load data');
  process.exit(1);
}

// Build lookup maps
const guideBySlug = Object.fromEntries(guidesTopics.map(g => [g.slug, g]));
const blogBySlug = Object.fromEntries(blogPosts.map(b => [b.slug, b]));

function relatedGuidesFor(category, excludeSlug) {
  return guidesTopics.filter(g => g.category === category && g.slug !== excludeSlug).slice(0,5);
}
function relatedBlogsFor(category, excludeSlug) {
  // blog posts may have category field? assume they have 'category' or 'tags'
  return blogPosts.filter(b => (b.category === category || (b.tags && b.tags.includes(category))) && b.slug !== excludeSlug).slice(0,5);
}
function relatedToolsFor(toolSlugs) {
  // toolSlugs array; we just return slugs for linking to /tools/:slug
  return toolSlugs?.slice(0,5) || [];
}

// Find a guide related to a blog post by slug similarity
function findGuideForBlog(blogSlug) {
  // direct match after last segment
  const key = blogSlug.split('-').pop(); // simplistic
  return guidesTopics.find(g => g.slug.includes(key));
}

function buildRelatedSection(title, items, basePath) {
  if (!items.length) return '';
  const lines = items.map(i => `- [${i.title || i.name}](${basePath}/${i.slug || i})`);
  return `\n## ${title}\n\n${lines.join('\n')}\n`;
}

function processFile(filePath, dataItem, type) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Avoid duplicate
  if (content.includes('## Related Resources')) return;

  let section = '\n---\n\n## Related Resources\n';

  if (type === 'guide') {
    // Related guides same category
    const rg = relatedGuidesFor(dataItem.category, dataItem.slug);
    if (rg.length) section += buildRelatedSection('Related Guides', rg, '/guides');

    // Related blog posts same category
    const rb = relatedBlogsFor(dataItem.category, dataItem.slug);
    if (rb.length) section += buildRelatedSection('Related Blog Posts', rb, '/blog');

    // Related tools
    const rt = relatedToolsFor(dataItem.tools);
    if (rt.length) {
      const toolLinks = rt.map(t => `- [${t}](/tools/${t})`);
      section += `\n## Related Tools\n\n${toolLinks.join('\n')}\n`;
    }
  } else if (type === 'blog') {
    // Find a related guide
    const guide = findGuideForBlog(dataItem.slug);
    if (guide) {
      section += `- [Guide: ${guide.title}](/guides/${guide.slug})\n`;
      // Also include tools from that guide
      const rt = relatedToolsFor(guide.tools);
      if (rt.length) {
        const toolLinks = rt.map(t => `- [${t}](/tools/${t})`);
        section += `\n## Related Tools\n\n${toolLinks.join('\n')}\n`;
      }
    }
    // Also link to other blog posts (simple: latest 5 excluding self)
    const otherBlogs = blogPosts.filter(b => b.slug !== dataItem.slug).slice(0,5);
    if (otherBlogs.length) {
      section += buildRelatedSection('More Blog Posts', otherBlogs, '/blog');
    }
  }

  content = content.trimEnd() + section + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', filePath);
}

// Process guides
const guidesContentDir = path.join(root, 'src', 'content', 'guides');
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.md')) {
      const rel = path.relative(guidesContentDir, full).replace(/\\/g,'/').replace('.md','');
      const guide = guideBySlug[rel];
      if (guide) processFile(full, guide, 'guide');
    }
  }
}
walk(guidesContentDir);

// Process blogs
const blogContentDir = path.join(root, 'src', 'content', 'blog');
for (const file of fs.readdirSync(blogContentDir)) {
  if (!file.endsWith('.md')) continue;
  const full = path.join(blogContentDir, file);
  const slug = file.replace('.md','');
  const blog = blogBySlug[slug];
  if (blog) processFile(full, blog, 'blog');
}

console.log('Interlinking complete');