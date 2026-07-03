"use client";

import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL || process.env.ANALYTICS_URL || "";
    if (!analyticsUrl) return;

    const script = document.createElement("script");
    script.src = analyticsUrl;
    script.defer = true;
    script.setAttribute("data-domains", "tools.devstackio.com");
    document.head.appendChild(script);
  }, []);

  return null;
}
