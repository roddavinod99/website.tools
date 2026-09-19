"use client";

import { useEffect } from "react";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

export function AdSenseScript() {
  useEffect(() => {
    if (!ADSENSE_PUBLISHER_ID || IS_DEV) return;
    if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
