import { describe, it, expect } from "vitest";
import {
  landingPages,
  getLandingPage,
  getCanonicalTool,
  listLandingPageParams,
  listIndexableLandingPages,
  landingPageUrl,
  landingPageCountsByCategory,
  type LandingPage,
} from "../src/lib/seo/landing-pages";

describe("landing-pages engine", () => {
  it("exposes a LandingPage[] registry", () => {
    expect(Array.isArray(landingPages)).toBe(true);
  });

  it("every entry has the required fields", () => {
    for (const p of landingPages) {
      expect(typeof p.canonicalSlug).toBe("string");
      expect(p.canonicalSlug.length).toBeGreaterThan(0);
      expect(typeof p.category).toBe("string");
      expect(p.category.length).toBeGreaterThan(0);
      expect(typeof p.slug).toBe("string");
      expect(p.slug.length).toBeGreaterThan(0);
      expect(["compute", "convert", "learn", "define"]).toContain(p.intent);
      expect(typeof p.title).toBe("string");
      expect(typeof p.description).toBe("string");
      expect(p.prefill).toBeTypeOf("object");
    }
  });

  it("title is within the 60-char SEO limit", () => {
    for (const p of landingPages) {
      expect(p.title.length, `title for ${p.canonicalSlug}/${p.slug} is too long`).toBeLessThanOrEqual(60);
    }
  });

  it("description is within the 160-char SEO limit", () => {
    for (const p of landingPages) {
      expect(p.description.length, `description for ${p.canonicalSlug}/${p.slug} is too long`).toBeLessThanOrEqual(160);
    }
  });

  it("category + slug pairs are unique (no duplicate URLs)", () => {
    const seen = new Set<string>();
    for (const p of landingPages) {
      const key = `${p.category}/${p.slug}`;
      expect(seen.has(key), `duplicate URL: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("seeAlso references resolve to known landing pages", () => {
    const keys = new Set(landingPages.map((p) => `${p.category}/${p.slug}`));
    for (const p of landingPages) {
      for (const ref of p.content?.seeAlso ?? []) {
        expect(keys.has(ref), `unknown seeAlso ref "${ref}" in ${p.canonicalSlug}/${p.slug}`).toBe(true);
      }
    }
  });

  it("getLandingPage returns the matching entry or undefined", () => {
    for (const p of landingPages) {
      expect(getLandingPage(p.category, p.slug)).toBe(p);
    }
    expect(getLandingPage("nope", "nada")).toBeUndefined();
  });

  it("getCanonicalTool returns the Tool that exists in the registry", () => {
    for (const p of landingPages) {
      const tool = getCanonicalTool(p);
      expect(tool, `no tool for ${p.canonicalSlug}`).toBeDefined();
      expect(tool?.slug).toBe(p.canonicalSlug);
    }
  });

  it("listLandingPageParams returns one entry per page (including noindex)", () => {
    const params = listLandingPageParams();
    expect(params.length).toBe(landingPages.length);
  });

  it("listIndexableLandingPages excludes noindex entries", () => {
    const indexable = listIndexableLandingPages();
    for (const p of indexable) {
      expect(p.noindex).toBeFalsy();
    }
  });

  it("landingPageUrl builds an absolute URL with no trailing slash", () => {
    const p: LandingPage = {
      canonicalSlug: "unit-converter",
      category: "length",
      slug: "cm-to-feet",
      intent: "convert",
      title: "Centimeters to Feet",
      description: "Convert cm to ft.",
      prefill: { value: "1", fromUnit: "cm" },
    };
    expect(landingPageUrl(p, "https://tools.devstackio.com/")).toBe(
      "https://tools.devstackio.com/convert/length/cm-to-feet"
    );
  });

  it("landingPageCountsByCategory returns one row per indexable category", () => {
    const counts = landingPageCountsByCategory();
    // The registry may only contain noindex placeholder entries in PR 1;
    // skip the assertion in that case rather than fabricate data.
    if (counts.length === 0) {
      const allNoindex = landingPages.every((p) => p.noindex === true);
      expect(allNoindex).toBe(true);
      return;
    }
    for (const row of counts) {
      expect(typeof row.category).toBe("string");
      expect(row.count).toBeGreaterThanOrEqual(1);
    }
  });
});
