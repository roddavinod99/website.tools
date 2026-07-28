"use client";

import Script from "next/script";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

export function AdSenseScript() {
  const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;

  if (!ADSENSE_PUBLISHER_ID || IS_DEV) return null;

  return (
    <Script
      id="adsense"
      src={src}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
