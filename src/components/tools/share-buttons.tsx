"use client";

import { useState, useCallback } from "react";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, []);

  const share = useCallback(async () => {
    try {
      await navigator.share({ url: window.location.href });
    } catch {
      // user cancelled or API unavailable
    }
  }, []);

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={copyUrl}>
        <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy URL"}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={share}>
        <Share2 className="h-3.5 w-3.5" /> Share
      </Button>
    </div>
  );
}
