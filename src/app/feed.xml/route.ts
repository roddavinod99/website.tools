import { siteConfig } from "@/lib/constants";
import { blogPosts } from "@/lib/blog";

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = new Date().toUTCString();
  const siteUrl = siteConfig.url;

  const items = blogPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${xmlEscape(siteUrl)}/blog/${xmlEscape(post.slug)}</link>
      <guid isPermaLink="true">${xmlEscape(siteUrl)}/blog/${xmlEscape(post.slug)}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.dateISO).toUTCString()}</pubDate>
      <dc:creator><![CDATA[DevStackIO]]></dc:creator>
      <category>Developer Tools</category>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title><![CDATA[${xmlEscape(siteConfig.name)} Blog]]></title>
    <link>${xmlEscape(siteUrl)}/blog</link>
    <description><![CDATA[${siteConfig.description}]]></description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <atom:link href="${xmlEscape(siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
