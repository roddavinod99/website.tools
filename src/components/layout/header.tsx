"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Moon, Sun, ExternalLink, HelpCircle, Command } from "lucide-react";
import { mainNav, siteConfig, allTools } from "@/lib/data";
import { setStorageItem } from "@/lib/client-storage";
import { cn } from "@/lib/utils";
import { Logomark, Wordmark } from "@/components/ui/logomark";
import { Badge } from "@/components/ui/badge";
import { ShortcutsModal, shortcutCategories } from "@/components/layout/shortcuts-modal";
import { CategoriesMegaMenu } from "./categories-mega-menu";

const SearchOverlay = lazy(() => import("./search-overlay").then((m) => ({ default: m.SearchOverlay })));

const NAV_SHORTCUTS: Record<string, string> = {
  "1": "/tools",
  "2": "/categories",
  "3": "/guides",
  "4": "/blog",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("contenteditable") === "true";
      if (e.key === "/" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && NAV_SHORTCUTS[e.key] && !isTyping) {
        e.preventDefault();
        router.push(NAV_SHORTCUTS[e.key]);
        return;
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!isTyping) {
          e.preventDefault();
          setShortcutsOpen(true);
        }
      }
      if (e.key === "Escape") {
        setShortcutsOpen(false);
        setSearchOpen(false);
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Mobile sheet a11y: move focus inside on open, return it on close.
  // The ref guard skips the initial mount so page load never steals focus.
  const wasMobileOpen = useRef(false);
  useEffect(() => {
    if (isOpen) {
      wasMobileOpen.current = true;
      mobilePanelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    } else if (wasMobileOpen.current) {
      wasMobileOpen.current = false;
      mobileToggleRef.current?.focus();
    }
  }, [isOpen]);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setStorageItem("theme", isDark ? "dark" : "light");
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-[var(--color-bg)]/80 backdrop-blur transition-colors ${
        scrolled ? "border-[var(--color-border-strong)]" : "border-transparent"
      }`}
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="DevStackIO Tools Home"
          >
            <Logomark size="sm" />
            <Wordmark className="text-lg" />
            <Badge>Tools</Badge>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {mainNav.map((item) => {
              const isTools = item.href === "/tools";
              const hasNew = isTools && allTools.some((t) => t.new === true);
              const hasTrending = isTools && allTools.some((t) => t.trending === true);
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-1.5 px-3 text-sm transition-colors rounded-md touch-target",
                    isActive
                      ? "text-[var(--color-text)] border-b-2 border-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                  )}
                >
                  {item.title}
                  {isTools && (hasNew || hasTrending) && (
                    <span className="flex items-center gap-1">
                      {hasNew && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">New</span>}
                      {hasTrending && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Trending</span>}
                    </span>
                  )}
                </Link>
              );
            })}
            <CategoriesMegaMenu />
            <div className="mx-2 h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />
            <a
              href={siteConfig.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] rounded-md touch-target"
            >
              DevStackIO Home
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search button - visible only on mobile */}
          <button
            onClick={handleSearchClick}
            aria-label="Search tools (open search)"
            className="flex sm:hidden h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Desktop search bar - hidden on mobile */}
          <button
            onClick={handleSearchClick}
            aria-label="Search tools (Ctrl+K)"
            className="hidden sm:flex items-center gap-2 h-10 flex-1 max-w-md sm:max-w-lg rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-strong)]"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search tools...</span>
            <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 text-xs text-[var(--color-text-muted)]" aria-hidden="true">
              <Command className="h-3 w-3" aria-hidden="true" />
              K
            </kbd>
            <kbd className="ml-1 hidden lg:inline-flex h-5 items-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 text-xs text-[var(--color-text-muted)]" aria-hidden="true">
              /
            </kbd>
          </button>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
            suppressHydrationWarning
          >
            <span className="hidden dark:inline" suppressHydrationWarning><Sun className="h-5 w-5" aria-hidden="true" /></span>
            <span className="inline dark:hidden" suppressHydrationWarning><Moon className="h-5 w-5" aria-hidden="true" /></span>
          </button>
          {/* Keyboard Shortcuts Hover Tooltip */}
          <div className="relative" onMouseEnter={() => setShowShortcuts(true)} onMouseLeave={() => setShowShortcuts(false)}>
            <button
              onClick={() => setShortcutsOpen(true)}
              aria-label="Keyboard shortcuts (?)"
              aria-expanded={showShortcuts}
              className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </button>

            {showShortcuts && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[90vw] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm animate-fade-in-down">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Keyboard Shortcuts</h3>
                  <span className="text-xs text-[var(--color-text-muted)]">Hover to keep open</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto">
                  {shortcutCategories.map((category, catIndex) => (
                    <section key={catIndex} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{category.title}</h4>
                      <dl className="grid grid-cols-[auto_1fr] gap-1.5 gap-y-2">
                        {category.shortcuts.map((shortcut, idx) => (
                          <div key={idx} className="contents">
                            <dt className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                              <kbd className="flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-text)]">
                                {shortcut.key}
                              </kbd>
                            </dt>
                            <dd className="text-xs text-[var(--color-text)] self-center">{shortcut.description}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                      <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                        <Command className="h-3 w-3" /> K
                      </kbd>{" "}
                      to search tools anywhere.{" "}
                      <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                        ?
                      </kbd>{" "}
                      to reopen this help.
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--color-text-muted)] text-center">
                      <strong>Mac:</strong> <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">⌘</kbd> Command | <strong>Windows:</strong> <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">Ctrl</kbd> Control
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            ref={mobileToggleRef}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div
          ref={mobilePanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="border-t border-[var(--color-border)] bg-[var(--color-bg)] md:hidden animate-slide-down"
        >
          <nav className="container py-4 space-y-1" aria-label="Mobile">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm text-[var(--color-text-muted)] rounded-md hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-sm text-[var(--color-text-muted)] rounded-md hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] touch-target"
            >
              Categories
            </Link>
            <div className="pt-2 space-y-1">
              <button
                onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-2 px-3 py-3 text-sm text-[var(--color-text-muted)] rounded-md hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] w-full text-left touch-target"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <a
                href={siteConfig.mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-3 text-sm text-[var(--color-text-muted)] rounded-md hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] w-full touch-target"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                DevStackIO Home
              </a>
            </div>
          </nav>
        </div>
      )}

      <Suspense fallback={null}>
        <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </Suspense>

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </header>
  );
}