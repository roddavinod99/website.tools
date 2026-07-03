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
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Blog", href: "/blog" },
      { label: "Best Practices", href: "/best-practices" },
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
      { label: "Sitemap", href: "/sitemap" },
      { label: "Contact", href: "/support" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Status", href: "/status" },
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
            <div className="flex gap-4 text-sm text-surface-500 dark:text-dark-muted">
              <Link href="/privacy" className="hover:text-surface-900 dark:hover:text-dark-text">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-surface-900 dark:hover:text-dark-text">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
