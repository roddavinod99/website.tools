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
  const [adLoaded, setAdLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isEnabled = !!ADSENSE_PUBLISHER_ID && !IS_DEV;
  const defaults = formatDefaults[format];
  const finalWidth = width ?? defaults.width;
  const finalHeight = height ?? defaults.height;
  const displayLabel = customLabel || defaults.label;
  const finalSlot = slot || defaults.slot;

  const checkAdFill = () => {
    if (!adRef.current) return false;
    
    const ins = adRef.current.querySelector('ins');
    if (!ins) return false;
    
    // Check for iframe (ad loaded) or non-zero dimensions
    const iframe = ins.querySelector('iframe');
    const hasAd = !!iframe || ins.offsetHeight > 0 || ins.offsetWidth > 0;
    
    if (hasAd) {
      setAdLoaded(true);
      setIsLoading(false);
      if (checkTimerRef.current) {
        clearInterval(checkTimerRef.current);
        checkTimerRef.current = null;
      }
      return true;
    }
    return false;
  };

  // Intersection observer for lazy loading
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

  // Ad load detection with 1 second timeout
  useEffect(() => {
    if (!isVisible || !isEnabled || !adRef.current || typeof window === "undefined" || adLoaded) return;
    
    setIsLoading(true);
    
    try {
      const adsbygoogle = (window as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (adsbygoogle as unknown[]).push({});
    } catch {
      // AdSense not available
    }

    // Start checking after 1 second delay
    if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
    initialDelayRef.current = setTimeout(() => {
      let checks = 0;
      const maxChecks = 10; // 1 second total (100ms intervals)
      
      const interval = setInterval(() => {
        if (checkAdFill() || checks >= maxChecks) {
          clearInterval(interval);
          checkTimerRef.current = null;
          if (!checkAdFill() && !adLoaded) {
            // No ad after 1 second - collapse
            setAdLoaded(false);
            setIsLoading(false);
          }
        }
        checks++;
      }, 100);
      
      checkTimerRef.current = interval;
    }, 1000);

    return () => {
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, [isVisible, isEnabled, adLoaded]);

  // MutationObserver fallback for late-loading ads
  useEffect(() => {
    if (!adRef.current || adLoaded || IS_DEV) return;
    
    const observer = new MutationObserver(() => {
      if (checkAdFill()) {
        observer.disconnect();
      }
    });
    
    observer.observe(adRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [adLoaded]);

  // Re-check on window resize for unfilled slots
  useEffect(() => {
    if (adLoaded) return;
    
    const handleResize = () => {
      if (isVisible && isEnabled && !isLoading && !adLoaded) {
        setIsLoading(true);
        if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
        initialDelayRef.current = setTimeout(() => {
          let checks = 0;
          const maxChecks = 10;
          const interval = setInterval(() => {
            if (checkAdFill() || checks >= maxChecks) {
              clearInterval(interval);
              checkTimerRef.current = null;
              if (!checkAdFill() && !adLoaded) {
                setAdLoaded(false);
                setIsLoading(false);
              }
            }
            checks++;
          }, 100);
          checkTimerRef.current = interval;
        }, 500); // shorter delay on resize
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adLoaded, isVisible, isEnabled, isLoading]);

  // Dev mode placeholder
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

  // Dynamic container styles based on ad state
  const containerStyle: React.CSSProperties = (() => {
    if (adLoaded) {
      return { 
        height: 'auto', 
        minHeight: 0,
        overflow: 'hidden',
        transition: 'height 0.3s ease-out'
      };
    }
    if (!isLoading) {
      // Ad failed to load - fully collapse
      return { 
        height: 0, 
        minHeight: 0, 
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        transition: 'height 0.3s ease-out'
      };
    }
    // Loading state - show skeleton
    return { 
      minHeight: finalHeight || 90,
      transition: 'height 0.3s ease-out'
    };
  })();

  const insStyle: React.CSSProperties = finalWidth && finalHeight
    ? { display: "block", width: finalWidth, height: finalHeight }
    : { display: "block" };

  return (
    <div 
      ref={adRef} 
      className={className} 
      style={containerStyle} 
      role="complementary" 
      aria-label="Advertisement"
    >
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