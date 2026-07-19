"use client";

import Script from "next/script";
import { useMemo } from "react";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

export function AdSenseScript() {
  const src = useMemo(
    () =>
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`,
    []
  );

  if (!ADSENSE_PUBLISHER_ID || IS_DEV) return null;

  return (
    <Script
      id="adsense"
      src={src}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
