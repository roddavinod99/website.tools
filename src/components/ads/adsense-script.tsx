"use client";

import Script from "next/script";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

// Use next/script with lazyOnload to avoid hydration mismatches and CSP warnings.
// The strategy="lazyOnload" loads the script during browser idle time after
// all page resources have loaded, preventing hydration errors.
export function AdSenseScript() {
  if (!ADSENSE_PUBLISHER_ID || IS_DEV) return null;

  return (
    <Script
      id="adsense-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
