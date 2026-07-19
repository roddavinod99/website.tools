import type { ReleaseManifest } from "@/lib/version/types";

interface VersionHistoryProps {
  releases: ReleaseManifest[];
  currentVersion: string;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function shortCommit(commit: string): string {
  return commit ? commit.slice(0, 7) : "0000000";
}

export function VersionHistory({ releases, currentVersion }: VersionHistoryProps) {
  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-surface-200 bg-white p-6 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
        No release history available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {releases.map((release) => {
        const isCurrent = release.version === currentVersion;
        return (
          <div
            key={`${release.version}-${release.buildNumber}`}
            className={`rounded-lg border p-4 ${
              isCurrent
                ? "border-brand-500 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/20"
                : "border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-surface-900 dark:text-dark-text">
                    v{release.version}
                  </span>
                  {isCurrent && (
                    <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-800 dark:text-brand-200">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-dark-muted">
                  Build {release.buildNumber} ·{" "}
                  <span className="font-mono">{shortCommit(release.gitCommit)}</span> ·{" "}
                  {formatDate(release.buildDate)}
                </p>
              </div>
              <span className="rounded bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600 dark:bg-dark-border dark:text-dark-muted">
                {release.environment}
              </span>
            </div>
            {release.features.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium text-surface-700 dark:text-dark-muted">Features</span>
                <ul className="mt-1 space-y-0.5">
                  {release.features.map((f, i) => (
                    <li key={i} className="text-xs text-surface-600 dark:text-dark-muted">+ {f}</li>
                  ))}
                </ul>
              </div>
            )}
            {release.fixes.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-surface-700 dark:text-dark-muted">Fixes</span>
                <ul className="mt-1 space-y-0.5">
                  {release.fixes.map((f, i) => (
                    <li key={i} className="text-xs text-surface-600 dark:text-dark-muted">* {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
