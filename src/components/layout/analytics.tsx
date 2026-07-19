"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getStorageJSON } from "@/lib/client-storage";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

interface CookiePrefs {
  analytics: boolean;
}

function getStoredConsent(): boolean {
  const prefs = getStorageJSON<CookiePrefs>("cookie-consent");
  return prefs?.analytics ?? false;
}

export function Analytics() {
  const [consented, setConsented] = useState(() => getStoredConsent());
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleStorageChange = useCallback(() => {
    setConsented(getStoredConsent());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleStorageChange]);

  useEffect(() => {
    if (!consented || !window.gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", GA_ID, {
      page_path: url,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }, [consented, pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
          });
        `}
      </Script>
    </>
  );
}
