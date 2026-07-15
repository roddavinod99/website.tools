export default function ToolLoading() {
  return (
    <>
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-16 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
            <div className="h-4 w-4" />
            <div className="h-4 w-12 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
            <div className="h-4 w-4" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-200 dark:bg-dark-border" />
            <div className="mt-4 h-10 w-72 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
            <div className="mt-2 h-5 w-96 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />

            <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
                <div className="h-32 w-full animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
                <div className="flex gap-3">
                  <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-200 dark:bg-dark-border" />
                  <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-200 dark:bg-dark-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="h-8 w-24 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-surface-200 dark:bg-dark-border" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
