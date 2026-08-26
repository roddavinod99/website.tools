# DevStackIO Blog Guide
## WordPress Blog Post Guidelines for AI Agents

---

## ⚠️ MANDATORY: Discovery Phase (Run Before Every Writing Session)

**Every AI session MUST run these WP-CLI commands first** to understand the current WordPress state. Plugins, categories, tags, and settings change over time — never assume.

```bash
# ============================================
# 1. PLUGINS — Active plugins with versions
# ============================================
wp plugin list --status=active --fields=name,version,status,update --format=json

# ============================================
# 2. CATEGORIES — Full hierarchy with counts
# ============================================
wp term list category --fields=term_id,name,slug,parent,count --format=json

# ============================================
# 3. TAGS — Top 50 by usage
# ============================================
wp term list post_tag --fields=term_id,name,slug,count --format=json --orderby=count --order=desc --number=50

# ============================================
# 4. RECENT POSTS — Last 20 for context
# ============================================
wp post list --posts_per_page=20 --fields=ID,post_title,post_name,post_date,post_status,categories,tags --format=json

# ============================================
# 5. SITE OPTIONS — Core settings
# ============================================
wp option get permalink_structure
wp option get timezone_string
wp option get blogname
wp option get blogdescription

# ============================================
# 6. CUSTOM POST TYPES — Check for CPTs
# ============================================
wp post-type list --fields=name,label,hierarchical,public --format=json

# ============================================
# 7. USERS — Author options
# ============================================
wp user list --fields=ID,display_name,user_nicename,roles --format=json

# ============================================
# 8. SEO PLUGIN DETECTION
# ============================================
wp plugin list --status=active --search=yoast --format=json
wp plugin list --status=active --search=rankmath --format=json
wp plugin list --status=active --search=seo --format=json

# ============================================
# 9. CACHING PLUGIN DETECTION
# ============================================
wp plugin list --status=active --search=rocket --format=json
wp plugin list --status=active --search=cache --format=json

# ============================================
# 10. AFFILIATE PLUGIN DETECTION
# ============================================
wp plugin list --status=active --search=thirsty --format=json
wp plugin list --status=active --search=pretty-link --format=json
wp plugin list --status=active --search=affiliate --format=json

# ============================================
# 11. SCHEMA PLUGIN DETECTION
# ============================================
wp plugin list --status=active --search=schema --format=json

# ============================================
# 12. MEDIA LIBRARY — Featured image options
# ============================================
wp media list --fields=ID,file,url,mime_type --format=json --number=20
```

**Cache output in-session** (e.g., `/tmp/wp-discovery.json`). Re-run only if user explicitly says "plugins changed" or "new categories added."

---

## Plugin-Aware Writing Rules

### SEO Plugin Detection & Adaptation

| Detected Plugin | Meta Fields to Use | Schema Handling |
|-----------------|-------------------|-----------------|
| **Yoast SEO** | `_yoast_wpseo_title`, `_yoast_wpseo_metadesc`, `_yoast_wpseo_focuskw` | Yoast outputs its own JSON-LD. Add complementary schema only (FAQPage, HowTo, Comparison). Don't duplicate Organization/WebSite/BreadcrumbList. |
| **RankMath** | `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword` | RankMath has schema builder. Use its API or add complementary schemas via custom fields. |
| **None / Other** | Standard WP fields + custom fields | Full control — inject complete `@graph` JSON-LD via `wp_head` hook or custom field. |

**Detection Command:**
```bash
wp eval "global \$wpdb; echo 'Yoast: ' . (\$wpdb->get_var(\"SELECT COUNT(*) FROM \$wpdb->options WHERE option_name LIKE '%yoast%'\") > 0 ? 'YES' : 'NO'); echo ' RankMath: ' . (\$wpdb->get_var(\"SELECT COUNT(*) FROM \$wpdb->options WHERE option_name LIKE '%rank_math%'\") > 0 ? 'YES' : 'NO');"
```

### Caching Plugin — Purge After Publish
```bash
# WP Rocket
wp rocket clean --all

# W3 Total Cache
wp w3-total-cache flush

# LiteSpeed Cache
wp litespeed-purge all

# Generic (if unknown)
wp cache flush
```

