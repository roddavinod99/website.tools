'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /**
   * When false, the provider renders children without ever loading Preline.
   * Useful for routes that don't need any Preline component (e.g. a static
   * About page).
   */
  enabled?: boolean;
};

// Module-level promise so we only import preline once per session.
let prelinePromise: Promise<typeof import('preline')> | null = null;

async function loadPreline() {
  if (!prelinePromise) {
    prelinePromise = import('preline');
  }
  return prelinePromise;
}

/**
 * PrelineProvider lazy-loads Preline UI and calls HSStaticMethods.autoInit()
 * to wire up the data-attribute behaviour for the components on the page
 * (dropdowns, modals, tabs, etc.).
 *
 * Loading strategy (per spec P0-02 / P4-13):
 *  - Lazy: never on first paint; loaded by requestIdleCallback or by the
 *    first user interaction (whichever first), with an IntersectionObserver
 *    fallback that triggers when the user has scrolled past the first 100px
 *    or interacted with the document.
 *  - Idempotent: multiple mounts of this provider share a single import.
 *  - SSR-safe: dynamic import only runs in the browser.
 */
export function PrelineProvider({ children, enabled = true }: Props) {
  const initRan = useRef(false);

  useEffect(() => {
    if (!enabled || initRan.current) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let idleHandle: number | null = null;
    let onFirstInteraction: (() => void) | null = null;

    const init = async () => {
      if (cancelled || initRan.current) return;
      try {
        await loadPreline();
        if (cancelled) return;
        if (typeof window !== 'undefined' && window.HSStaticMethods) {
          window.HSStaticMethods.autoInit();
        }
        initRan.current = true;
      } catch {
        // Preline failed to load (offline, ad-blocker, etc.). Render the page
        // anyway — Preline components will simply not have enhanced behaviour.
        initRan.current = true;
      }
    };

    // 1) Idle callback (Chrome/Edge). Fallback to setTimeout for Firefox/Safari.
    type IdleWindow = Window & { requestIdleCallback?: (cb: () => void) => number };
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === 'function') {
      idleHandle = w.requestIdleCallback(() => init());
    } else {
      idleHandle = window.setTimeout(() => init(), 1);
    }

    // 2) First user interaction (click/keydown/touchstart) triggers init.
    onFirstInteraction = () => {
      if (!initRan.current) void init();
    };
    window.addEventListener('click', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });

    // 3) Fallback IntersectionObserver: trigger when the body intersects.
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            void init();
            break;
          }
        }
      });
      observer.observe(document.body);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (onFirstInteraction) {
        window.removeEventListener('click', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
      }
      if (idleHandle != null) {
        type IdleWindow2 = Window & { cancelIdleCallback?: (h: number) => void };
        const w2 = window as IdleWindow2;
        if (typeof w2.cancelIdleCallback === 'function') {
          w2.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, [enabled]);

  return <>{children}</>;
}
