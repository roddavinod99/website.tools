"use client";

import { useState, useEffect } from "react";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  languages: string;
  cookiesEnabled: boolean;
  doNotTrack: string;
  screenWidth: number;
  screenHeight: number;
  screenDepth: number;
  availWidth: number;
  availHeight: number;
  windowWidth: number;
  windowHeight: number;
  colorDepth: number;
  pixelRatio: number;
  timezone: string;
  timezoneOffset: number;
  connectionType: string;
  connectionEffectiveType: string;
  connectionDownlink: string;
  memory: string;
  cpuCores: number;
  touchSupport: string;
  maxTouchPoints: number;
  deviceMemory: string;
  hardwareConcurrency: number;
  pdfViewer: boolean;
  webdriver: boolean;
  javaEnabled: boolean;
  ink: boolean;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android.*mobile|opera mini|iemobile/i.test(ua)) return "Mobile";
  if (/tv|smarttv|googletv|roku|firetv|appletv/i.test(ua)) return "Smart TV";
  return "Desktop";
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/") && !ua.includes("Seamonkey")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("UCBrowser")) return "UC Browser";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Unknown";
}

export function DeviceInformation() {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; type?: string } }).connection;
    const devMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform || "Unknown",
      language: navigator.language,
      languages: navigator.languages?.join(", ") || navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || "Not set",
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenDepth: screen.colorDepth,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      connectionType: conn?.type || "Not available",
      connectionEffectiveType: conn?.effectiveType || "Not available",
      connectionDownlink: conn?.downlink !== undefined ? `${conn.downlink} Mbps` : "Not available",
      memory: devMem !== undefined ? `${devMem} GB` : "Not available",
      cpuCores: navigator.hardwareConcurrency || 0,
      touchSupport: navigator.maxTouchPoints > 0 ? "Yes" : "No",
      maxTouchPoints: navigator.maxTouchPoints,
      deviceMemory: devMem !== undefined ? `${devMem} GB` : "Not available",
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      pdfViewer: typeof navigator.pdfViewerEnabled !== "undefined" ? navigator.pdfViewerEnabled : true,
      webdriver: navigator.webdriver || false,
      javaEnabled: false,
      ink: (window as Window & { StyleMedia?: unknown }).StyleMedia !== undefined,
    });
  }, []);

  const copyAll = async () => {
    if (!info) return;
    const text = Object.entries(info)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!info) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-surface-500 dark:text-dark-muted">Loading device information...</div>
      </div>
    );
  }

  const sections: { title: string; items: { label: string; value: string | number | boolean }[] }[] = [
    {
      title: "Browser",
      items: [
        { label: "Browser", value: getBrowserInfo() },
        { label: "User Agent", value: info.userAgent },
        { label: "Platform", value: info.platform },
        { label: "Language", value: info.language },
        { label: "Languages", value: info.languages },
        { label: "Cookies Enabled", value: info.cookiesEnabled ? "Yes" : "No" },
        { label: "Do Not Track", value: info.doNotTrack },
        { label: "WebDriver", value: info.webdriver ? "Yes" : "No" },
        { label: "PDF Viewer", value: info.pdfViewer ? "Yes" : "No" },
      ],
    },
    {
      title: "Display",
      items: [
        { label: "Device Type", value: getDeviceType() },
        { label: "Screen Resolution", value: `${info.screenWidth} × ${info.screenHeight}` },
        { label: "Available Screen", value: `${info.availWidth} × ${info.availHeight}` },
        { label: "Window Size", value: `${info.windowWidth} × ${info.windowHeight}` },
        { label: "Color Depth", value: `${info.colorDepth}-bit` },
        { label: "Pixel Ratio", value: `${info.pixelRatio}x` },
      ],
    },
    {
      title: "Hardware",
      items: [
        { label: "CPU Cores", value: info.cpuCores || "Not available" },
        { label: "Device Memory", value: info.deviceMemory },
        { label: "Touch Support", value: info.touchSupport },
        { label: "Max Touch Points", value: info.maxTouchPoints },
      ],
    },
    {
      title: "Network & System",
      items: [
        { label: "Connection Type", value: info.connectionType },
        { label: "Effective Type", value: info.connectionEffectiveType },
        { label: "Downlink Speed", value: info.connectionDownlink },
        { label: "Timezone", value: info.timezone },
        { label: "UTC Offset", value: `${info.timezoneOffset} minutes` },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">
          Your Device Information
        </h3>
        <button
          onClick={copyAll}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          {copied ? "Copied!" : "Copy All"}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-2">
            {section.title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  {item.label}
                </span>
                <span className="block text-sm font-mono text-surface-900 dark:text-dark-text truncate">
                  {String(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
