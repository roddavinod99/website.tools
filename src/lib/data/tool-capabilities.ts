import type { ToolCapabilities } from "@/types";

let capabilitiesCache: ToolCapabilities[] | null = null;

export async function loadToolCapabilities(): Promise<ToolCapabilities[]> {
  if (capabilitiesCache) return capabilitiesCache;
  
  try {
    const mod = await import("./tool-capabilities.json");
    capabilitiesCache = mod.default as ToolCapabilities[];
    return capabilitiesCache;
  } catch {
    return [];
  }
}

export function getToolCapabilities(slug: string): ToolCapabilities | undefined {
  if (!capabilitiesCache) return undefined;
  return capabilitiesCache.find((c) => c.slug === slug);
}

export function getCapabilitiesByCategory(category: string): ToolCapabilities[] {
  if (!capabilitiesCache) return [];
  return capabilitiesCache.filter((c) => c.category === category);
}

export function getAllCapabilities(): ToolCapabilities[] {
  return capabilitiesCache ?? [];
}