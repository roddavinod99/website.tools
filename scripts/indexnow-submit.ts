/**
 * IndexNow URL Submission Script
 * 
 * This script submits URLs to IndexNow (Bing, Yandex, etc.) for faster indexing.
 * 
 * SETUP:
 * 1. Get an IndexNow API key from https://www.indexnow.org/
 * 2. Save the key as INDEX_NOW_KEY environment variable
 * 3. The key file should be hosted at https://tools.devstackio.com/<key>.txt
 * 
 * USAGE:
 * npx tsx scripts/indexnow-submit.ts
 * 
 * For automated deployment, add to GitHub Actions workflow:
 * - name: Submit to IndexNow
 *   run: npx tsx scripts/indexnow-submit.ts
 *   env:
 *     INDEX_NOW_KEY: ${{ secrets.INDEX_NOW_KEY }}
 */

import { fetch } from "undici";

const SITE_URL = "https://tools.devstackio.com";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const KEY_FILE_NAME = "indexnow-key.txt"; // Replace with your actual key filename

async function fetchSitemapUrls(): Promise<string[]> {
  try {
    const response = await fetch(SITEMAP_URL);
    const xml = await response.text();
    
    // Extract URLs from sitemap XML
    const urls = xml
      .split("<url>")
      .slice(1)
      .map((chunk) => {
        const match = chunk.match(/<loc>(.*?)<\/loc>/);
        return match ? match[1] : null;
      })
      .filter((url): url is string => url !== null);
    
    return urls;
  } catch (error) {
    console.error("Failed to fetch sitemap:", error);
    return [];
  }
}

async function submitToIndexNow(urls: string[], key: string): Promise<void> {
  const endpoint = "https://api.indexnow.org/indexnow";
  
  const payload = {
    host: "tools.devstackio.com",
    key: key,
    keyLocation: `${SITE_URL}/${KEY_FILE_NAME}`,
    urlList: urls,
  };
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ IndexNow submission successful:", result);
    } else {
      const error = await response.text();
      console.error("❌ IndexNow submission failed:", response.status, error);
    }
  } catch (error) {
    console.error("❌ IndexNow submission error:", error);
  }
}

async function main() {
  console.log("🚀 Starting IndexNow URL submission...");
  
  // Check for API key
  const key = process.env.INDEX_NOW_KEY;
  if (!key) {
    console.error("❌ INDEX_NOW_KEY environment variable not set");
    console.log("📝 Get your key from https://www.indexnow.org/");
    console.log("📝 Add to GitHub Secrets as INDEX_NOW_KEY");
    console.log("📝 Host key file at https://tools.devstackio.com/" + KEY_FILE_NAME);
    process.exit(1);
  }
  
  // Fetch URLs from sitemap
  const urls = await fetchSitemapUrls();
  if (urls.length === 0) {
    console.error("❌ No URLs found in sitemap");
    process.exit(1);
  }
  
  console.log(`📋 Found ${urls.length} URLs in sitemap`);
  
  // IndexNow allows up to 10,000 URLs per request, but we'll batch for safety
  const BATCH_SIZE = 5000;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`📤 Submitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);
    await submitToIndexNow(batch, key);
    
    // Rate limiting: wait between batches
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  console.log("✅ IndexNow submission complete!");
}

main().catch(console.error);