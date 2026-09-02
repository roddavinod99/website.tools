import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TOOL_COUNT, siteConfig, allTools, featuredTools, trendingTools, categories, faqItems } from "@/lib/data";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedTools } from "@/components/home/featured-tools";
import { TrendingRail } from "@/components/home/trending-rail";
import { PinnedRail, RecentRail } from "@/components/home/personalize-rails";
import { AdBanner } from "@/components/ads";
import { ToolsCta } from "@/components/home/tools-cta";
import { adSlots } from "@/lib/data/ads";

// Homepage is fully static - no dynamic data, no revalidation needed
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Developer Tools for Everyday Work",
  description:
    `${TOOL_COUNT} free online developer tools from DevStackIO. Format JSON, decode JWT, generate UUIDs, convert data, compress images, and more — all in your browser, no uploads.`,
  alternates: {
    canonical: siteConfig.url,
    languages: { en: siteConfig.url, "x-default": siteConfig.url },
  },
  openGraph: {
    title: `DevStackIO — ${TOOL_COUNT} Free Online Developer Tools`,
    description:
      `${TOOL_COUNT} free online developer tools for coding, debugging, and productivity. Format JSON, decode JWT, generate UUIDs, convert data — all client-side, zero uploads.`,
    url: siteConfig.url,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "DevStackIO Free Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `DevStackIO — ${TOOL_COUNT} Free Online Developer Tools`,
    description:
      `${TOOL_COUNT} free online developer tools for coding, debugging, and productivity. Format JSON, decode JWT, generate UUIDs, convert data — all client-side, zero uploads.`,
    images: [siteConfig.ogImage],
  },
};

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "DevStackIO Tools",
      url: siteConfig.url,
      description: "Free online developer tools from DevStackIO. Format, encode, generate, convert, and analyze data entirely in your browser with no server uploads.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
        name: "DevStackIO",
      },
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.mainSiteName,
        url: siteConfig.mainSiteUrl,
      },
    },
    {
      "@type": "ItemList",
      name: "Featured developer tools",
      description: "A selection of free, browser-based developer tools from DevStackIO.",
      url: siteConfig.url,
      numberOfItems: featuredTools.length,
      itemListElement: featuredTools.slice(0, 8).map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.description,
          url: `${siteConfig.url}/tools/${tool.slug}`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Cloud",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
    {
      "@type": "ItemList",
      name: "Trending developer tools",
      description: "Developer tools developers are reaching for most right now on DevStackIO.",
      url: siteConfig.url,
      numberOfItems: trendingTools.length,
      itemListElement: trendingTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.description,
          url: `${siteConfig.url}/tools/${tool.slug}`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Cloud",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@type": "CollectionPage",
      name: "DevStackIO — Free Developer Tools",
      description: `${TOOL_COUNT} free online developer tools across ${categories.length} categories. Format, encode, generate, convert, and analyze data in your browser.`,
      url: siteConfig.url,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: categories.map((cat, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: `${cat.name} tools`,
            description: cat.description,
            url: `${siteConfig.url}/categories/${cat.slug}`,
          },
        })),
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero
        badgeText={`${TOOL_COUNT} free tools. No login required.`}
        allTools={allTools}
      />
      <CategoriesSection />
      <PinnedRail tools={allTools} />
      <FeaturedTools featuredTools={featuredTools} />
      <RecentRail tools={allTools} />
      <TrendingRail trendingTools={trendingTools} />
      <AdBanner className="my-10" slot={adSlots.homeTop} />
      <ToolsCta />
    </>
  );
}
