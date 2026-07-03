"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-6xl font-bold text-surface-300 dark:text-dark-border">Error</h1>
      <h2 className="mt-4 text-2xl font-semibold text-surface-900 dark:text-dark-text">
        Something went wrong
      </h2>
      <p className="mt-2 text-surface-500 dark:text-dark-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