### Affiliate Plugin — Use Correct Shortcodes
| Plugin | Shortcode Format |
|--------|------------------|
| ThirstyAffiliates | `[affiliate_link id="123"]` or `[affiliate_link slug="product-name"]` |
| Pretty Links | `[pretty_link id="123"]` |
| Custom | Check `wp shortcode list` for available shortcodes |

### Image Optimization Plugin — Reference Optimized URLs
```bash
# ShortPixel: images served via CDN
# Imagify: WebP/AVIF versions auto-generated
# EWWW: optimized copies in uploads folder
# Just use standard WP featured image — plugin handles optimization
```

---

## Content Structure Templates (Plugin-Agnostic)

### Standard Article Front Matter
```yaml
---
title: "Exact H1 from keyword research (≤60 chars)"
description: "150-160 char meta description with primary keyword"
category: "parent-category-slug"  # Must match discovered category slug
tags: ["tag1", "tag2", "tag3"]    # Must match discovered tag slugs (max 5)
date: "2026-01-15"
modified: "2026-01-15"
author: "devstackio-team"         # Must match discovered user_nicename
schema: "TechArticle"             # TechArticle | HowTo | Comparison | FAQPage | Product
canonical: "https://devstackio.com/category/slug/"
og_title: "Social media title (≤60 chars)"
og_description: "Social description (≤160 chars)"
og_type: "article"
article_published_time: "2026-01-15T10:00:00Z"
article_modified_time: "2026-01-15T10:00:00Z"
article_author: "DevStackIO Team"
article_section: "AI"
---
```

### Article Body Structure (Required Sections)

```markdown
# H1 (matches title exactly)

## Table of Contents
<!-- Auto-generated from H2s -->

## What You'll Learn
- Bullet 1
- Bullet 2
- Bullet 3

## [H2 Section 1 — Comprehensive Coverage]
### H3 Subsection
### H3 Subsection

## [H2 Section 2 — Practical Example / Code / Commands]
```bash
# Tested, copyable commands
command --flag value
```

## [H2 Section 3 — Tool Integration]
> **Try our [Tool Name](https://tools.devstackio.com/tools/tool-slug) to [specific use case]**
> 
> [Brief 1-sentence description of what the tool does for this use case]

## [H2 Section 4 — Additional H2s as needed]

## FAQ
### Q: Question 1?
**A:** Answer with practical details.

### Q: Question 2?
**A:** Answer.

### Q: Question 3?
**A:** Answer.

### Q: Question 4?
**A:** Answer.

### Q: Question 5?
**A:** Answer.

## Related Articles
1. [Article Title 1](/category/slug-1/) — Brief reason to read
2. [Article Title 2](/category/slug-2/) — Brief reason to read
3. [Article Title 3](/category/slug-3/) — Brief reason to read

## Next Steps / CTA
> **Ready to [action]?** [Try the Tool](https://tools.devstackio.com/tools/tool-slug) or [Read the Next Guide](/category/next-slug/).
```

---

## Schema Templates (Inject via `@graph`)

### Base JSON-LD Structure (All Articles)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://devstackio.com/#organization"
    },
    {
      "@type": "WebSite",
      "@id": "https://devstackio.com/#website",
      "url": "https://devstackio.com",
      "name": "DevStackIO",
      "publisher": { "@id": "https://devstackio.com/#organization" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://devstackio.com/" },
        { "@type": "ListItem", "position": 2, "name": "Category Name", "item": "https://devstackio.com/category-slug/" },
        { "@type": "ListItem", "position": 3, "name": "Article Title", "item": "https://devstackio.com/category-slug/article-slug/" }
      ]
    }
  ]
}
```

### TechArticle (Informational / Guides)
```json
{
  "@type": "TechArticle",
  "headline": "Article Title",
  "description": "Meta description",
  "url": "https://devstackio.com/category-slug/article-slug/",
  "author": {
    "@type": "Person",
    "name": "DevStackIO Team",
    "url": "https://devstackio.com/author/devstackio-team/"
  },
  "datePublished": "2026-01-15T10:00:00Z",
  "dateModified": "2026-01-15T10:00:00Z",
  "publisher": { "@id": "https://devstackio.com/#organization" },
  "articleSection": "AI",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "wordCount": 2500
}
```

### HowTo (Tutorials)
```json
{
  "@type": "HowTo",
  "name": "How to Do X",
  "description": "Step-by-step guide to...",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Step 1: Do This",
      "text": "Detailed instructions...",
      "url": "https://devstackio.com/category-slug/article-slug/#step-1"
    }
  ],
  "totalTime": "PT30M",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "supply": [{ "@type": "HowToSupply", "name": "Tool/Resource" }],
  "tool": [{ "@type": "HowToTool", "name": "Tool Name" }]
}
```

### FAQPage (Always Include)
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question 1?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer 1." }
    }
  ]
}
```

