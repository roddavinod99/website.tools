"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Moon, Sun, ExternalLink, HelpCircle, Command, ChevronDown, ChevronRight } from "lucide-react";
import { mainNav, siteConfig, categories, allTools } from "@/lib/data";
import { setStorageItem } from "@/lib/client-storage";
import { cn } from "@/lib/utils";
import { ShortcutsModal, shortcutCategories } from "@/components/layout/shortcuts-modal";

const SearchOverlay = lazy(() => import("./search-overlay").then((m) => ({ default: m.SearchOverlay })));

// Text-based logo component
function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { font: "text-lg", badge: "text-xs px-1.5 py-0.5" },
    md: { font: "text-xl", badge: "text-xs px-2 py-0.5" },
    lg: { font: "text-2xl", badge: "text-sm px-2.5 py-0.5" },
  };
  const s = sizes[size];
  return (
    <span className={`flex items-center gap-1 font-bold ${s.font} text-surface-900 dark:text-dark-text`}>
      <span className="text-brand-600 dark:text-brand-400">DevStack</span>
      <span className="text-neutral-900 dark:text-neutral-100">IO</span>
      <span className={`ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400`}>
        Tools
      </span>
    </span>
  );
}

const NAV_SHORTCUTS: Record<string, string> = {
  "1": "/tools",
  "2": "/categories",
  "3": "/guides",
  "4": "/blog",
};

function CategoryMenu({ allTools }: { allTools: import("@/types").Tool[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
          menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get categories with tool counts
  const catsWithCounts = categories.map((c) => ({
    ...c,
    toolCount: allTools.filter((t) => t.category === c.name).length,
  })).filter((c) => c.toolCount > 0);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Browse categories"
        className="hidden md:flex items-center gap-1.5 h-10 px-3 py-2 text-sm text-surface-600 transition-colors hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text rounded-md touch-target"
      >
        <span>Categories</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-72 rounded-xl border border-surface-200 bg-white py-2 shadow-lg dark:border-dark-border dark:bg-dark-surface animate-fade-in-up z-dropdown"
          role="menu"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
            {catsWithCounts.length} Categories
          </div>
          <nav className="max-h-96 overflow-y-auto" aria-label="Tool categories">
            {catsWithCounts.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-dark-muted dark:hover:bg-dark-bg dark:hover:text-dark-text transition-colors"
                role="menuitem"
              >
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  {cat.toolCount}
                </span>
                <span className="flex-1 truncate font-medium">{cat.name}</span>
                <ChevronRight className="h-4 w-4 text-surface-400" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="border-t border-surface-200 dark:border-dark-border mt-2 pt-2">
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              role="menuitem"
            >
              <span>View all categories</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setStorageItem("theme", isDark ? "dark" : "light");
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-surface-200 bg-white dark:border-dark-border dark:bg-dark-bg transition-all duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-surface-900 dark:text-dark-text shrink-0"
            aria-label="DevStack IO Tools"
          >
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {mainNav.map((item) => {
              const isTools = item.href === "/tools";
              const hasNew = isTools && allTools.some((t) => t.new === true);
              const hasTrending = isTools && allTools.some((t) => t.trending === true);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-10 items-center gap-1.5 px-3 text-sm text-surface-600 transition-colors hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text rounded-md touch-target"
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
            <CategoryMenu allTools={allTools} />
            <div className="mx-2 h-5 w-px bg-surface-300 dark:bg-dark-border" aria-hidden="true" />
            <a
              href={siteConfig.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm text-surface-500 transition-colors hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text rounded-md touch-target"
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
            aria-label="Search tools..."
            className="flex sm:hidden h-10 w-10 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Desktop search bar - hidden on mobile */}
          <button
            onClick={handleSearchClick}
            aria-label="Search tools..."
            className="hidden sm:flex items-center gap-2 h-10 flex-1 max-w-md sm:max-w-lg rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-surface-400 transition-colors hover:border-surface-300 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search tools...</span>
            <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded border border-surface-200 bg-white px-1.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg" aria-hidden="true">
              <Command className="h-3 w-3" aria-hidden="true" />
              K
            </kbd>
            <kbd className="ml-1 hidden lg:inline-flex h-5 items-center rounded border border-surface-200 bg-white px-1.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg" aria-hidden="true">
              /
            </kbd>
          </button>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
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
              className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </button>

            {showShortcuts && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[90vw] rounded-xl border border-surface-200 bg-white p-4 shadow-lg dark:border-dark-border dark:bg-dark-surface animate-fade-in-down">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-dark-text">Keyboard Shortcuts</h3>
                  <span className="text-xs text-surface-400 dark:text-dark-muted">Hover to keep open</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto">
                  {shortcutCategories.map((category, catIndex) => (
                    <section key={catIndex} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">{category.title}</h4>
                      <dl className="grid grid-cols-[auto_1fr] gap-1.5 gap-y-2">
                        {category.shortcuts.map((shortcut, idx) => (
                          <div key={idx} className="contents">
                            <dt className="flex items-center gap-2 text-xs text-surface-600 dark:text-dark-muted">
                              <kbd className="flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
                                {shortcut.key}
                              </kbd>
                            </dt>
                            <dd className="text-xs text-surface-700 dark:text-dark-text self-center">{shortcut.description}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                  <div className="pt-2 border-t border-surface-200 dark:border-dark-border">
                    <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
                      <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
                        <Command className="h-3 w-3" /> K
                      </kbd>{" "}
                      to search tools anywhere.{" "}
                      <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
                        ?
                      </kbd>{" "}
                      to reopen this help.
                    </p>
                    <p className="mt-1 text-[10px] text-surface-400 dark:text-dark-muted text-center">
                      <strong>Mac:</strong> <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono text-[10px] text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">⌘</kbd> Command | <strong>Windows:</strong> <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono text-[10px] text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">Ctrl</kbd> Control
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-surface-200 dark:border-dark-border md:hidden animate-slide-down">
          <nav className="container py-4 space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm text-surface-600 rounded-md hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-sm text-surface-600 rounded-md hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface touch-target"
            >
              Categories
            </Link>
            <div className="pt-2 space-y-1">
              <button
                onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-2 px-3 py-3 text-sm text-surface-600 rounded-md hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface w-full text-left touch-target"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <a
                href={siteConfig.mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-3 text-sm text-surface-500 rounded-md hover:bg-surface-200 dark:text-dark-muted dark:hover:bg-dark-surface w-full touch-target"
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