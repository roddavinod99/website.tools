"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Fragment } from "react";
import { allTools, categories, siteConfig } from "@/lib/data";
import { featuresBySlug } from "@/lib/data/tool-features";
import { getAllCapabilities } from "@/lib/data/tool-capabilities";
import { ToolCard } from "@/components/ui/tool-card";
import { Search, Filter, X } from "lucide-react";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const CAPABILITY_FILTERS = [
  { key: "worker" as const, label: "Web Worker" },
  { key: "wasm" as const, label: "WASM" },
  { key: "realTime" as const, label: "Real-time" },
  { key: "copy" as const, label: "Copy" },
  { key: "download" as const, label: "Download" },
  { key: "validation" as const, label: "Validation" },
  { key: "fileUpload" as const, label: "File Upload" },
  { key: "dragDrop" as const, label: "Drag & Drop" },
  { key: "multipleInputs" as const, label: "Multi-input" },
  { key: "comparison" as const, label: "Comparison" },
  { key: "syntaxHighlighting" as const, label: "Syntax Highlight" },
  { key: "tabs" as const, label: "Tabs" },
] as const;

export default function ToolsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [capabilities] = useState(() => getAllCapabilities());
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(new Set(
    searchParams.get("cap")?.split(",").filter(Boolean) ?? []
  ));
  const [isOpen, setIsOpen] = useState(false);

  const capabilityMap = useMemo(() => {
    const map = new Map<string, Record<string, boolean>>();
    capabilities.forEach((c) => {
      map.set(c.slug, c.capabilities);
    });
    return map;
  }, [capabilities]);

  const filteredTools = useMemo(() => {
    if (selectedCapabilities.size === 0) return allTools;
    return allTools.filter((tool) => {
      const caps = capabilityMap.get(tool.slug);
      if (!caps) return false;
      return Array.from(selectedCapabilities).every((cap) => caps[cap as keyof typeof caps] === true);
    });
  }, [selectedCapabilities, capabilityMap]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedCapabilities.size > 0) {
      params.set("cap", Array.from(selectedCapabilities).join(","));
    } else {
      params.delete("cap");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCapabilities, searchParams, router, pathname]);

  const toggleCapability = (cap: string) => {
    const newSet = new Set(selectedCapabilities);
    if (newSet.has(cap)) {
      newSet.delete(cap);
    } else {
      newSet.add(cap);
    }
    setSelectedCapabilities(newSet);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedCapabilities(new Set());
  };

  const activeFilterCount = selectedCapabilities.size;

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Developer Tools",
    description: "Browse our complete collection of free online developer tools. JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more — all client-side, privacy-first.",
    url: `${siteConfig.url}/tools`,
    mainEntity: {
      "@type": "ItemList",
      name: "All Developer Tools",
      description: "Browse our complete collection of free online developer tools. JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more — all client-side, privacy-first.",
      url: `${siteConfig.url}/tools`,
      numberOfItems: filteredTools.length,
      itemListElement: filteredTools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.name,
        url: `${siteConfig.url}/tools/${tool.slug}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Tools" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <section>
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              All Tools
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              {allTools.length} free tools. No login required.
            </p>
            <p className="mt-4 text-surface-600 dark:text-dark-muted">
              DevStackIO offers a growing library of free online developer tools that run entirely in your
              browser. Format and validate JSON, decode JWT tokens, generate UUIDs, encode and decode
              Base64, compress images, and much more &mdash; all without uploading your data or creating an
              account. Every utility processes locally on your device to keep your information private. Use
              the search box or category filters below to find the right tool for the task.
            </p>
            <form action="/search" method="GET" className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
              <input
                name="q"
                placeholder="Search tools..."
                className="flex h-12 w-full rounded-lg border border-surface-200 bg-white pl-10 pr-4 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
              />
            </form>
          </div>
        </div>
      </section>

      <AdBanner className="my-12" slot={adSlots.toolsTop} />

      <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
        <div className="container py-16 md:py-24">
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/tools"
              className="rounded-full border border-brand-primary bg-brand-primary px-4 py-1.5 text-sm font-medium text-white"
            >
              All
            </Link>
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="rounded-full border border-surface-200 px-4 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-200 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Capability Filter Dropdown */}
          <div className="mb-6 relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                activeFilterCount > 0
                  ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-surface-200 bg-white text-surface-600 hover:border-surface-300 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
              }`}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-label="Filter by capabilities"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span>
                {activeFilterCount > 0
                  ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
                  : "Filter by capability"}
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-surface-200 dark:hover:bg-dark-border"
                  aria-label="Clear all filters"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-1 z-10 w-56 rounded-lg border border-surface-200 bg-white py-2 shadow-lg dark:border-dark-border dark:bg-dark-surface">
                {CAPABILITY_FILTERS.map((cap) => (
                  <label
                    key={cap.key}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 dark:text-dark-muted dark:hover:bg-dark-border cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCapabilities.has(cap.key)}
                      onChange={() => toggleCapability(cap.key)}
                      className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface"
                    />
                    {cap.label}
                  </label>
                ))}
              </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, index) => (
              <Fragment key={tool.id}>
                {index === Math.floor(filteredTools.length / 2) && (
                  <div className="col-span-full">
                    <AdBanner className="my-8" slot={adSlots.toolsMid} />
                  </div>
                )}
                <ToolCard
                  tool={{
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    category: tool.category,
                    slug: tool.slug,
                    popularity: tool.popularity,
                    featured: tool.featured,
                    trending: tool.trending,
                    new: tool.new,
                    icon: tool.icon,
                    features: featuresBySlug[tool.slug],
                  }}
                  variant="default"
                  size="md"
                />
              </Fragment>
            ))}
            {filteredTools.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-surface-500 dark:text-dark-muted">
                  No tools match the selected filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm text-brand-600 hover:text-brand-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
