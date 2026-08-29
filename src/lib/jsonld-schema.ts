/**
 * Typed JSON-LD Schema utilities using schema-dts for type safety.
 * Provides type-safe entity creation helpers for structured data.
 */

// Re-export core types from schema-dts for consumers
export type {
  WithContext,
  Graph,
  Thing,
  SoftwareApplication,
  TechArticle,
  BlogPosting,
  BreadcrumbList,
  Organization,
  CollectionPage,
  WebSite,
  FAQPage,
  HowTo,
  EntryPoint,
  SearchAction,
  ImageObject,
  Offer,
  MonetaryAmount,
  HowToSupply,
  HowToTool,
  HowToStep,
  ContactPoint,
  AggregateRating,
  ListItem,
  ItemList,
  WebPage,
  Person,
  CreativeWork,
} from "schema-dts";

export type JsonLd<T> = { "@context": "https://schema.org" } & T;

// Type for JSON-LD graph (@graph array)
export type JsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": readonly object[];
};

// Helper to create a typed JSON-LD object
export function createJsonLd<T extends object>(entity: T): object {
  return {
    "@context": "https://schema.org",
    ...entity,
  };
}

// Helper to create a typed JSON-LD graph
export function createJsonLdGraph(entities: readonly object[]): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": entities,
  };
}

// --- Entity creators for common types ---

export interface SoftwareApplicationData {
  "@id": string;
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
  author: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
  };
  image?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
    bestRating: string;
    worstRating: string;
  };
  featureList?: string[];
}

export function createSoftwareApplication(data: SoftwareApplicationData): object {
  return {
    "@type": "SoftwareApplication",
    "@id": data["@id"],
    name: data.name,
    url: data.url,
    description: data.description,
    applicationCategory: data.applicationCategory,
    operatingSystem: data.operatingSystem,
    offers: data.offers,
    author: data.author,
    publisher: data.publisher,
    ...(data.image && { image: data.image }),
    ...(data.aggregateRating && { aggregateRating: data.aggregateRating }),
    ...(data.featureList && { featureList: data.featureList }),
  };
}

export interface TechArticleData {
  "@id": string;
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  image: string;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  author: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
}

export function createTechArticle(data: TechArticleData): object {
  return {
    "@type": "TechArticle",
    "@id": data["@id"],
    headline: data.headline,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    image: data.image,
    mainEntityOfPage: data.mainEntityOfPage,
    author: data.author,
    publisher: data.publisher,
  };
}

export interface BlogPostingData {
  "@id": string;
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  image: string;
  wordCount: number;
  author: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  publisher: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
}

export function createBlogPosting(data: BlogPostingData): object {
  return {
    "@type": "BlogPosting",
    "@id": data["@id"],
    headline: data.headline,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    image: data.image,
    wordCount: data.wordCount,
    author: data.author,
    publisher: data.publisher,
    mainEntityOfPage: data.mainEntityOfPage,
  };
}

export interface ComparisonData {
  "@id": string;
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  publisher: {
    "@type": "Organization";
    "@id": string;
    name: string;
    url: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
}

export function createComparison(data: ComparisonData): object {
  return {
    "@type": "TechArticle",
    "@id": data["@id"],
    headline: data.headline,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: data.author,
    publisher: data.publisher,
    mainEntityOfPage: data.mainEntityOfPage,
  };
}

export interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

export function createBreadcrumbList(items: readonly BreadcrumbItem[]): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };
}

export interface OrganizationData {
  "@id": string;
  name: string;
  url: string;
  logo: { "@type": "ImageObject"; url: string; width: number; height: number };
  description: string;
  email: string;
  foundingDate: string;
  alternateName: string;
  sameAs: readonly string[];
  contactPoint: readonly {
    "@type": "ContactPoint";
    email: string;
    contactType: string;
  }[];
}

export function createOrganization(data: OrganizationData): object {
  return {
    "@type": "Organization",
    "@id": data["@id"],
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    email: data.email,
    foundingDate: data.foundingDate,
    alternateName: data.alternateName,
    sameAs: data.sameAs,
    contactPoint: data.contactPoint.map((cp) => ({
      "@type": "ContactPoint",
      email: cp.email,
      contactType: cp.contactType,
    })),
  };
}

export interface CollectionPageData {
  name: string;
  description: string;
  url: string;
  mainEntity: {
    "@type": "ItemList";
    name: string;
    description: string;
    numberOfItems: number;
    itemListElement: readonly {
      "@type": "ListItem";
      position: number;
      name: string;
      url: string;
      description: string;
    }[];
  };
}

export function createCollectionPage(data: CollectionPageData): object {
  return {
    "@type": "CollectionPage",
    name: data.name,
    description: data.description,
    url: data.url,
    mainEntity: data.mainEntity,
  };
}

export interface WebSiteData {
  name: string;
  url: string;
  searchActionUrlTemplate: string;
}

export function createWebSite(data: WebSiteData): object {
  return {
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: data.searchActionUrlTemplate,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function createFAQPage(faqs: readonly { question: string; answer: string }[]): object {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface HowToData {
  name: string;
  description: string;
  image: string;
  totalTime: string;
  estimatedCost: { currency: string; value: string };
  supply: readonly { name: string }[];
  tool: readonly { name: string; url: string }[];
  step: readonly { position: number; name: string; text: string }[];
}

export function createHowTo(data: HowToData): object {
  return {
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    image: data.image,
    totalTime: data.totalTime,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: data.estimatedCost.currency,
      value: data.estimatedCost.value,
    },
    supply: data.supply.map((s) => ({ "@type": "HowToSupply", name: s.name })),
    tool: data.tool.map((t) => ({ "@type": "HowToTool", name: t.name, url: t.url })),
    step: data.step.map((s) => ({
      "@type": "HowToStep",
      position: s.position,
      name: s.name,
      text: s.text,
    })),
  };
}