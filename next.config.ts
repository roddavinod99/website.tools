import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Collects the machine's current non-internal IPv4 addresses so the Next.js
 * dev server accepts connections from them without hardcoding a specific IP.
 * The LAN address is DHCP-assigned and can change, so it is discovered at
 * config load time (i.e. each `next dev` start) instead of being pinned.
 */
function getLanIpv4Addresses(): string[] {
  const addresses: string[] = [];
  const interfaces = networkInterfaces();
  for (const nets of Object.values(interfaces)) {
    for (const net of nets ?? []) {
      const family = String(net.family);
      if (family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", ...getLanIpv4Addresses()],

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "highlight.js"],
    // Enables app/global-not-found.tsx: 404-specific metadata for unmatched
    // URLs (plain not-found.js inherits root layout metadata instead).
    // Per https://nextjs.org/docs/app/api-reference/file-conventions/not-found
    globalNotFound: true,
  },

  async redirects() {
    return [
      {
        source: "/learning",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/learning/:slug",
        destination: "/guides/:slug",
        permanent: true,
      },
      {
        source: "/security.txt",
        destination: "/.well-known/security.txt",
        permanent: true,
      },
      // Legacy: PR 7 emitted wire/voltage-drop/* before fix to top-level voltage-drop.
      // Preserve ranking signals per https://developers.google.com/search/docs/crawling-indexing/site-moves-with-url-changes
      {
        source: "/convert/wire/voltage-drop/:slug*",
        destination: "/convert/voltage-drop/:slug*",
        permanent: true,
      },
    ];
  },

  headers: async () => [
    {
      source: "/api/version",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/health",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/submit",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/contact",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/ip-lookup",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/dns-lookup",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/visits",
      headers: [
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    // Note: Next.js automatically sets `Cache-Control: public, max-age=31536000, immutable`
    // for `/_next/static/*` immutable assets (SHA-hashed). Per https://nextjs.org/docs/app/api-reference/config/next-config-js/headers#cache-control
    // this cannot be overridden and a custom header breaks dev HMR ("Warning: Custom Cache-Control headers detected...").
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Pragma", value: "no-cache" },
        { key: "Expires", value: "0" },
      ],
    },
    {
      source: "/ads.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    {
      source: "/llms.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    {
      source: "/security.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    {
      source: "/.well-known/security.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    {
      source: "/.well-known/ai-plugin.json",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    {
      source: "/humans.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
    // IndexNow key file — per https://www.indexnow.org/documentation
    // Must be served as text/plain, no HTML wrapping, at /{key}.txt
    // Next.js serves public/{key}.txt automatically, but we set explicit
    // headers to ensure correct MIME and caching for the verification fetch.
    {
      source: "/:key([A-Za-z0-9-]{8,128}).txt",
      headers: [
        { key: "Content-Type", value: "text/plain; charset=utf-8" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);