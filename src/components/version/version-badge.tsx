"use client";

import {
  RELEASE_VERSION,
  RELEASE_BUILD_NUMBER,
  RELEASE_GIT_SHORT_HASH,
  RELEASE_ENVIRONMENT,
} from "@/lib/version/__generated__/release-data";

interface VersionBadgeProps {
  compact?: boolean;
  showBuild?: boolean;
  showEnv?: boolean;
  showCommit?: boolean;
}

const envColors: Record<string, string> = {
  production: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  staging: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  development: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

export function VersionBadge({
  compact = false,
  showBuild = true,
  showEnv = true,
  showCommit = true,
}: VersionBadgeProps) {
  const envColor = envColors[RELEASE_ENVIRONMENT] || envColors.development;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600 dark:bg-dark-border dark:text-dark-muted">
        <span>v{RELEASE_VERSION}</span>
        {showBuild && <span>({RELEASE_BUILD_NUMBER})</span>}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs dark:border-dark-border dark:bg-dark-surface">
      <span className="font-semibold text-surface-900 dark:text-dark-text">
        v{RELEASE_VERSION}
      </span>
      {showBuild && (
        <span className="text-surface-500 dark:text-dark-muted">
          build {RELEASE_BUILD_NUMBER}
        </span>
      )}
      {showCommit && (
        <span className="font-mono text-surface-400 dark:text-dark-muted">
          {RELEASE_GIT_SHORT_HASH}
        </span>
      )}
      {showEnv && (
        <span className={`rounded px-1.5 py-0.5 font-medium ${envColor}`}>
          {RELEASE_ENVIRONMENT}
        </span>
      )}
    </div>
  );
}
