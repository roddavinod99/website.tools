import type { Tool } from "@/types";
import toolCapabilitiesJson from "@/lib/data/tool-capabilities.json";
import type { ToolCapabilities } from "@/types";

export const CAPABILITY_FILTERS: ReadonlyArray<{ key: keyof ToolCapabilities["capabilities"]; label: string }> = [
  { key: "worker", label: "Web Worker" },
  { key: "wasm", label: "WASM" },
  { key: "realTime", label: "Real-time" },
  { key: "copy", label: "Copy" },
  { key: "download", label: "Download" },
  { key: "validation", label: "Validation" },
  { key: "fileUpload", label: "File Upload" },
  { key: "dragDrop", label: "Drag & Drop" },
  { key: "multipleInputs", label: "Multi-input" },
  { key: "comparison", label: "Comparison" },
  { key: "syntaxHighlighting", label: "Syntax Highlight" },
  { key: "tabs", label: "Tabs" },
];

type CapabilityKey = (typeof CAPABILITY_FILTERS)[number]["key"];
const VALID_KEYS: ReadonlySet<CapabilityKey> = new Set(CAPABILITY_FILTERS.map((f) => f.key));

function parseCapabilityParam(value: string | string[] | undefined): CapabilityKey[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  const tokens = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return tokens.filter((t): t is CapabilityKey => VALID_KEYS.has(t as CapabilityKey));
}

export function filterToolsByCapabilities(
  tools: Tool[],
  param: string | string[] | undefined,
): Tool[] {
  const selected = parseCapabilityParam(param);
  if (selected.length === 0) return tools;

  const capabilities = toolCapabilitiesJson as ToolCapabilities[];
  const bySlug = new Map(capabilities.map((c) => [c.slug, c.capabilities]));
  return tools.filter((tool) => {
    const caps = bySlug.get(tool.slug);
    if (!caps) return false;
    return selected.every((key) => caps[key] === true);
  });
}
