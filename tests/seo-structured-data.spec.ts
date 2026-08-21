import { test, expect } from "@playwright/test";

const ORG_ID = "https://tools.devstackio.com/#organization";

function extractJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      blocks.push({ __parseError: match[1].slice(0, 80) });
    }
  }
  return blocks;
}

function flattenNodes(blocks: Record<string, unknown>[]): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const block of blocks) {
    const graph = block["@graph"];
    if (Array.isArray(graph)) {
      nodes.push(...(graph as Record<string, unknown>[]));
    } else {
      nodes.push(block);
    }
  }
  return nodes;
}

function typesOf(nodes: Record<string, unknown>[]): Set<string> {
  return new Set(nodes.map((n) => String(n["@type"] ?? "")));
}

function findByType(nodes: Record<string, unknown>[], type: string): Record<string, unknown>[] {
  return nodes.filter((n) => String(n["@type"]) === type);
}

async function fetchLd(request: import("@playwright/test").APIRequestContext, path: string) {
  const res = await request.get(path);
  expect(res.ok(), `${path} should return 200`).toBeTruthy();
  const html = await res.text();
  const blocks = extractJsonLd(html);
  expect(blocks.length, `${path} should contain at least one ld+json block`).toBeGreaterThan(0);
  return { html, blocks, nodes: flattenNodes(blocks) };
}

test.describe("JSON-LD structured data", () => {
  test("every ld+json block on every sampled page parses as valid JSON", async ({ request }) => {
    const pages = [
      "/",
      "/tools",
      "/tools/json-formatter",
      "/tools/currency-converter",
      "/guides/getting-started-json",
      "/blog/how-to-format-json-online",
      "/compare",
      "/compare/json-vs-yaml-vs-xml-vs-toml",
      "/categories",
      "/categories/formatters",
      "/about",
    ];
    for (const path of pages) {
      const res = await request.get(path);
      expect(res.ok(), `${path} should return 200`).toBeTruthy();
      const html = await res.text();
      for (const block of extractJsonLd(html)) {
        expect(block.__parseError, `${path} should emit parseable JSON-LD`).toBeUndefined();
      }
    }
  });

  test("homepage emits WebSite with SearchAction pointing at the search route", async ({ request }) => {
    const { nodes } = await fetchLd(request, "/");
    const websites = findByType(nodes, "WebSite");
    expect(websites).toHaveLength(1);
    const action = websites[0].potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
    const target = action.target as Record<string, unknown>;
    expect(target["@type"]).toBe("EntryPoint");
    expect(target.urlTemplate).toBe("https://tools.devstackio.com/search?q={search_term_string}");
    expect(action["query-input"]).toBe("required name=search_term_string");
  });

  test("WebSite + SearchAction appear on the homepage only, not on content pages", async ({ request }) => {
    const contentPages = [
      "/tools",
      "/tools/json-formatter",
      "/guides",
      "/guides/getting-started-json",
      "/blog/how-to-format-json-online",
      "/compare",
      "/compare/json-vs-yaml-vs-xml-vs-toml",
      "/categories",
      "/categories/formatters",
      "/about",
    ];
    for (const path of contentPages) {
      const { nodes } = await fetchLd(request, path);
      const types = typesOf(nodes);
      expect(types.has("WebSite"), `${path} should not emit a WebSite node`).toBeFalsy();
      expect(types.has("SearchAction"), `${path} should not emit a SearchAction node`).toBeFalsy();
    }
  });

  test("every page emits the shared Organization node with the canonical @id", async ({ request }) => {
    const pages = [
      "/",
      "/tools",
      "/tools/json-formatter",
      "/guides/getting-started-json",
      "/blog/how-to-format-json-online",
      "/compare",
      "/compare/json-vs-yaml-vs-xml-vs-toml",
      "/categories/formatters",
      "/about",
    ];
    for (const path of pages) {
      const { nodes } = await fetchLd(request, path);
      const orgs = findByType(nodes, "Organization");
      expect(orgs.length, `${path} should emit an Organization node`).toBeGreaterThan(0);
      const shared = orgs.find((o) => o["@id"] === ORG_ID);
      expect(shared, `${path} should emit the shared Organization @id`).toBeDefined();
    }
  });

  test("inline publisher/author Organizations reference the shared Organization @id", async ({ request }) => {
    const contentPages: Array<[string, string]> = [
      ["/tools/json-formatter", "SoftwareApplication"],
      ["/guides/getting-started-json", "TechArticle"],
      ["/blog/how-to-format-json-online", "Article"],
      ["/compare/json-vs-yaml-vs-xml-vs-toml", "TechArticle"],
    ];
    for (const [path, articleType] of contentPages) {
      const { nodes } = await fetchLd(request, path);
      const articles = findByType(nodes, articleType);
      expect(articles.length, `${path} should emit ${articleType}`).toBeGreaterThan(0);
      for (const article of articles) {
        for (const key of ["publisher", "author"]) {
          const org = article[key] as Record<string, unknown> | undefined;
          if (!org) continue;
          expect(
            org["@id"],
            `${path} ${articleType} ${key} should reference ${ORG_ID}`
          ).toBe(ORG_ID);
        }
      }
    }
  });
});