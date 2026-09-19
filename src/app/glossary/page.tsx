import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import { glossaryTerms } from "@/lib/data/glossary";
import { breadcrumbList, jsonLdScriptBody } from "@/lib/seo/json-ld";
import { GlossaryClient } from "./glossary-client";

const GLOSSARY_URL = `${siteConfig.url}/glossary`;
const GLOSSARY_DESCRIPTION =
  "Explore 40+ developer terms — Base64, JWT, JSON, hashing, DNS, and more. Clear definitions with related tools, free on DevStackIO.";

export const metadata: Metadata = {
  title: "Developer Glossary — 40+ Technical Terms",
  description: GLOSSARY_DESCRIPTION,
  alternates: { canonical: GLOSSARY_URL },
  openGraph: {
    title: "Developer Glossary — 40+ Technical Terms | DevStackIO",
    description: GLOSSARY_DESCRIPTION,
    url: GLOSSARY_URL,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Glossary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Glossary — 40+ Technical Terms | DevStackIO",
    description: GLOSSARY_DESCRIPTION,
    images: [siteConfig.ogImage],
  },
};

export default function GlossaryPage() {
  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Glossary", url: GLOSSARY_URL },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Developer Glossary",
    description: GLOSSARY_DESCRIPTION,
    url: GLOSSARY_URL,
    numberOfItems: glossaryTerms.length,
    itemListElement: glossaryTerms.map((term, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "DefinedTerm",
        "@id": `${GLOSSARY_URL}/${term.slug}`,
        name: term.term,
        description: term.definition,
        url: `${GLOSSARY_URL}/${term.slug}`,
        inDefinedTermSet: GLOSSARY_URL,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(itemList) }}
      />
      <section className="border-b border-[var(--color-border)]">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
              Developer Glossary
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-muted)]">
              40 essential terms every developer should know — from encoding and security to
              networks and file formats. Each definition is plain language and links to the
              related DevStackIO tool.
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Definitions sourced from MDN Web Docs, W3C, and RFCs. No tracking, no AI — just
              reference-grade explanations.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          <GlossaryClient terms={glossaryTerms} />
        </div>
      </section>
    </>
  );
}
