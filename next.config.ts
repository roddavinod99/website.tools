import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  reactStrictMode: true,

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'" },
        { key: "Link", value: "</llms.txt>; rel=alternate; type=text/plain; title=AI Guide" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/:path(.+\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2))",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
