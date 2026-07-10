"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

type ConsentView = "banner" | "customize";

const COOKIE_CONSENT_KEY = "cookie-consent";
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  advertising: false,
  functional: false,
};

const categories = [
  {
    id: "necessary" as const,
    title: "Necessary",
    description: "Essential for the website to function properly. These cannot be disabled.",
    required: true,
  },
  {
    id: "functional" as const,
    title: "Functional",
    description: "Remember your preferences (theme, tool settings) to enhance your experience.",
    required: false,
  },
  {
    id: "analytics" as const,
    title: "Analytics",
    description: "Help us understand which tools and pages are most popular to improve our platform.",
    required: false,
  },
  {
    id: "advertising" as const,
    title: "Advertising",
    description: "Used to deliver relevant advertisements and measure ad performance.",
    required: false,
  },
];

function getStoredConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored) as CookiePreferences;
    }
  } catch {
    return null;
  }
  return null;
}

function setStoredConsent(prefs: CookiePreferences) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
  } catch {
    console.error("Could not save cookie consent");
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function updateConsentMode(prefs: CookiePreferences) {
  const consentMode = {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.advertising ? "granted" : "denied",
    ad_user_data: prefs.advertising ? "granted" : "denied",
    ad_personalization: prefs.advertising ? "granted" : "denied",
    functionality_storage: prefs.functional ? "granted" : "denied",
    personalization_storage: prefs.functional ? "granted" : "denied",
    security_storage: "granted",
  };

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", consentMode);
  }
}

export function CookieConsent() {
  const [view, setView] = useState<ConsentView>("banner");
  const [show, setShow] = useState(() => !getStoredConsent());
  const [preferences, setPreferences] = useState<CookiePreferences>(() => getStoredConsent() ?? DEFAULT_PREFERENCES);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = getStoredConsent();
    if (stored) {
      updateConsentMode(stored);
    }
  }, [updateConsentMode]);

  const acceptAll = useCallback(() => {
    const all: CookiePreferences = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true,
    };
    setPreferences(all);
    setStoredConsent(all);
    updateConsentMode(all);
    setShow(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setStoredConsent(DEFAULT_PREFERENCES);
    updateConsentMode(DEFAULT_PREFERENCES);
    setShow(false);
  }, []);

  const savePreferences = useCallback(() => {
    setStoredConsent(preferences);
    updateConsentMode(preferences);
    setShow(false);
  }, [preferences]);

  const togglePreference = useCallback((id: keyof CookiePreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-surface-200 bg-white p-4 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
      role="dialog"
      aria-label="Cookie consent"
      aria-modal={view === "customize"}
    >
      <div className="mx-auto max-w-4xl">
        {view === "banner" ? (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 text-sm text-surface-600 dark:text-dark-muted">
              <p>
                We use cookies to enhance your experience, analyze site usage, and serve
                personalized content. By clicking &quot;Accept All,&quot; you consent to our use
                of cookies. See our{" "}
                <a
                  href="/cookie-policy"
                  className="text-brand-500 underline hover:text-brand-600"
                >
                  Cookie Policy
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-brand-500 underline hover:text-brand-600"
                >
                  Privacy Policy
                </a>{" "}
                for details.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setView("customize")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
              >
                Customize
              </button>
              <button
                onClick={rejectNonEssential}
                className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setView("banner")}
                aria-label="Close cookie preferences"
                className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-surface-600 dark:text-dark-muted">
              Manage your cookie preferences. Necessary cookies are always enabled.
            </p>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${
                    cat.required
                      ? "border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-bg"
                      : "border-surface-200 dark:border-dark-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preferences[cat.id]}
                    onChange={() => togglePreference(cat.id)}
                    disabled={cat.required}
                    className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500 disabled:opacity-60"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-surface-900 dark:text-dark-text">
                      {cat.title}
                      {cat.required && (
                        <span className="ml-1 text-xs text-surface-400">(Required)</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 dark:text-dark-muted mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={rejectNonEssential}
                className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 dark:bg-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={savePreferences}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
