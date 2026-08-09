"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "iframe",
].join(", ");

function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );
}

/**
 * Traps keyboard focus inside a dialog/modal while it is open and restores
 * focus to the previously focused element when closed.
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  restoreToRef?: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;

    if (restoreToRef?.current) {
      restoreToRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !container) return;

      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || active === container || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, containerRef, restoreToRef]);
}