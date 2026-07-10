import type { ToolContent } from "@/types";

export async function getToolContent(slug: string): Promise<ToolContent | null> {
  try {
    const mod = await import(`@/content/tools/${slug}.json`);
    return mod.default as ToolContent;
  } catch {
    return null;
  }
}
