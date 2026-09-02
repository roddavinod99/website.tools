import { ShieldCheck, EyeOff, Lock } from "lucide-react";

/**
 * Trust badges rendered above the tool on both /tools/<slug> pages
 * and the long-tail /convert/<category>/<slug> landing pages.
 *
 * Per AGENTS.md: these three badges sit at the moment of highest user
 * intent ("I'm about to paste my data"), and the wording is
 * "Your Data Stays Local" rather than absolute "No Tracking" because
 * consent-gated analytics/ads exist on the public surface.
 *
 * Static, server-renderable: no client state. The live network-request
 * count badge is a separate `NetworkTrustBadge` (client component)
 * composed by the tool page; landing pages don't need the live count
 * because the tool itself is the trust signal.
 */
export function TrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-surface-500 dark:text-dark-muted" +
        (className ? ` ${className}` : "")
      }
      role="list"
      aria-label="Tool guarantees"
    >
      <span className="inline-flex items-center gap-1.5" role="listitem">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
        100% Client-Side
      </span>
      <span className="inline-flex items-center gap-1.5" role="listitem">
        <EyeOff className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
        Your Data Stays Local
      </span>
      <span className="inline-flex items-center gap-1.5" role="listitem">
        <Lock className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" aria-hidden="true" />
        No Account Required
      </span>
    </div>
  );
}
