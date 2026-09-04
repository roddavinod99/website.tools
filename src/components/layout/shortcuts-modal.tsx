"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { X, Command } from "lucide-react";

export interface ShortcutItem {
  key: string;
  description: string;
  keys?: string[];
}

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const shortcutCategories: { title: string; shortcuts: ShortcutItem[] }[] = [
  {
    title: "Global",
    shortcuts: [
      { key: "⌘K / Ctrl+K", description: "Open search" },
      { key: "?", description: "Show shortcuts help" },
      { key: "Esc", description: "Close modal / search" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { key: "⌘1 / Ctrl+1", description: "Go to Tools" },
      { key: "⌘2 / Ctrl+2", description: "Go to Categories" },
      { key: "⌘3 / Ctrl+3", description: "Go to Guides" },
      { key: "⌘4 / Ctrl+4", description: "Go to Blog" },
    ],
  },
  {
    title: "Tool Pages",
    shortcuts: [
      { key: "⌘Enter / Ctrl+Enter", description: "Run / Format (supported tools)" },
      { key: "⌘Shift+C / Ctrl+Shift+C", description: "Copy output (supported tools)" },
      { key: "⌘Shift+M / Ctrl+Shift+M", description: "Minify (formatters)" },
      { key: "⌘Shift+V / Ctrl+Shift+V", description: "Validate (formatters)" },
      { key: "⌘↑/↓ / Ctrl+↑/↓", description: "Navigate search results" },
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

  useFocusTrap(isOpen, contentRef);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg)]/70 backdrop-blur animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 shadow-sm animate-slide-up"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-[var(--color-text)]">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {shortcutCategories.map((category, catIndex) => (
            <section key={catIndex} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {category.title}
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-2 gap-y-3">
                {category.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="contents">
                    <dt className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                      <kbd className={cn(
                        "flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 font-mono text-xs font-medium text-[var(--color-text-muted)]",
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
                    <dd className="text-sm text-[var(--color-text)] self-center">
                      {shortcut.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
                <Command className="h-3 w-3" /> K
              </kbd>{" "}
              to search tools anywhere.{" "}
              <kbd className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
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