import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { allTools, siteConfig, guidesTopics, categories } from "@/lib/data";
import { getToolContent } from "@/lib/tool-content";
import { parseFaqItem } from "@/lib/faq";
import { featuresBySlug } from "@/lib/data/tool-features";
import { findRelatedTools } from "@/lib/related-tools";
import { breadcrumbList, jsonLdScriptBody } from "@/lib/seo/json-ld";
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
  const dynamicOgImage = `${siteConfig.url}/og/${tool.slug}`;
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
      images: [{ url: dynamicOgImage, width: 1200, height: 630, alt: `${tool.name} - DevStackIO` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      images: [dynamicOgImage],
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

  // Build next-step suggestions (max 4)
  const nextStepCandidates = [...sameCategory, ...relatedTools, ...popularTools]
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 4);
  const nextSteps = nextStepCandidates.map((t) => ({ tool: t.slug, label: t.name }));

  const specificGuide = tool.guideSlug
    ? guidesTopics.find((t) => t.slug === tool.guideSlug) ?? null
    : null;

  const categorySlug = categories.find((c) => c.name === tool.category)?.slug ?? "";
  const category = categories.find((c) => c.name === tool.category);

  const featureList = (() => {
    const own = featuresBySlug[tool.slug];
    if (own && own.length) return own;
    if (category?.seoFeatures && category.seoFeatures.length) return category.seoFeatures;
    return [];
  })();

  const toolUrl = `${siteConfig.url}/tools/${tool.slug}`;
  const dynamicOgImage = `${siteConfig.url}/og/${tool.slug}`;

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
        image: dynamicOgImage,
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
    image: dynamicOgImage,
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
    breadcrumbList([
      { name: "Home", url: siteConfig.url },
      { name: "Tools", url: `${siteConfig.url}/tools` },
      { name: tool.name, url: toolUrl },
    ]),
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
          __html: jsonLdScriptBody({ "@context": "https://schema.org", "@graph": graphItems }),
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
        nextSteps={nextSteps}
      />
    </>
  );
}