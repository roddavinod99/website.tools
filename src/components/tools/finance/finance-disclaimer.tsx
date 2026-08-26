import { CircleAlert } from "lucide-react";

export function FinanceDisclaimer() {
  return (
    <section aria-label="Financial disclaimer" className="border-b border-surface-200 dark:border-dark-border">
      <div className="container py-6 md:py-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold">Not financial advice</p>
              <p className="mt-1 leading-relaxed">
                The results from this calculator are provided for general informational and educational purposes
                only. They are estimates based on the assumptions you enter and do not constitute financial,
                tax, legal, or investment advice, nor a recommendation to buy, sell, or hold any financial product.
                Tax codes, rates, and regulations change frequently and vary by country, state, and local
                jurisdiction — and may differ based on your individual circumstances, employer plan rules, and
                provider policies. Always verify the figures with current official sources and consult a qualified
                financial, tax, or legal professional before making any financial decision. All calculations run
                privately in your browser; nothing you enter is sent to our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}