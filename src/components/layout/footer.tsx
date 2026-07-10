import Link from "next/link";
import { siteConfig } from "@/lib/constants";

const footerLinks = [
  {
    title: "Tools",
    links: [
      { label: "All Tools", href: "/tools" },
      { label: "Categories", href: "/categories" },
      { label: "Popular", href: "/popular" },
      { label: "Recently Added", href: "/new" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Blog", href: "/blog" },
      { label: "Best Practices", href: "/best-practices" },
      { label: "RSS Feed", href: "/feed.xml" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Changelog", href: "/changelog" },
      { label: "API", href: "/api" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-surface-900 dark:text-dark-text">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
                D
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 text-sm text-surface-500 dark:text-dark-muted max-w-xs">
              The internet&apos;s best collection of free online tools for developers.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-400 hover:text-surface-600 dark:hover:text-dark-text transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-dark-text">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-500 transition-colors hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-surface-200 pt-6 dark:border-dark-border">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-surface-500 dark:text-dark-muted">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-surface-500 dark:text-dark-muted">
              <Link href="/privacy" className="hover:text-surface-900 dark:hover:text-dark-text">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-surface-900 dark:hover:text-dark-text">
                Terms
              </Link>
              <Link href="/cookie-policy" className="hover:text-surface-900 dark:hover:text-dark-text">
                Cookies
              </Link>
              <Link href="/disclaimer" className="hover:text-surface-900 dark:hover:text-dark-text">
                Disclaimer
              </Link>
              <Link href="/about" className="hover:text-surface-900 dark:hover:text-dark-text">
                About
              </Link>
              <Link href="/contact" className="hover:text-surface-900 dark:hover:text-dark-text">
                Contact
              </Link>
              <Link href="/sitemap" className="hover:text-surface-900 dark:hover:text-dark-text">
                Sitemap
              </Link>
              <a href="/feed.xml" className="hover:text-surface-900 dark:hover:text-dark-text">
                RSS
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
