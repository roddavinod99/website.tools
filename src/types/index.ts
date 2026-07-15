export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  popularity: number;
  icon: string;
  featured?: boolean;
  new?: boolean;
  trending?: boolean;
  worker?: boolean;
  wasm?: boolean;
  aliasSlugs?: string[];
  keywords?: string[];
  noindex?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  toolCount: number;
  seoKeywords?: string[];
  seoFeatures?: string[];
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
    twitter?: string;
  };
  contactEmail?: string;
  legal?: {
    lastUpdated: Record<string, string>;
  };
}

export interface NavItem {
  title: string;
  href: string;
}

export interface ToolContent {
  whatItDoes: string;
  whyItExists: string;
  whoShouldUse: string;
  useCases: string[];
  instructions: string[];
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  faq: string[];
}

export interface FooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface CookieCategory {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface AdPlaceholderProps {
  className?: string;
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  width?: number;
  height?: number;
}
