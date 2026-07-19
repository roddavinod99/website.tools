"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Command } from "lucide-react";

interface ShortcutItem {
  key: string;
  description: string;
  keys?: string[];
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutCategories: { title: string; shortcuts: ShortcutItem[] }[] = [
  {
    title: "Global",
    shortcuts: [
      { key: "⌘K", description: "Open search" },
      { key: "?", description: "Show shortcuts help" },
      { key: "Esc", description: "Close modal / search" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { key: "⌘1", description: "Go to Tools" },
      { key: "⌘2", description: "Go to Categories" },
      { key: "⌘3", description: "Go to Guides" },
      { key: "⌘4", description: "Go to Blog" },
    ],
  },
  {
    title: "Tool Pages",
    shortcuts: [
      { key: "⌘Enter", description: "Run / Format (in tools)" },
      { key: "⌘Shift+C", description: "Copy output" },
      { key: "⌘Shift+M", description: "Minify (formatters)" },
      { key: "⌘Shift+V", description: "Validate (formatters)" },
      { key: "⌘↑/↓", description: "Navigate search results" },
    ],
  },
  {
    title: "Table of Contents",
    shortcuts: [
      { key: "Click", description: "Jump to section" },
      { key: "Mobile: tap 📋", description: "Open TOC drawer" },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      contentRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-dark-surface animate-slide-up"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-200 p-4 dark:border-dark-border">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-surface-900 dark:text-dark-text">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-bg dark:hover:text-dark-text transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {shortcutCategories.map((category, catIndex) => (
            <section key={catIndex} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                {category.title}
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-2 gap-y-3">
                {category.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="contents">
                    <dt className="flex items-center gap-2 text-sm text-surface-600 dark:text-dark-muted">
                      <kbd className={cn(
                        "flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-2 py-1 font-mono text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text",
                        shortcut.keys && shortcut.keys.length > 1 && "flex-col"
                      )}>
                        {shortcut.keys && shortcut.keys.length > 1 ? (
                          shortcut.keys.map((k, kIdx) => (
                            <span key={kIdx}>{k}</span>
                          ))
                        ) : (
                          <span>{shortcut.key}</span>
                        )}
                      </kbd>
                    </dt>
                    <dd className="text-sm text-surface-700 dark:text-dark-text self-center">
                      {shortcut.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          <div className="pt-4 border-t border-surface-200 dark:border-dark-border">
            <p className="text-xs text-surface-400 dark:text-dark-muted text-center">
              <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-xs text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
                <Command className="h-3 w-3" /> K
              </kbd>{" "}
              to search tools anywhere.{" "}
              <kbd className="inline-flex items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-xs text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
                ?
              </kbd>{" "}
              to reopen this help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}