import type { Metadata } from "next";
import Link from "next/link";
import "../styles/globals.css";

// Global 404 for unmatched URLs. Per https://nextjs.org/docs/app/api-reference/file-conventions/not-found,
// global-not-found.js "must return a full HTML document" and supports a
// `metadata` export, while plain not-found.js inherits the root layout
// metadata (which wrongly gave 404s the homepage canonical/title).
// Next.js automatically injects `<meta name="robots" content="noindex" />`
// for 404 responses, so no robots directive is needed here. Kept
// dependency-light (no layout providers) per the docs' performance note.
export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you are looking for does not exist or has been moved. Find free online developer tools on DevStackIO.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] px-6 py-16 text-center">
        <p className="text-7xl font-bold">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Page Not Found</h1>
        <p className="mt-2 max-w-md opacity-70">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let us help you find what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/search"
            className="rounded-md bg-brand-500 px-6 py-3 text-sm font-medium text-[var(--color-bg)]"
          >
            Search Tools
          </Link>
          <Link
            href="/"
            className="rounded-md border px-6 py-3 text-sm font-medium"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
}