### Comparison (Product/Tool Comparisons)
```json
{
  "@type": "Product",
  "name": "Tool A",
  "description": "Description",
  "brand": { "@type": "Brand", "name": "Vendor" },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" },
  "review": {
    "@type": "Review",
    "reviewRating": { "@type": "Rating", "ratingValue": "4.5", "bestRating": "5" },
    "author": { "@type": "Person", "name": "DevStackIO Team" }
  }
}
```

**Injection Method:** Save complete `@graph` array to custom field `_devstackio_schema` and hook into `wp_head`:
```php
// functions.php or custom plugin
add_action('wp_head', function() {
    if (is_singular('post')) {
        $schema = get_post_meta(get_the_ID(), '_devstackio_schema', true);
        if ($schema) {
            echo '<script type="application/ld+json">' . wp_json_encode($schema) . '</script>';
        }
    }
});
```

---

## Internal Linking Strategy (Dynamic)

### 1. Query Current Taxonomy Before Linking
```bash
# Verify category exists
wp term get category <slug> --field=term_id

# Verify tag exists
wp term get post_tag <slug> --field=term_id

# Find related posts in same category
wp post list --category_name=<slug> --posts_per_page=5 --fields=ID,post_title,post_name --format=json
```

### 2. Tool Keyword Mapping (Static — tools.devstackio.com)
```php
$tool_map = [
    'json' => 'https://tools.devstackio.com/tools/json-formatter',
    'jwt' => 'https://tools.devstackio.com/tools/jwt-decoder',
    'base64' => 'https://tools.devstackio.com/tools/base64-encoder',
    'regex' => 'https://tools.devstackio.com/tools/regex-tester',
    'api' => 'https://tools.devstackio.com/tools/api-tester',
    'uuid' => 'https://tools.devstackio.com/tools/uuid-generator',
    'hash' => 'https://tools.devstackio.com/tools/hash-generator',
    'encode' => 'https://tools.devstackio.com/tools/base64-encoder',
    'decode' => 'https://tools.devstackio.com/tools/jwt-decoder',
    'format' => 'https://tools.devstackio.com/tools/json-formatter',
    'validate' => 'https://tools.devstackio.com/tools/json-formatter',
];
```

### 3. Linking Rules
- **Pillar page link**: Every article links to its parent pillar page (e.g., `/ai/`, `/cloud-devops/`)
- **Cluster siblings**: 2-3 links to articles in same child category
- **Tool widget**: One "Try it now" sidebar per article mapping to relevant tool
- **Cross-pillar**: 1 link to related pillar when relevant (e.g., AI article → Cloud DevOps for deployment)
- **No orphan links**: Verify target exists via `wp post list --name="slug"` before linking

---

## Publishing Workflow (Adaptive)

### Create Draft
```bash
wp post create \
  --post_type=post \
  --post_status=draft \
  --post_title="Article Title" \
  --post_category="category-slug" \
  --tags_input="tag1,tag2,tag3" \
  --post_author=$(wp user get devstackio-team --field=ID) \
  --post_content="$(cat article-content.html)"
```

### Update Content
```bash
wp post update <POST_ID> --post_content="$(cat article-content.html)"
```

### Set Custom Fields (Schema, SEO, etc.)
```bash
# Schema
wp post meta update <POST_ID> _devstackio_schema "$(cat schema.json)"

# SEO (if no plugin or custom)
wp post meta update <POST_ID> _yoast_wpseo_title "Title"
wp post meta update <POST_ID> _yoast_wpseo_metadesc "Description"
wp post meta update <POST_ID> _yoast_wpseo_focuskw "primary keyword"
```

### Publish + IndexNow
```bash
# Publish
wp post update <POST_ID> --post_status=publish

# Get permalink
PERMALINK=$(wp post get <POST_ID> --field=link)

# IndexNow submission (requires API key in env)
wp eval-file scripts/indexnow-single.php url="$PERMALINK"

# Purge cache if caching plugin active
wp rocket clean --url="$PERMALINK"  # or appropriate cache flush command
```

