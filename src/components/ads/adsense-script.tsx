"use client";

import { useEffect } from "react";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

// Loaded via manual DOM injection instead of next/script because the AdSense
// loader logs a console warning ("head tag doesn't support data-nscript")
// when the script tag carries next/script's data-nscript attribute.
export function AdSenseScript() {
  useEffect(() => {
    if (!ADSENSE_PUBLISHER_ID || IS_DEV) return;
    if (document.getElementById("adsense-loader")) return;

    const script = document.createElement("script");
    script.id = "adsense-loader";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
