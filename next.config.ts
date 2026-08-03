import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Report-Only CSP - won't block, only reports violations
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://tpc.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.google.com https://www.google.co.in https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.gstatic.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://www.gstatic.com https://ep1.adtrafficquality.google",
  "font-src 'self'",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

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
    cssChunking: "strict",
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
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        { key: "Link", value: "</llms.txt>; rel=alternate; type=text/plain; title=AI Guide" },
      ],
    },
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
  ],
};

export default withBundleAnalyzer(nextConfig);
