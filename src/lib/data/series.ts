import { guidesTopics } from "./guides";

export interface Series {
  slug: string;
  title: string;
  description: string;
  category: string;
  guides: string[]; // slugs of guidesTopics
}

export const seriesList: Series[] = [
  {
    slug: "formatter-mastery",
    title: "Formatter Mastery",
    description: "Master JSON, YAML, XML, TOML and code formatting — from basics to validation and troubleshooting.",
    category: "Formatters",
    guides: [
      "concepts/json-basics",
      "concepts/data-serialization-formats",
      "troubleshooting/json-errors",
      "references/json-to-csv",
      "references/json-schema",
    ],
  },
  {
    slug: "security-foundations",
    title: "Security Foundations",
    description: "JWT, hashing, and password security — how to generate, verify, and store secrets safely in the browser.",
    category: "Security",
    guides: [
      "concepts/jwt-structure",
      "best-practices/jwt-security",
      "best-practices/bcrypt-hashing",
      "best-practices/hmac-authentication",
      "best-practices/file-integrity-checksums",
      "best-practices/password-security",
    ],
  },
  {
    slug: "image-workflows",
    title: "Image Workflows",
    description: "From compression to collage, watermark, and EXIF — build a complete browser-based image pipeline.",
    category: "Image Tools",
    guides: [
      "best-practices/image-optimization",
      "troubleshooting/image-compression",
      "references/color-models",
      "concepts/base64-encoding",
    ],
  },
];

export function getSeries(slug: string): Series | undefined {
  return seriesList.find((s) => s.slug === slug);
}

export function getSeriesGuides(series: Series) {
  return series.guides
    .map((slug) => guidesTopics.find((g) => g.slug === slug))
    .filter(Boolean) as typeof guidesTopics;
}
