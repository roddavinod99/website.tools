import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { allTools, siteConfig, learningTopics } from "@/lib/constants";
import { getToolContent } from "@/lib/tool-content";
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

  const sameCategory = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  const popularTools = allTools
    .filter((t) => t.id !== tool.id && !sameCategory.find((st) => st.id === t.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 3);

  const toolGuideMap: Record<string, string> = {
    "ipv4-range-expander": "ipv4-range-expander",
    "ipv6-ula-generator": "ipv6-ula-generator",
    "chmod-calculator": "chmod-calculator",
    "eta-calculator": "eta-calculator",
    "http-status-codes": "http-status-codes",
    "git-cheatsheet": "git-cheatsheet",
    "regex-memo": "regex-memo",
  };

  const toolGuideSlug = toolGuideMap[tool.slug];
  const specificGuide = toolGuideSlug ? learningTopics.find((t) => t.slug === toolGuideSlug) : null;

  const tocItems = [
    { id: "about", label: "About", level: 1 },
    { id: "how-to-use", label: "How to Use", level: 1 },
    { id: "examples", label: "Examples", level: 1 },
    { id: "best-practices", label: "Best Practices", level: 1 },
    { id: "common-mistakes", label: "Common Mistakes", level: 1 },
    { id: "faq", label: "FAQ", level: 1 },
    { id: "related-tools", label: "Related Tools", level: 1 },
    { id: "learning-resources", label: "Learning Resources", level: 1 },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["SoftwareApplication", "WebApplication"],
            name: tool.name,
            url: `${siteConfig.url}/tools/${tool.slug}`,
            description: tool.description,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "All",
            browserRequirements: "Modern browser with JavaScript enabled",
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Organization",
              name: "DevStackIO",
              url: siteConfig.mainSiteUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "DevStackIO",
              url: siteConfig.mainSiteUrl,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "Tools", item: `${siteConfig.url}/tools` },
              { "@type": "ListItem", position: 3, name: tool.name },
            ],
          }),
        }}
      />
      {content.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: content.faq.map((item) => {
                const q = item.includes(" — ") ? item.split(" — ")[0] : item.split(" | A:")[0];
                const a = item.includes(" — ") ? item.split(" — ").slice(1).join(" — ") : item.split(" | A:")[1] || "";
                return {
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                };
              }),
            }),
          }}
        />
      )}
      {content.instructions.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: `How to use ${tool.name}`,
              description: `Step-by-step guide to using ${tool.name} for ${tool.description.split(" ").slice(0, 8).join(" ").toLowerCase()}.`,
              image: `${siteConfig.url}${siteConfig.ogImage}`,
              totalTime: "PT5M",
              step: content.instructions.map((instruction, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                name: instruction.split(".")[0] || `Step ${index + 1}`,
                text: instruction,
              })),
            }),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: tool.name,
            description: tool.description,
            url: `${siteConfig.url}/tools/${tool.slug}`,
            codeRepository: siteConfig.links.github,
            programmingLanguage: "TypeScript",
            runtimePlatform: "Web Browser",
            license: "https://opensource.org/licenses/MIT",
          }),
        }}
      />
      <ToolClient
        tool={tool}
        content={content}
        sameCategory={sameCategory}
        popularTools={popularTools}
        specificGuide={specificGuide ?? null}
        tocItems={tocItems}
      />
    </>
  );
}