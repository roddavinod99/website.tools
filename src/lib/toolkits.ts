export interface Toolkit {
  name: string;
  description: string;
  slug: string;
  icon: string;
  toolCount: number;
  color: string;
}

export const toolkits: Record<string, Toolkit> = {
  "json-toolkit": {
    name: "JSON Toolkit",
    description: "Format, validate, diff, convert, and generate code from JSON - 13 powerful tools in one place.",
    slug: "json-toolkit",
    icon: "Braces",
    toolCount: 14,
    color: "bg-amber-500",
  },
  "encoder-toolkit": {
    name: "Encoder Toolkit",
    description: "Encode and decode data with Base64, URL, HTML entities, binary, hex, and more.",
    slug: "encoder-toolkit",
    icon: "FileCode",
    toolCount: 8,
    color: "bg-blue-500",
  },
  "generator-toolkit": {
    name: "Generator Toolkit",
    description: "Generate UUIDs, passwords, QR codes, barcodes, lorem ipsum, and random data.",
    slug: "generator-toolkit",
    icon: "Wand2",
    toolCount: 8,
    color: "bg-purple-500",
  },
  "security-toolkit": {
    name: "Security Toolkit",
    description: "Hash data, decode JWT tokens, generate TOTP codes, analyze SSL certificates, and more.",
    slug: "security-toolkit",
    icon: "Shield",
    toolCount: 7,
    color: "bg-red-500",
  },
  "image-toolkit": {
    name: "Image Toolkit",
    description: "Compress, resize, optimize, and analyze images. Generate favicons and placeholders.",
    slug: "image-toolkit",
    icon: "Image",
    toolCount: 8,
    color: "bg-green-500",
  },
  "text-toolkit": {
    name: "Text Toolkit",
    description: "Analyze, convert, sort, compare, and transform text with 8 powerful utilities.",
    slug: "text-toolkit",
    icon: "Hash",
    toolCount: 8,
    color: "bg-teal-500",
  },
  "dev-toolkit": {
    name: "Developer Toolkit",
    description: "Format code, parse network data, convert units, and debug with 16 development utilities.",
    slug: "dev-toolkit",
    icon: "Wrench",
    toolCount: 16,
    color: "bg-indigo-500",
  },
};

export const featuredToolkits = Object.values(toolkits);
