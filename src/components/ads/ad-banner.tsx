"use client";

import { useRef, useEffect } from "react";
import type { AdPlaceholderProps } from "@/types";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

export function AdBanner({ className = "", slot = "1234567890", width = 728, height = 90 }: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isEnabled = !!ADSENSE_PUBLISHER_ID && !IS_DEV;

  useEffect(() => {
    if (!isEnabled || !adRef.current || typeof window === "undefined") return;

    try {
      const adsbygoogle = (window as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (adsbygoogle as unknown[]).push({});
    } catch {
      console.warn("AdSense push failed");
    }
  }, [isEnabled]);

  if (IS_DEV) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-surface-300 bg-surface-50 dark:border-dark-border dark:bg-dark-surface ${className}`}
        style={{ width, height }}
        role="img"
        aria-label="Advertisement placeholder"
      >
        <span className="text-xs text-surface-400 dark:text-dark-muted">
          Ad Banner ({width}x{height})
        </span>
      </div>
    );
  }

  if (!ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <div
      ref={adRef}
      className={className}
      style={{ minHeight: height }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width, height }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
