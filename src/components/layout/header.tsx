"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, Moon, Sun } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/constants";

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const handleSearchClick = () => {
    router.push("/search");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-200 bg-white/80 backdrop-blur-xl dark:border-dark-border dark:bg-dark-bg/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-surface-900 dark:text-dark-text"
          >
            <Image
              src="/logo.png"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-surface-600 transition-colors hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text rounded-md hover:bg-surface-100 dark:hover:bg-dark-surface"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSearchClick}
            aria-label="Search tools"
            className="hidden sm:flex items-center gap-2 h-9 w-48 rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-surface-400 transition-colors hover:border-surface-300 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
          >
            <Search className="h-4 w-4" />
            <span>Search tools...</span>
            <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded border border-surface-200 bg-white px-1.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"
            suppressHydrationWarning
          >
            <span className="hidden dark:inline" suppressHydrationWarning><Sun className="h-4 w-4" /></span>
            <span className="inline dark:hidden" suppressHydrationWarning><Moon className="h-4 w-4" /></span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-surface-200 dark:border-dark-border md:hidden">
          <nav className="container py-4 space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm text-surface-600 rounded-md hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"
              >
                {item.title}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 rounded-md hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