### Verify After Publish
```bash
# Check status
wp post get <POST_ID> --fields=post_status,post_date,link

# Validate schema
curl -s "$PERMALINK" | grep -c 'application/ld+json'
```

---

## Custom Post Type Support

### Detect CPTs During Discovery
```bash
wp post-type list --fields=name,label,hierarchical,public,show_in_rest --format=json
```

### Common CPTs to Support
| CPT Name | Label | Use Case |
|----------|-------|----------|
| `tool` | Tool | Individual tool pages (if not on tools.devstackio.com) |
| `tutorial` | Tutorial | Step-by-step guides separate from blog |
| `comparison` | Comparison | Structured comparison pages |
| `resource` | Resource | Downloadable assets, cheat sheets |
| `course` | Course | Multi-part learning paths |

### CPT-Specific Templates
Each CPT gets its own schema type and required fields. Extend the front matter template with CPT-specific fields.

---

## Quality Checklist (Run After Discovery, Before Publish)

### Content Quality
- [ ] Word count meets minimum for content level (L1: 3000+, L2: 2000+, L3: 1800+, L4: 1500+)
- [ ] All code blocks tested and copyable
- [ ] First-hand experience cited (Oracle ARM64 server, actual commands run)
- [ ] Primary sources linked (official docs, RFCs, vendor announcements)
- [ ] Version numbers included for tools/frameworks
- [ ] No placeholder content ("Coming soon", "TBD", mock data)

### SEO & Technical
- [ ] Title ≤60 chars, includes primary keyword
- [ ] Meta description 150-160 chars, includes primary keyword
- [ ] H1 used exactly once, matches title
- [ ] Heading hierarchy correct (H1 → H2 → H3)
- [ ] Canonical URL set correctly
- [ ] og:image + og:image:alt set (when images enabled)
- [ ] Schema validates in [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] FAQ has 5+ Q&A pairs with FAQPage schema
- [ ] All internal links resolve (no 404s) — verify with `wp post list --name="slug"`
- [ ] Categories/tags used exist in discovered taxonomy

### Plugin Compatibility
- [ ] SEO meta fields match active plugin (Yoast/RankMath/custom)
- [ ] Schema doesn't conflict with plugin output (check rendered page)
- [ ] Affiliate shortcodes use active plugin syntax
- [ ] Cache purged after publish (if caching plugin detected)

### Analytics & Tracking
- [ ] GA4 event for article view configured
- [ ] Affiliate clicks trackable (UTM parameters on external links)
- [ ] Tool widget click tracking enabled

### Accessibility
- [ ] Semantic HTML structure
- [ ] Code blocks have language attribute
- [ ] Link text descriptive (no "click here")
- [ ] Color contrast sufficient (if custom styles)
- [ ] Keyboard navigable

---

## Weekly Publishing Cadence

| Day | Activity |
|-----|----------|
| Mon | Keyword research + outline (2-3 articles) + Discovery Phase |
| Tue | Write Article 1 (full draft) |
| Wed | Write Article 2 + edit Article 1 |
| Thu | Write Article 3 + edit Article 2 |
| Fri | Edit Article 3 + create schema + internal links |
| Sat | Publish all 3 + IndexNow + cache purge + verify |
| Sun | Analytics review + planning for next week |

**Target:** 3 articles/week = ~150 articles/year

---

## Tool Integration Reference

### For EVERY Tool on tools.devstackio.com

| Asset | Location | Purpose |
|-------|----------|---------|
| "What is X" article | `/blog/what-is-x` | Top of funnel, informational |
| "How to use X" tutorial | `/blog/how-to-use-x` | Middle funnel, practical |
| "X vs Y" comparison | `/blog/x-vs-y` | Commercial investigation |
| "X in Python/JS/Bash" | `/blog/x-python` | Long-tail, developer intent |
| Tool page CTA banner | `/tools/x` | "Read the guide →" |
| Article tool widget | In-article sidebar | "Try it now" → tool |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-26 | Initial release with mandatory Discovery Phase |

---

*This guide is a living document. Update after each major WordPress change (plugin updates, new categories, schema changes).*