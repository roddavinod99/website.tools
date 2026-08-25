import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { allTools, siteConfig, learningTopics, categories } from "@/lib/constants";
import { getToolContent } from "@/lib/tool-content";
import { parseFaqItem } from "@/lib/faq";
import { featuresBySlug } from "@/lib/data/tool-features";
import { findRelatedTools } from "@/lib/related-tools";
import { ToolClient } from "./tool-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const tool of allTools) {
    params.push({ slug: tool.slug });
    if (tool.aliasSlugs) {
      for (const alias of tool.aliasSlugs) {
        params.push({ slug: alias });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = allTools.find((t) => t.slug === slug) ?? allTools.find((t) => t.aliasSlugs?.includes(slug));
  if (!tool) return {};
  const canonical = `${siteConfig.url}/tools/${tool.slug}`;
  return {
    title: tool.name,
    description: tool.description,
    ...(tool.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical },
    openGraph: {
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${tool.name} - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;

  const aliasMatch = allTools.find((t) => t.aliasSlugs?.includes(slug));
  if (aliasMatch) {
    redirect(`/tools/${aliasMatch.slug}`);
  }

  const tool = allTools.find((t) => t.slug === slug);
  if (!tool) notFound();

  const content = await getToolContent(slug);
  if (!content) notFound();

  const relatedGroups = findRelatedTools(tool, allTools);
  const sameCategory = relatedGroups.sameCategory;
  const relatedTools = relatedGroups.related;
  const popularTools = relatedGroups.popular;

  const toolGuideMap: Record<string, string> = {
    "json-formatter": "getting-started-json",
    "json-to-yaml": "data-serialization-formats",
    "json-to-xml": "data-serialization-formats",
    "json-to-typescript": "getting-started-json",
    "json-beautifier": "getting-started-json",
    "json-minifier": "getting-started-json",
    "jwt-decoder": "understanding-jwt",
    "jwt-generator": "understanding-jwt",
    "image-compressor": "image-optimization-guide",
    "image-resizer": "image-optimization-guide",
    "password-generator": "password-security",
    "password-strength": "password-security",
    "base64": "understanding-base64",
    "base64-encoder": "understanding-base64",
    "base64-decoder": "understanding-base64",
    "image-to-base64": "understanding-base64",
    "css-formatter": "css-minification-guide",
    "css-minifier": "css-minification-guide",
    "regex-tester": "regex-fundamentals",
    "regex-memo": "regex-fundamentals",
    "timestamp-converter": "unix-timestamps-explained",
    "html-entity": "html-encoding-guide",
    "html-formatter": "html-encoding-guide",
    "yaml-formatter": "data-serialization-formats",
    "yaml-viewer": "data-serialization-formats",
    "toml-converter": "data-serialization-formats",
    "xml-formatter": "data-serialization-formats",
    "xml-to-json": "data-serialization-formats",
    "json-to-csv": "json-to-csv-guide",
    "csv-to-json": "json-to-csv-guide",
    "sql-formatter": "sql-formatting-guide",
    "html-to-markdown": "html-markdown-guide",
    "markdown-to-html": "html-markdown-guide",
    "markdown-preview": "markdown-guide",
    "markdown-editor": "markdown-guide",
    "color-converter": "color-conversion-guide",
    "color-eyedropper": "color-conversion-guide",
    "diff-checker": "text-diff-guide",
    "text-diff-visual": "text-diff-guide",
    "string-comparison": "text-diff-guide",
    "cron-expression": "cron-expression-guide",
    "url-parser": "url-parsing-guide",
    "json-schema-generator": "json-schema-guide",
    "json-validator": "json-schema-guide",
    "qr-generator": "qr-code-guide",
    "wifi-qr-generator": "qr-code-guide",
    "random-data": "random-data-guide",
    "lorem-ipsum": "random-data-guide",
    "case-converter": "case-conversion-guide",
    "slug-generator": "case-conversion-guide",
    "ipv4-subnet-calculator": "ip-subnetting-guide",
    "ipv6-calculator": "ip-subnetting-guide",
    "ip-calculator": "ip-subnetting-guide",
    "file-checksum": "file-checksum-guide",
    "hash-generator": "file-checksum-guide",
    "word-counter": "word-count-guide",
    "uuid-generator": "uuid-guide",
    "ulid-generator": "uuid-guide",
    "bcrypt-generator": "bcrypt-guide",
    "hmac-generator": "hmac-guide",
  };

  const toolGuideSlug = toolGuideMap[tool.slug];
  const specificGuide = toolGuideSlug ? learningTopics.find((t) => t.slug === toolGuideSlug) : null;

  const categorySlug = categories.find((c) => c.name === tool.category)?.slug ?? "";
  const category = categories.find((c) => c.name === tool.category);

  const featureList = (() => {
    const own = featuresBySlug[tool.slug];
    if (own && own.length) return own;
    if (category?.seoFeatures && category.seoFeatures.length) return category.seoFeatures;
    return [];
  })();

  const toolUrl = `${siteConfig.url}/tools/${tool.slug}`;

  const tocItems = [
    { id: "about", label: "About", level: 1 },
    ...(content.features?.length ? [{ id: "features", label: "Key Features", level: 1 }] : []),
    { id: "how-to-use", label: "How to Use", level: 1 },
    { id: "examples", label: "Examples", level: 1 },
    { id: "best-practices", label: "Best Practices", level: 1 },
    { id: "common-mistakes", label: "Common Mistakes", level: 1 },
    { id: "faq", label: "FAQ", level: 1 },
    ...(content.references?.length ? [{ id: "references", label: "References", level: 1 }] : []),
    { id: "related-tools", label: "Related Tools", level: 1 },
    { id: "learning-resources", label: "Learning Resources", level: 1 },
  ];

  const faqJsonLd = content.faq.length > 0
    ? {
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => {
          const { question, answer } = parseFaqItem(item);
          return {
            "@type": "Question",
            name: question.endsWith("?") ? question : `${question}?`,
            acceptedAnswer: { "@type": "Answer", text: answer },
          };
        }),
      }
    : null;

  const howToJsonLd = content.instructions.length > 0
    ? {
        "@type": "HowTo",
        name: `How to use ${tool.name}`,
        description: `Step-by-step guide to using ${tool.name} for ${tool.description.split(" ").slice(0, 8).join(" ").toLowerCase()}.`,
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        totalTime: "PT5M",
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: "0",
        },
        supply: [
          { "@type": "HowToSupply", name: "Web browser" },
          { "@type": "HowToSupply", name: "Internet connection" },
        ],
        tool: [
          { "@type": "HowToTool", name: tool.name, url: toolUrl },
        ],
        step: content.instructions.map((instruction, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: instruction.split(".")[0] || `Step ${index + 1}`,
          text: instruction,
        })),
      }
    : null;

  const softwareAppJsonLd: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": toolUrl,
    name: tool.name,
    url: toolUrl,
    description: tool.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cloud",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "DevStackIO",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "DevStackIO",
      url: siteConfig.url,
    },
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
      bestRating: "5",
      worstRating: "1",
    },
  };
  if (featureList.length) {
    softwareAppJsonLd.featureList = featureList;
  }

  const sourceCodeJsonLd = {
    "@type": "SoftwareSourceCode",
    name: tool.name,
    description: tool.description,
    url: toolUrl,
    codeRepository: siteConfig.links.github,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Web Browser",
    license: "https://opensource.org/licenses/MIT",
  };

  const graphItems: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Tools", item: `${siteConfig.url}/tools` },
        { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
      ],
    },
    softwareAppJsonLd,
    sourceCodeJsonLd,
    ...(faqJsonLd ? [faqJsonLd] : []),
    ...(howToJsonLd ? [howToJsonLd] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graphItems,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <ToolClient
        tool={tool}
        content={content}
        sameCategory={sameCategory}
        related={relatedTools}
        popularTools={popularTools}
        specificGuide={specificGuide ?? null}
        tocItems={tocItems}
        mainSiteUrl={siteConfig.mainSiteUrl}
        categorySlug={categorySlug}
      />
    </>
  );
}