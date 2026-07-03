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
    twitter: string;
    github: string;
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
