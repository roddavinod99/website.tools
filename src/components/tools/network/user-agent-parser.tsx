"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

interface UAResult {
  browser: string; browserVersion: string;
  engine: string; engineVersion: string;
  os: string; osVersion: string;
  deviceType: string; deviceBrand: string; deviceModel: string;
  cpu: string;
  isMobile: boolean; isBot: boolean; botName: string;
  raw: string;
}

interface Preset { name: string; ua: string }

const PRESETS: Preset[] = [
  { name: "Chrome 124", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" },
  { name: "Firefox 125", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0" },
  { name: "Safari 17", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15" },
  { name: "Edge 124", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0" },
  { name: "iOS Safari", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" },
  { name: "Android Chrome", ua: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36" },
  { name: "Googlebot", ua: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "Bingbot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/124.0.0.0 Safari/537.36" },
  { name: "Opera", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/109.0.0.0" },
  { name: "Samsung Internet", ua: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/124.0.6367.82 Mobile Safari/537.36" },
];

interface HistoryEntry { ua: string; timestamp: number }

const BOT_PATTERNS: [RegExp, string][] = [
  [/Googlebot/i, "Googlebot"], [/bingbot|BingPreview/i, "Bingbot"], [/Slurp/i, "Yahoo Slurp"],
  [/DuckDuckBot/i, "DuckDuckBot"], [/Baiduspider/i, "Baiduspider"], [/YandexBot/i, "YandexBot"],
  [/Sogou/i, "Sogou"], [/facebookexternalhit/i, "Facebook"], [/Twitterbot/i, "Twitterbot"],
  [/Applebot/i, "Applebot"], [/SemrushBot/i, "SemrushBot"], [/AhrefsBot/i, "AhrefsBot"],
  [/MJ12bot/i, "MJ12bot"], [/SeznamBot/i, "SeznamBot"], [/PetalBot/i, "PetalBot"],
];

const BROWSER_LIST = [
  { name: "Chrome", engine: "Blink/V8", since: 2008 },
  { name: "Firefox", engine: "Gecko/SpiderMonkey", since: 2004 },
  { name: "Safari", engine: "WebKit/JavaScriptCore", since: 2003 },
  { name: "Edge", engine: "Blink/V8", since: 2015 },
  { name: "Opera", engine: "Blink/V8", since: 1996 },
  { name: "Samsung Internet", engine: "Blink/V8", since: 2012 },
  { name: "IE", engine: "Trident/Chakra", since: 1995 },
  { name: "Brave", engine: "Blink/V8", since: 2016 },
  { name: "Vivaldi", engine: "Blink/V8", since: 2016 },
  { name: "Arc", engine: "Blink/V8", since: 2022 },
];

const OS_LIST = [
  { name: "Windows", latest: "Windows 11", kernel: "NT" },
  { name: "macOS", latest: "macOS 15 Sequoia", kernel: "XNU/Darwin" },
  { name: "iOS", latest: "iOS 19", kernel: "XNU/Darwin" },
  { name: "Android", latest: "Android 16", kernel: "Linux" },
  { name: "Linux", latest: "Various", kernel: "Linux" },
  { name: "Chrome OS", latest: "Latest", kernel: "Linux" },
];

function parseUA(ua: string): UAResult {
  const r: UAResult = {
    browser: "Unknown", browserVersion: "", engine: "Unknown", engineVersion: "",
    os: "Unknown", osVersion: "", deviceType: "Desktop", deviceBrand: "", deviceModel: "",
    cpu: "", isMobile: false, isBot: false, botName: "", raw: ua,
  };

  const bot = BOT_PATTERNS.find(([re]) => re.test(ua));
  if (bot) { r.isBot = true; r.botName = bot[1]; r.deviceType = "Bot"; }

  const browserChecks: [RegExp, (m: RegExpMatchArray) => void][] = [
    [/(Edg)\/(\S+)/, m => { r.browser = "Edge"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(Firefox)\/(\S+)/, m => { r.browser = "Firefox"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(OPR)\/(\S+)/, m => { r.browser = "Opera"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(SamsungBrowser)\/(\S+)/, m => { r.browser = "Samsung Internet"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(Chrome)\/(\S+)/, m => { r.browser = "Chrome"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(Version)\/(\S+).*Safari/, m => { r.browser = "Safari"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(Safari)\/(\S+)/, m => { r.browser = "Safari"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/(MSIE)\s(\S+)/, m => { r.browser = "IE"; r.browserVersion = m[2].replace(/[;)]/g, ""); }],
    [/Trident\/.*rv:(\S+)/, m => { r.browser = "IE"; r.browserVersion = m[1].replace(/[;)]/g, ""); }],
  ];
  for (const [re, apply] of browserChecks) {
    const m = ua.match(re);
    if (m) { apply(m); break; }
  }
  if (r.browser === "Chrome" && ua.includes("Edg")) { r.browser = "Edge"; }
  if (r.browser === "Chrome" && ua.includes("OPR")) { r.browser = "Opera"; }
  if (r.browser === "Chrome" && ua.includes("SamsungBrowser")) { r.browser = "Samsung Internet"; }

  const engines: [RegExp, string][] = [
    [/AppleWebKit\/(\S+)/, "WebKit"], [/Gecko\/(\S+)/, "Gecko"],
    [/Trident\/(\S+)/, "Trident"], [/Presto\/(\S+)/, "Presto"],
    [/Goanna\/(\S+)/, "Goanna"],
  ];
  for (const [re, name] of engines) {
    const m = ua.match(re);
    if (m) { r.engine = name; r.engineVersion = m[1]; break; }
  }

  const oses: [RegExp, string, number?][] = [
    [/Windows NT (\S+)/, "Windows", 0], [/Mac OS X (\S+)/, "macOS", 0],
    [/Android (\S+)/, "Android", 0], [/iPhone OS (\S+)/, "iOS", 0],
    [/iPad.*OS (\S+)/, "iOS", 0], [/CrOS/, "Chrome OS"],
    [/Linux (?!.*Android)/, "Linux"], [/Ubuntu/, "Ubuntu"],
    [/Fedora/, "Fedora"], [/Windows Phone (\S+)/, "Windows Phone", 0],
  ];
  for (const [re, name, verIdx] of oses) {
    const m = ua.match(re);
    if (m) { r.os = name; if (verIdx !== undefined && m[verIdx]) r.osVersion = m[verIdx].replace(/_/g, "."); break; }
  }

  if (!r.isBot) {
    if (/iPad/i.test(ua)) { r.deviceType = "Tablet"; r.isMobile = true; }
    else if (/iPhone|iPod/i.test(ua)) { r.deviceType = "Mobile"; r.isMobile = true; }
    else if (/Android.*Mobile/i.test(ua)) { r.deviceType = "Mobile"; r.isMobile = true; }
    else if (/Android/i.test(ua)) { r.deviceType = "Tablet"; r.isMobile = true; }
    else if (/Mobile|Windows Phone/i.test(ua)) { r.deviceType = "Mobile"; r.isMobile = true; }
    else if (/SmartTV|TV/i.test(ua)) { r.deviceType = "Smart TV"; }
    else if (/Watch/i.test(ua)) { r.deviceType = "Wearable"; }
    else r.deviceType = "Desktop";
  }

  const cpuMatch = ua.match(/\(.*?(x86_64|x64|i686|arm64|armv\d|aarch64).*?\)/i);
  if (cpuMatch) r.cpu = cpuMatch[1].toLowerCase();
  if (r.cpu === "x86_64" || r.cpu === "x64") r.cpu = "x64";

  const brandMatch = ua.match(/SM-([A-Z0-9]+)/);
  if (brandMatch) { r.deviceBrand = "Samsung"; r.deviceModel = `Galaxy ${brandMatch[1]}`; }
  const iPhoneMatch = ua.match(/iPhone(\d+),(\d+)/);
  if (iPhoneMatch) { r.deviceBrand = "Apple"; r.deviceModel = `iPhone ${iPhoneMatch[1]}`; }
  if (ua.includes("Pixel")) { r.deviceBrand = "Google"; r.deviceModel = "Pixel"; }

  return r;
}

export function UserAgentParser() {
  const [input, setInput] = useState(() => {
    if (typeof navigator !== "undefined") return navigator.userAgent;
    return "";
  });
  const [result, setResult] = useState<UAResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    return getStorageJSON<HistoryEntry[]>("uaparse_history") || [];
  });
  const [compareInput, setCompareInput] = useState("");
  const [compareResult, setCompareResult] = useState<UAResult | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    if (history.length > 0) setStorageJSON("uaparse_history", history.slice(0, 20));
  }, [history]);

  const parse = (ua?: string) => {
    const u = (ua || input).trim();
    if (!u) { if (!ua) setResult(null); return; }
    const r = parseUA(u);
    if (!ua) {
      setResult(r);
      setHistory(prev => [{ ua: u, timestamp: Date.now() }, ...prev.filter(e => e.ua !== u)].slice(0, 20));
    }
    return r;
  };

  const doCompare = () => {
    if (!compareInput.trim()) return;
    setCompareResult(parseUA(compareInput.trim()));
  };

  const detectCurrent = () => {
    if (typeof navigator !== "undefined") {
      setInput(navigator.userAgent);
      parse(navigator.userAgent);
    }
  };

  const exportJson = async () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "user-agent.json"; a.click();
    URL.revokeObjectURL(url);
    setCopyFeedback("JSON exported");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const categories = useMemo(() => result ? [
    { label: "Browser", value: result.browser, detail: result.browserVersion },
    { label: "Engine", value: result.engine, detail: result.engineVersion },
    { label: "OS", value: result.os, detail: result.osVersion },
    { label: "Device", value: result.deviceType, detail: [result.deviceBrand, result.deviceModel].filter(Boolean).join(" ") || "" },
    { label: "CPU", value: result.cpu || "N/A" },
    { label: "Type", value: result.isBot ? `Bot (${result.botName})` : result.isMobile ? "Mobile" : "Desktop" },
  ] : [], [result]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">User-Agent String</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Mozilla/5.0 ..." rows={3}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => parse()} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Parse</button>
        <button onClick={detectCurrent} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Detect Current Browser</button>
        {result && <button onClick={exportJson} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Export JSON</button>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted self-center">Presets:</span>
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => { setInput(p.ua); parse(p.ua); }}
            className="rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 text-[11px] text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
          >{p.name}</button>
        ))}
      </div>

      {result && (
        <>
          {result.isBot && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-700 dark:text-amber-100">BOT</span>
              This is a <strong>{result.botName}</strong> crawler/bot
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(c => (
              <div key={c.label} className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">{c.label}</span>
                <span className="block text-sm font-medium text-surface-900 dark:text-dark-text">{c.value}</span>
                {c.detail && <span className="block text-xs text-surface-500 dark:text-dark-muted">{c.detail}</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-surface-200 dark:border-dark-border pt-3">
            <details>
              <summary className="text-xs font-medium text-surface-500 dark:text-dark-muted cursor-pointer hover:text-surface-700 dark:hover:text-dark-text transition-colors">Compare with another UA</summary>
              <div className="mt-2 space-y-2">
                <textarea value={compareInput} onChange={e => setCompareInput(e.target.value)} placeholder="Paste second UA string" rows={2}
                  className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                />
                <button onClick={doCompare} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Compare</button>
                {compareResult && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["browser", "browserVersion", "engine", "os", "deviceType", "isBot"].map(field => (
                      <div key={field} className="text-xs">
                        <span className="text-surface-400 dark:text-dark-muted">{field}: </span>
                        <span className={cn("font-mono", result[field as keyof UAResult] !== compareResult[field as keyof UAResult] ? "text-amber-600 dark:text-amber-400 font-bold" : "text-surface-900 dark:text-dark-text")}>
                          {String(result[field as keyof UAResult])} vs {String(compareResult[field as keyof UAResult])}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>

          <div className="border-t border-surface-200 dark:border-dark-border pt-3">
            <button onClick={() => setShowReference(v => !v)} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
              {showReference ? "Hide" : "Show"} browser/OS reference
            </button>
            {showReference && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Browsers</p>
                  <div className="space-y-1">
                    {BROWSER_LIST.map(b => (
                      <div key={b.name} className="flex items-center justify-between rounded border border-surface-200 px-2 py-1 text-xs dark:border-dark-border">
                        <span className="font-medium text-surface-700 dark:text-dark-text">{b.name}</span>
                        <span className="text-surface-400 dark:text-dark-muted">{b.engine}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Operating Systems</p>
                  <div className="space-y-1">
                    {OS_LIST.map(o => (
                      <div key={o.name} className="flex items-center justify-between rounded border border-surface-200 px-2 py-1 text-xs dark:border-dark-border">
                        <span className="font-medium text-surface-700 dark:text-dark-text">{o.name}</span>
                        <span className="text-surface-400 dark:text-dark-muted">{o.latest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">
          {copyFeedback}
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-surface-200 dark:border-dark-border pt-2">
          <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted font-medium">Recent</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {history.slice(0, 5).map((e, i) => (
              <button key={i} onClick={() => { setInput(e.ua); parse(e.ua); }}
                className="max-w-[180px] truncate rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 text-[11px] font-mono text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
              >{e.ua.slice(0, 40)}...</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
