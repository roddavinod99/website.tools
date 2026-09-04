import Link from "next/link";
import { ExternalLink, ShieldCheck, EyeOff, Lock } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { Logomark, Wordmark } from "@/components/ui/logomark";
import { Badge } from "@/components/ui/badge";
import { VisitCounter } from "@/components/layout/visit-counter";

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
      { label: "Compare", href: "/compare" },
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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]" role="contentinfo">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="DevStackIO Tools Home">
              <Logomark size="sm" />
              <Wordmark className="text-lg" />
              <Badge>Tools</Badge>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">
              Free online developer tools from DevStackIO. Everything runs in your browser — nothing is uploaded to any server.
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-muted)] max-w-xs">
              DevStackIO Tools is part of the{" "}
              <a
                href={siteConfig.mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-2"
              >
                DevStackIO
              </a>{" "}
              developer platform.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={siteConfig.mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                DevStackIO Home
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-[var(--color-border)]">|</span>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <VisitCounter />
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[var(--color-border)] pt-8">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { icon: ShieldCheck, label: "100% Client-Side", href: "/security" },
              { icon: EyeOff, label: "Your Data Stays Local", href: "/privacy" },
              { icon: Lock, label: "No Account Required", href: "/" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
              >
                <Icon className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />
            <Link href="/security" className="text-xs text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]">
              Security
            </Link>
            <Link href="/accessibility" className="text-xs text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]">
              Accessibility
            </Link>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-text-muted)]">
              <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">
                Terms
              </Link>
              <Link href="/cookie-policy" className="hover:text-[var(--color-text)] transition-colors">
                Cookies
              </Link>
              <Link href="/disclaimer" className="hover:text-[var(--color-text)] transition-colors">
                Disclaimer
              </Link>
              <Link href="/about" className="hover:text-[var(--color-text)] transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-[var(--color-text)] transition-colors">
                Contact
              </Link>
              <Link href="/sitemap" className="hover:text-[var(--color-text)] transition-colors">
                Sitemap
              </Link>
              <a href="/feed.xml" className="hover:text-[var(--color-text)] transition-colors">
                RSS
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
