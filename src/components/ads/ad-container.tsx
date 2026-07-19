"use client";

import { useRef, useEffect, useState } from "react";
import type { AdPlaceholderProps } from "@/types";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";
const IS_DEV = process.env.NODE_ENV === "development";

type AdFormat = "horizontal" | "vertical" | "rectangle" | "auto" | "fluid";

interface AdContainerProps extends AdPlaceholderProps {
  format: AdFormat;
  label?: string;
  children?: React.ReactNode;
}

const formatDefaults: Record<AdFormat, { width?: number; height?: number; label: string; slot: string }> = {
  horizontal: { width: 728, height: 90, label: "Ad Banner", slot: "1234567890" },
  vertical: { width: 300, height: 600, label: "Sidebar Ad", slot: "2345678901" },
  rectangle: { width: 336, height: 280, label: "In-Content Ad", slot: "3456789012" },
  auto: { label: "Responsive Ad", slot: "4567890123" },
  fluid: { label: "Fluid Ad", slot: "5678901234" },
};

export function AdContainer({ 
  className = "", 
  slot, 
  format, 
  label: customLabel, 
  width,
  height,
  children,
}: AdContainerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isEnabled = !!ADSENSE_PUBLISHER_ID && !IS_DEV;
  const defaults = formatDefaults[format];
  const finalWidth = width ?? defaults.width;
  const finalHeight = height ?? defaults.height;
  const displayLabel = customLabel || defaults.label;
  const finalSlot = slot || defaults.slot;

  useEffect(() => {
    if (!isEnabled || !adRef.current || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );
    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [isEnabled]);

  useEffect(() => {
    if (!isVisible || !isEnabled || !adRef.current || typeof window === "undefined") return;
    try {
      const adsbygoogle = (window as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (adsbygoogle as unknown[]).push({});
    } catch {
      // AdSense not available
    }
  }, [isVisible, isEnabled]);

  if (IS_DEV) {
    return (
      <div
        ref={adRef}
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-surface-300 bg-surface-50 dark:border-dark-border dark:bg-dark-surface ${className}`}
        style={finalWidth && finalHeight ? { width: finalWidth, height: finalHeight } : { minHeight: finalHeight || 90 }}
        role="img"
        aria-label="Advertisement placeholder"
      >
        {children || (
          <span className="text-xs text-surface-400 dark:text-dark-muted">
            {displayLabel}{finalWidth && finalHeight ? ` (${finalWidth}x${finalHeight})` : ""}
          </span>
        )}
      </div>
    );
  }

  if (!ADSENSE_PUBLISHER_ID) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    minHeight: finalHeight || 90,
  };

  const insStyle: React.CSSProperties = finalWidth && finalHeight
    ? { display: "block", width: finalWidth, height: finalHeight }
    : { display: "block" };

  return (
    <div ref={adRef} className={className} style={containerStyle} role="complementary" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={insStyle}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={finalSlot}
        data-ad-format={format}
        data-full-width-responsive={format === "horizontal" || format === "auto" || format === "fluid" ? "true" : "false"}
      />
    </div>
  );
}

export function AdBanner(props: AdPlaceholderProps) {
  return <AdContainer format="horizontal" label="Ad Banner" {...props} />;
}

export function SidebarAd(props: AdPlaceholderProps) {
  return <AdContainer format="vertical" label="Sidebar Ad" {...props} />;
}

export function InContentAd(props: AdPlaceholderProps) {
  return <AdContainer format="rectangle" label="In-Content Ad" {...props} />;
}

export function ResponsiveAd(props: AdPlaceholderProps) {
  return <AdContainer format="auto" label="Responsive Ad" {...props} />;
}

export function FluidAd(props: AdPlaceholderProps) {
  return <AdContainer format="fluid" label="Fluid Ad" {...props} />;
}