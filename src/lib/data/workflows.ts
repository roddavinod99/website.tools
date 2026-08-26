export interface WorkflowStep {
  toolSlug: string;
  label: string;
  description: string;
  passOutputTo?: string;
}

export interface Workflow {
  slug: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  category: string;
}

export const workflows: Workflow[] = [
  {
    slug: "api-debugging",
    title: "API Debugging Workflow",
    description: "Decode JWT, inspect headers, format JSON, and decode Base64 in a single flow.",
    category: "Developer",
    steps: [
      { toolSlug: "jwt-decoder", label: "Decode JWT", description: "Paste a JWT to inspect header, payload, and signature." },
      { toolSlug: "http-header-parser", label: "Parse HTTP Headers", description: "Analyze request/response headers for debugging." },
      { toolSlug: "json-formatter", label: "Format JSON", description: "Beautify and validate JSON payloads." },
      { toolSlug: "base64", label: "Decode Base64", description: "Decode Base64 strings that may be embedded in tokens." },
    ],
  },
  {
    slug: "frontend-dev",
    title: "Frontend Development Workflow",
    description: "Format CSS, minify JS, convert colors, and optimize images.",
    category: "Developer",
    steps: [
      { toolSlug: "css-formatter", label: "Format CSS", description: "Beautify and validate CSS." },
      { toolSlug: "js-minifier", label: "Minify JavaScript", description: "Minify JS for production." },
      { toolSlug: "color-converter", label: "Convert Colors", description: "Convert between HEX, RGB, HSL, etc." },
      { toolSlug: "image-compressor", label: "Compress Images", description: "Reduce image size without quality loss." },
    ],
  },
  {
    slug: "security-audit",
    title: "Security Audit Workflow",
    description: "Generate CSP, decode SSL cert, hash data, and decode JWT.",
    category: "Security",
    steps: [
      { toolSlug: "csp-generator", label: "Generate CSP", description: "Create a Content Security Policy header." },
      { toolSlug: "ssl-decoder", label: "Decode SSL Certificate", description: "Inspect certificate details." },
      { toolSlug: "hash-generator", label: "Generate Hash", description: "Create MD5, SHA-256, etc." },
      { toolSlug: "jwt-decoder", label: "Decode JWT", description: "Inspect token claims." },
    ],
  },
  {
    slug: "data-conversion",
    title: "Data Conversion Workflow",
    description: "Convert between JSON, CSV, YAML, and format SQL.",
    category: "Data",
    steps: [
      { toolSlug: "json-to-csv", label: "JSON to CSV", description: "Convert JSON arrays to CSV." },
      { toolSlug: "csv-to-json", label: "CSV to JSON", description: "Parse CSV into JSON." },
      { toolSlug: "json-to-yaml", label: "JSON to YAML", description: "Transform JSON to YAML." },
      { toolSlug: "sql-formatter", label: "Format SQL", description: "Beautify SQL queries." },
    ],
  },
  {
    slug: "finance-planning",
    title: "Finance Planning Workflow",
    description: "Calculate SIP, compound interest, savings goal, and tax.",
    category: "Finance",
    steps: [
      { toolSlug: "sip-calculator", label: "SIP Calculator", description: "Project mutual fund SIP returns." },
      { toolSlug: "compound-interest-calculator", label: "Compound Interest", description: "Calculate compound growth." },
      { toolSlug: "savings-goal-calculator", label: "Savings Goal", description: "Plan monthly savings to reach a target." },
      { toolSlug: "income-tax-calculator", label: "Income Tax", description: "Estimate tax liability." },
    ],
  },
];