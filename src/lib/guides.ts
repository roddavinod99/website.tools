import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "./constants";

export async function getGuideContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "src/content/guides", `${slug}.md`);
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function getGuideUrl(slug: string): string {
  return `${siteConfig.url}/guides/${slug}`;
}