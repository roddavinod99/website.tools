"use client";

import { useRef, useEffect } from "react";
import type { AdPlaceholderProps } from "@/types";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

type AdFormat = "horizontal" | "vertical" | "rectangle" | "auto";

interface AdUnitProps extends AdPlaceholderProps {
  format: AdFormat;
  label?: string;
}

const formatDefaults: Record<AdFormat, { width?: number; height?: number; label: string; slot: string }> = {
  horizontal: { width: 728, height: 90, label: "Ad Banner", slot: "1234567890" },
  vertical: { width: 300, height: 600, label: "Sidebar Ad", slot: "2345678901" },
  rectangle: { width: 336, height: 280, label: "In-Content Ad", slot: "3456789012" },
  auto: { label: "Responsive Ad", slot: "4567890123" },
};

export function AdUnit({ className = "", slot, format, label: customLabel }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isEnabled = !!ADSENSE_PUBLISHER_ID && !IS_DEV;
  const defaults = formatDefaults[format];
  const finalWidth = defaults.width;
  const finalHeight = defaults.height;
  const displayLabel = customLabel || defaults.label;
  const finalSlot = slot || defaults.slot;

  useEffect(() => {
    if (!isEnabled || !adRef.current || typeof window === "undefined") return;

    try {
      const adsbygoogle = (window as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (adsbygoogle as unknown[]).push({});
    } catch {
      // AdSense not available
    }
  }, [isEnabled]);

  if (IS_DEV) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-surface-300 bg-surface-50 dark:border-dark-border dark:bg-dark-surface ${className}`}
        style={finalWidth && finalHeight ? { width: finalWidth, height: finalHeight } : { minHeight: 90 }}
        role="img"
        aria-label="Advertisement placeholder"
      >
        <span className="text-xs text-surface-400 dark:text-dark-muted">
          {displayLabel}{finalWidth && finalHeight ? ` (${finalWidth}x${finalHeight})` : ""}
        </span>
      </div>
    );
  }

  if (!ADSENSE_PUBLISHER_ID) {
    return null;
  }

  const insStyle: React.CSSProperties = finalWidth && finalHeight
    ? { display: "block", width: finalWidth, height: finalHeight }
    : { display: "block" };

  return (
    <div ref={adRef} className={className} style={finalHeight ? { minHeight: finalHeight } : { minHeight: 90 }}>
      <ins
        className="adsbygoogle"
        style={insStyle}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={finalSlot}
        data-ad-format={format}
        data-full-width-responsive={format === "horizontal" || format === "auto" ? "true" : "false"}
      />
    </div>
  );
}
