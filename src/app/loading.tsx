export default function Loading() {
  return (
    <div className="container py-20 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-brand-500 dark:border-dark-border dark:border-t-brand-400" />
      <p className="mt-4 text-sm text-surface-500 dark:text-dark-muted">Loading...</p>
    </div>
  );
}
