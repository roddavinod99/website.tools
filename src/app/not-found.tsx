import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-6xl font-bold text-surface-300 dark:text-dark-border">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-surface-900 dark:text-dark-text">Page Not Found</h2>
      <p className="mt-2 text-surface-500 dark:text-dark-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
