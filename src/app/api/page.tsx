import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "API",
  description: "Public developer API endpoints from DevStackIO for DNS lookup, IP lookup, versioning, and health checks.",
  alternates: { canonical: `${siteConfig.url}/api` },
};

const endpoints = [
  {
    method: "GET",
    path: "/api/dns-lookup",
    description: "Resolve A, AAAA, MX, NS, TXT, and CNAME records for a domain. Rate-limited and SSRF-protected.",
    query: "?domain=example.com",
  },
  {
    method: "GET",
    path: "/api/ip-lookup",
    description: "Return geolocation, ISP, ASN, and network details for an IPv4 or IPv6 address.",
    query: "?ip=8.8.8.8",
  },
  {
    method: "GET",
    path: "/api/version",
    description: "Return the current deployed version and latest release metadata.",
    query: "",
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Lightweight health probe for uptime monitoring.",
    query: "",
  },
];

export default function APIPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          API
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Small, privacy-safe public endpoints used by our tools
        </p>

        <div className="mt-8 space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            These endpoints power several tools on this site and are available for
            public use. Each one is rate-limited, validates input, and never logs
            user content. No authentication is required.
          </p>

          <div className="space-y-4">
            {endpoints.map((ep) => (
              <Card key={ep.path}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        {ep.method}
                      </span>
                      <code className="rounded bg-surface-100 px-2 py-0.5 font-mono text-sm dark:bg-dark-surface">
                        {ep.path}
                      </code>
                    </div>
                    <p className="mt-2 text-sm">{ep.description}</p>
                    {ep.query && (
                      <code className="mt-2 inline-block rounded bg-surface-100 px-2 py-0.5 font-mono text-xs dark:bg-dark-surface">
                        {ep.query}
                      </code>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-sm text-surface-400 dark:text-dark-muted">
            More endpoints for formatting and conversion are planned. The core
            tools themselves run entirely in your browser and do not require an API.
          </p>
        </div>
      </div>
    </div>
  );
}
