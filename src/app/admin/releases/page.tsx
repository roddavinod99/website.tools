import type { Metadata } from "next";
import { VersionBadge } from "@/components/version/version-badge";
import { VersionHistory } from "@/components/version/version-history";
import { listReleaseArchives, readReleaseManifest } from "@/lib/version/release";
import { RELEASE_VERSION } from "@/lib/version/__generated__/release-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Release History",
  robots: { index: false, follow: false },
};

export default function ReleasesPage() {
  const current = readReleaseManifest();
  const archives = listReleaseArchives();

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
              Release History
            </h1>
            <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
              Version history and deployment records
            </p>
          </div>
          <VersionBadge />
        </div>

        {current && (
          <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              Current Release
            </p>
            <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
              Version {current.version} (build {current.buildNumber}) — deployed{" "}
              {new Date(current.buildDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        <div className="mt-8">
          <VersionHistory releases={archives} currentVersion={RELEASE_VERSION} />
        </div>
      </div>
    </div>
  );
}
