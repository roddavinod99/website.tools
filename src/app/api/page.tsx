import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "API",
  description: "DevStackIO API for developers.",
  alternates: { canonical: `${siteConfig.url}/api` },
};

export default function APIPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          API
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Integrate DevStackIO tools into your workflow
        </p>

        <div className="mt-8 space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            Our API allows you to programmatically access DevStackIO tools and
            integrate them into your applications, CI/CD pipelines, and workflows.
          </p>

          <Card>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
              Coming Soon
            </h2>
            <p className="mt-2 text-sm">
              The DevStackIO API is currently in development. Sign up for early access.
            </p>
            <div className="mt-4">
              <Button>Get Early Access</Button>
            </div>
          </Card>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Planned Endpoints
          </h2>
          <ul className="space-y-2">
            <li><code className="rounded bg-surface-100 px-2 py-0.5 text-sm dark:bg-dark-surface">/api/format/json</code> - JSON formatting</li>
            <li><code className="rounded bg-surface-100 px-2 py-0.5 text-sm dark:bg-dark-surface">/api/decode/jwt</code> - JWT decoding</li>
            <li><code className="rounded bg-surface-100 px-2 py-0.5 text-sm dark:bg-dark-surface">/api/generate/uuid</code> - UUID generation</li>
            <li><code className="rounded bg-surface-100 px-2 py-0.5 text-sm dark:bg-dark-surface">/api/convert/json-to-csv</code> - JSON to CSV conversion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
