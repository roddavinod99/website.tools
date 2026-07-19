"use client";

import Script from "next/script";

const HAS_GOOGLE_TAGS = !!(
  process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
);

export function ConsentManager() {
  if (!HAS_GOOGLE_TAGS) return null;

  return (
    <Script
      id="consent-defaults"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'granted',
            'personalization_storage': 'denied',
            'security_storage': 'granted',
            'wait_for_update': 500
          });

          gtag('set', 'ads_data_redaction', true);
          gtag('set', 'url_passthrough', true);
        `,
      }}
    />
  );
}
