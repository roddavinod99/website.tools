import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "highlight.js"],
  },

  async redirects() {
    return [
      {
        source: "/learning/:slug",
        destination: "/guides/:slug",
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
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/_next/static/:path(.+\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|otf))",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
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
      source: "/humans.txt",
      headers: [
        { key: "Content-Type", value: "text/plain" },
        { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);