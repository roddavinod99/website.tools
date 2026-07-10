"use client";

import Script from "next/script";
import { useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function Analytics() {
  const [consented] = useState(() => {
    try {
      const stored = localStorage.getItem("cookie-consent");
      if (stored) {
        const prefs = JSON.parse(stored);
        return !!prefs.analytics;
      }
    } catch { /* ignore */ }
    return false;
  });

  if (!GA_ID) return null;

  const consentMode = {
    analytics_storage: consented ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    personalization_storage: "denied",
    security_storage: "granted",
  };

  return (
    <>
      <Script id="google-consent" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', ${JSON.stringify(consentMode)});
        `}
      </Script>
      {consented && (
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
      )}
    </>
  );
}
