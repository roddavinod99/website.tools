import type { Metadata } from "next";
import { allTools, categories, siteConfig, TOOL_COUNT } from "@/lib/data";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { breadcrumbList, collectionPage, jsonLdScriptBody } from "@/lib/seo/json-ld";
import { Search } from "lucide-react";
import { ToolsListingClient } from "@/components/listings/tools-listing-client";

const toolCountText = `${TOOL_COUNT} free online developer tools`;
const TOOLS_URL = `${siteConfig.url}/tools`;
const TOOLS_DESCRIPTION =
  "Browse our complete collection of free online developer tools. JSON formatter, JWT decoder, UUID generator, Base64 encoder, and more — all client-side, privacy-first.";

export const metadata: Metadata = {
  title: "All Tools",
  description: `Browse ${toolCountText} from DevStackIO. JSON formatters, JWT decoders, UUID generators, image compressors, and more — all client-side.`,
  alternates: { canonical: TOOLS_URL },
  openGraph: {
    title: "All Developer Tools — DevStackIO",
    description: `Browse ${toolCountText} from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.`,
    url: TOOLS_URL,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Developer Tools — DevStackIO",
    description: `Browse ${toolCountText} from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.`,
    images: [siteConfig.ogImage],
  },
};

export default function ToolsPage() {
  const breadcrumb = breadcrumbList([{ name: "Home", url: siteConfig.url }, { name: "Tools" }]);
  const collection = collectionPage({
    name: "All Developer Tools",
    description: TOOLS_DESCRIPTION,
    url: TOOLS_URL,
    items: allTools.map((t) => ({ name: t.name, url: `${siteConfig.url}/tools/${t.slug}` })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(collection) }}
      />
      <section>
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">All Tools</h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              {allTools.length} free tools. No login required.
            </p>
            <p className="mt-4 text-[var(--color-text-muted)]">
              DevStackIO offers a growing library of free online developer tools that run entirely in your
              browser. Format and validate JSON, decode JWT tokens, generate UUIDs, encode and decode
              Base64, compress images, and much more &mdash; all without uploading your data or creating an
              account. Every utility processes locally on your device to keep your information private. Use
              the search box or category filters below to find the right tool for the task.
            </p>
            <form action="/search" method="GET" className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true" />
              <input
                name="q"
                aria-label="Search tools"
                placeholder="Search 172 tools..."
                className="flex h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </form>
          </div>
        </div>
      </section>

      <AdBanner className="my-12" slot={adSlots.toolsTop} />

      <ToolsListingClient tools={allTools} categories={categories} />
    </>
  );
}
