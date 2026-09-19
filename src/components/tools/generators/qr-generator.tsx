"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useLoadExample } from "@/lib/load-example";
import { validateFileSize } from "@/lib/file-security";
import { AdvancedOptions, OptionGroup, OptionRow } from "@/components/ui/advanced-options";

type ECCLevel = "L" | "M" | "Q" | "H";
type OutputFormat = "png" | "svg" | "jpeg";
type QRType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location";
type DotShape = "square" | "circle" | "rounded";

const ECC_MAP: Record<ECCLevel, string> = { L: "Low (7%)", M: "Medium (15%)", Q: "Quartile (25%)", H: "High (30%)" };
const ECC_QRCODE = { L: "L", M: "M", Q: "Q", H: "H" } as const;

function formatQRData(type: QRType, value: string, extra: Record<string, string>): string {
  switch (type) {
    case "url": return value;
    case "text": return value;
    case "email": {
      const params: string[] = [];
      if (extra.subject) params.push(`subject=${encodeURIComponent(extra.subject)}`);
      if (extra.body) params.push(`body=${encodeURIComponent(extra.body)}`);
      return `mailto:${value}${params.length ? `?${params.join("&")}` : ""}`;
    }
    case "phone": return `tel:${value}`;
    case "sms": return `smsto:${value}:${extra.body || ""}`;
    case "wifi": {
      const hidden = extra.hidden === "true" ? "H:true;" : "";
      return `WIFI:T:${extra.encryption || "WPA"};S:${value};P:${extra.password || ""};${hidden};`;
    }
    case "vcard": {
      const parts = ["BEGIN:VCARD", "VERSION:3.0"];
      if (extra.name) parts.push(`FN:${extra.name}`);
      if (extra.org) parts.push(`ORG:${extra.org}`);
      if (value) parts.push(`TEL:${value}`);
      if (extra.email) parts.push(`EMAIL:${extra.email}`);
      if (extra.url) parts.push(`URL:${extra.url}`);
      if (extra.address) parts.push(`ADR:;;${extra.address}`);
      parts.push("END:VCARD");
      return parts.join("\n");
    }
    case "location": return `geo:${extra.lat || "0"},${extra.lng || "0"}`;
    default: return value;
  }
}

interface QRBitMatrix {
  size: number;
  get(row: number, col: number): number;
}

type TabId = "textUrl" | "wifi" | "vcard" | "email" | "phone";

const TAB_CONFIG: { id: TabId; label: string; qrType: QRType }[] = [
  { id: "textUrl", label: "Text / URL", qrType: "url" },
  { id: "wifi", label: "WiFi", qrType: "wifi" },
  { id: "vcard", label: "vCard", qrType: "vcard" },
  { id: "email", label: "Email", qrType: "email" },
  { id: "phone", label: "Phone", qrType: "phone" },
];

function tabToQrType(tab: TabId): QRType {
  return TAB_CONFIG.find((t) => t.id === tab)?.qrType ?? "url";
}
function qrTypeToTab(qrType: QRType): TabId {
  const found = TAB_CONFIG.find((t) => t.qrType === qrType);
  if (found) return found.id;
  if (qrType === "text") return "textUrl";
  return "textUrl";
}

export function QRGenerator() {
  const [input, setInput] = useState("");
  const [qrType, setQrType] = useState<QRType>("url");
  const [ecc, setEcc] = useState<ECCLevel>("M");
  const [fgColor, setFgColor] = useState("#2B5748");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientStart, setGradientStart] = useState("#2B5748");
  const [gradientEnd, setGradientEnd] = useState("#1A8FE3");
  const [dotShape, setDotShape] = useState<DotShape>("square");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [cellSize, setCellSize] = useState(8);
  const [margin, setMargin] = useState(4);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoScale, setLogoScale] = useState(0.22);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [qrCode, setQrCode] = useState<any>(null);

  const activeTab: TabId = qrTypeToTab(qrType);

  useEffect(() => {
    import("qrcode").then((mod) => {
      setQrCode(mod.default || mod);
    });
  }, []);

  useLoadExample("qr-generator", (text) => setInput(text));

  // Default H when logo present for better error correction
  useEffect(() => {
    if (includeLogo && logoUrl && ecc !== "H") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEcc("H");
    }
  }, [includeLogo, logoUrl, ecc]);

  const getEffectiveInput = useCallback(() => {
    if (!input.trim()) return "";
    // map textUrl tab to url handling; plain text still uses url passthrough
    const effectiveType = qrType === "text" ? "url" : qrType;
    return formatQRData(effectiveType, input.trim(), extra);
  }, [input, qrType, extra]);

  const buildSvgFromMatrix = useCallback((matrix: QRBitMatrix, mSize: number, padding: number): string => {
    const size = mSize * cellSize + padding * 2;
    const fill = useGradient ? "url(#qrGrad)" : fgColor;
    const r = dotShape === "rounded" ? Math.max(1, Math.floor(cellSize / 4)) : 0;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;
    if (useGradient) {
      svg += `<defs><linearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${gradientStart}"/><stop offset="100%" stop-color="${gradientEnd}"/></linearGradient></defs>`;
    }
    for (let row = 0; row < mSize; row++) {
      for (let col = 0; col < mSize; col++) {
        if (matrix.get(row, col)) {
          const x = padding + col * cellSize;
          const y = padding + row * cellSize;
          if (dotShape === "circle") {
            svg += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize / 2}" fill="${fill}"/>`;
          } else if (dotShape === "rounded") {
            svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${r}" ry="${r}" fill="${fill}"/>`;
          } else {
            svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}"/>`;
          }
        }
      }
    }
    svg += "</svg>";
    return svg;
  }, [cellSize, fgColor, bgColor, useGradient, gradientStart, gradientEnd, dotShape]);

  const renderToCanvas = useCallback((matrix: QRBitMatrix, mSize: number, canvas: HTMLCanvasElement) => {
    const padding = margin * cellSize;
    const size = mSize * cellSize + padding * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    let gradient: CanvasGradient | null = null;
    if (useGradient) {
      gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
    }
    const fg = gradient || fgColor;

    for (let r = 0; r < mSize; r++) {
      for (let c = 0; c < mSize; c++) {
        if (matrix.get(r, c)) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          ctx.fillStyle = fg;
          if (dotShape === "circle") {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (dotShape === "rounded") {
            const r2 = Math.max(1, Math.floor(cellSize / 4));
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, r2);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }
  }, [cellSize, margin, fgColor, bgColor, useGradient, gradientStart, gradientEnd, dotShape]);

  const generate = useCallback(async () => {
    const data = getEffectiveInput();
    if (!data || !canvasRef.current) return;

    // Prefer qrcode lib create API; also generate SVG string via same lib for SVG export fidelity
    let qrData;
    try {
      qrData = qrCode.create(data, { errorCorrectionLevel: ECC_QRCODE[ecc] });
    } catch {
      return;
    }

    const matrix: QRBitMatrix = {
      size: qrData.modules.size,
      get(row: number, col: number): number {
        return qrData.modules.get(row, col) ? 1 : 0;
      },
    };
    const mSize = matrix.size;
    const padding = margin * cellSize;

    renderToCanvas(matrix, mSize, canvasRef.current);

    // Generate SVG string via qrcode lib when available for accurate spec, fall back to manual build
    let svgString: string;
    try {
      if (qrCode.toString) {
        // qrcode toString with type svg returns raw svg; we wrap with bg handling manually if needed
        // Use sync check: qrcode.toString is callback based, so keep manual as primary
        svgString = buildSvgFromMatrix(matrix, mSize, padding);
      } else {
        svgString = buildSvgFromMatrix(matrix, mSize, padding);
      }
    } catch {
      svgString = buildSvgFromMatrix(matrix, mSize, padding);
    }
    setQrSvg(svgString);

    if (includeLogo && logoUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // scale controls logo proportion relative to QR size; clamp 0.1-0.35
      const scaled = Math.min(0.35, Math.max(0.1, logoScale));
      const logoSize = mSize * cellSize * scaled * 1.1;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = (canvas.height - logoSize) / 2;
      const img = new Image();
      img.onload = () => {
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        setQrDataUrl(canvas.toDataURL(`image/${outputFormat === "jpeg" ? "jpeg" : "png"}`));
      };
      img.src = logoUrl;
    } else {
      if (outputFormat === "svg") {
        setQrDataUrl("data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString))));
      } else {
        setQrDataUrl(canvasRef.current.toDataURL(`image/${outputFormat === "jpeg" ? "jpeg" : "png"}`));
      }
    }

    if (input.trim()) {
      setHistory((prev) => [input.trim(), ...prev.filter((h) => h !== input.trim())].slice(0, 20));
    }
  }, [getEffectiveInput, ecc, cellSize, margin, outputFormat, includeLogo, logoUrl, logoScale, input, renderToCanvas, buildSvgFromMatrix, bgColor, qrCode]);

  useEffect(() => {
    if (input.trim() && qrCode) {
      const id = requestAnimationFrame(() => { generate(); });
      return () => cancelAnimationFrame(id);
    }
  }, [generate, input, qrCode]);

  // Also regenerate when logo/ec params change even without input change
  useEffect(() => {
    if (input.trim() && qrCode && qrDataUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generate();
    }
  }, [ecc, logoScale, includeLogo]); // eslint-disable-line react-hooks/exhaustive-deps

  const download = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    const ext = outputFormat === "svg" && qrSvg ? "svg" : outputFormat === "jpeg" ? "jpeg" : "png";
    link.download = `qrcode.${ext}`;
    // When svg, prefer raw svg string for lossless download
    if (outputFormat === "svg" && qrSvg) {
      const blob = new Blob([qrSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, outputFormat, qrSvg]);

  const copyToClipboard = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const blob = await (await fetch(qrDataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      if (qrSvg) {
        await navigator.clipboard.writeText(qrSvg);
      }
    }
  }, [qrDataUrl, qrSvg]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeCheck = validateFileSize(file);
      if (!sizeCheck.valid) return;
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setIncludeLogo(true);
      setEcc("H");
    }
  }, [logoUrl]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportHistory = useCallback(() => {
    if (history.length === 0) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-history.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const switchTab = (tab: TabId) => {
    const nextType = tabToQrType(tab);
    setQrType(nextType);
  };

  return (
    <div className="space-y-6">
      {!qrCode && (
        <div className="rounded-md border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface text-center">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Loading QR library...</p>
        </div>
      )}
      <div role="tablist" aria-label="QR code type" className="flex flex-wrap gap-2">
        {TAB_CONFIG.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => switchTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === t.id ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {activeTab === "textUrl" ? "Text / URL" : activeTab === "email" ? "Email address (to)" : activeTab === "phone" ? "Phone number" : activeTab === "wifi" ? "SSID (Network Name)" : activeTab === "vcard" ? "Phone number" : "Text"}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === "textUrl" ? "https://example.com or any text" :
                activeTab === "email" ? "user@example.com" :
                activeTab === "phone" ? "+1234567890" :
                activeTab === "wifi" ? "MyNetwork" :
                activeTab === "vcard" ? "+1234567890" : "Enter text..."
              }
              className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
            />
          </label>
        </div>

        {activeTab === "email" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Subject
                <input type="text" value={extra.subject || ""} onChange={(e) => setExtra(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Body
                <textarea value={extra.body || ""} onChange={(e) => setExtra(p => ({ ...p, body: e.target.value }))} placeholder="Email body"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
          </>
        )}
        {activeTab === "phone" && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              Phone details
              <input type="text" value={extra.phoneNote || ""} onChange={(e) => setExtra(p => ({ ...p, phoneNote: e.target.value }))} placeholder="Optional label"
                className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </label>
          </div>
        )}
        {activeTab === "wifi" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Password
                <input type="text" value={extra.password || ""} onChange={(e) => setExtra(p => ({ ...p, password: e.target.value }))} placeholder="WiFi password"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Security
                <select value={extra.encryption || "WPA"} onChange={(e) => setExtra(p => ({ ...p, encryption: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">nopass (open)</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text cursor-pointer">
                <input type="checkbox" checked={extra.hidden === "true"} onChange={(e) => setExtra(p => ({ ...p, hidden: e.target.checked ? "true" : "false" }))} className="rounded border-surface-300 accent-brand-500" />
                Hidden network
              </label>
            </div>
          </>
        )}
        {activeTab === "vcard" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Full Name
                <input type="text" value={extra.name || ""} onChange={(e) => setExtra(p => ({ ...p, name: e.target.value }))} placeholder="John Doe"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Organization
                <input type="text" value={extra.org || ""} onChange={(e) => setExtra(p => ({ ...p, org: e.target.value }))} placeholder="Company Inc."
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Email
                <input type="text" value={extra.email || ""} onChange={(e) => setExtra(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Website
                <input type="text" value={extra.url || ""} onChange={(e) => setExtra(p => ({ ...p, url: e.target.value }))} placeholder="https://example.com"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                Address
                <input type="text" value={extra.address || ""} onChange={(e) => setExtra(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
              </label>
            </div>
          </>
        )}
      </div>

      <AdvancedOptions title="Advanced options" defaultOpen={false}>
        <OptionGroup title="Core Settings" description="Fundamental QR code configuration">
          <OptionRow columns={2}>
            <div>
              <label htmlFor="qr-ecc" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Error Correction Level
                <select id="qr-ecc" value={ecc} onChange={(e) => setEcc(e.target.value as ECCLevel)}
                  aria-label="Error correction level"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  {(["L", "M", "Q", "H"] as ECCLevel[]).map((l) => (<option key={l} value={l}>{ECC_MAP[l]}</option>))}
                </select>
              </label>
              {includeLogo && ecc !== "H" && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">H recommended with logo</p>}
            </div>
            <div>
              <label htmlFor="qr-format" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Output Format
                <select id="qr-format" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  aria-label="Output format"
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  {(["png", "svg", "jpeg"] as OutputFormat[]).map((f) => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
                </select>
              </label>
            </div>
            <div>
              <label htmlFor="qr-cell-size" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Cell Size: {cellSize}px
                <input id="qr-cell-size" type="range" min={4} max={20} value={cellSize} onChange={(e) => setCellSize(parseInt(e.target.value))} className="mt-1 w-full accent-brand-500" />
              </label>
            </div>
            <div>
              <label htmlFor="qr-margin" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Margin: {margin} modules
                <input id="qr-margin" type="range" min={1} max={8} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="mt-1 w-full accent-brand-500" />
              </label>
            </div>
          </OptionRow>
        </OptionGroup>

        <OptionGroup title="Appearance" description="Customize how your QR code looks">
          <OptionRow columns={2}>
            <div>
              <label htmlFor="qr-dot-shape" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Dot Shape
                <select id="qr-dot-shape" value={dotShape} onChange={(e) => setDotShape(e.target.value as DotShape)}
                  className="mt-1 w-full rounded-md border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                </select>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Foreground Color
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" aria-label="Foreground color" />
                  <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                Background Color
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" aria-label="Background color" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </label>
            </div>
          </OptionRow>
        </OptionGroup>

        <OptionGroup title="Gradient" description="Add gradient colors to your QR code">
          <OptionRow columns={2}>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text w-full">
                <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="accent-brand-500" />
                Enable gradient colors
              </label>
            </div>
          </OptionRow>
          {useGradient && (
            <OptionRow columns={2}>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                  Gradient Start
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" aria-label="Gradient start color" />
                    <input type="text" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="flex-1 rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                  </div>
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                  Gradient End
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" aria-label="Gradient end color" />
                    <input type="text" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="flex-1 rounded-md border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                  </div>
                </label>
              </div>
            </OptionRow>
          )}
        </OptionGroup>

        <OptionGroup title="Logo" description="Embed a logo in the center (PNG best, SVG supported)">
          <OptionRow columns={1}>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
                <input type="checkbox" checked={includeLogo} onChange={(e) => { const v = e.target.checked; setIncludeLogo(v); if (v) setEcc("H"); }} className="accent-brand-500" />
                Add Logo Overlay
              </label>
            </div>
          </OptionRow>
          {includeLogo && (
            <>
              <OptionRow columns={2}>
                <div>
                  <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Logo PNG</label>
                  <button onClick={() => fileRef.current?.click()} className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors" aria-label="Upload logo PNG">Upload Logo PNG</button>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" aria-label="Logo file input" />
                  {logoUrl && <p className="text-[11px] text-green-600 dark:text-green-400 mt-1">Logo loaded</p>}
                </div>
                <div>
                  <label htmlFor="qr-logo-scale" className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                    Logo Scale: {(logoScale * 100).toFixed(0)}%
                    <input id="qr-logo-scale" type="range" min={0.1} max={0.35} step={0.01} value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="mt-1 w-full accent-brand-500" />
                  </label>
                </div>
              </OptionRow>
              <OptionRow columns={1}>
                <p className="text-[11px] text-surface-400 dark:text-dark-muted">Error correction auto-switches to H with logo for scan reliability. SVG export uses high-fidelity vector.</p>
              </OptionRow>
            </>
          )}
        </OptionGroup>
      </AdvancedOptions>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {qrDataUrl && (
        <div className="space-y-4">
          <div className="flex justify-center" data-testid="tool-output" aria-label="QR code preview">
            {outputFormat === "svg" && qrSvg ? (
              <div className="max-w-[300px] rounded-md border border-surface-200 dark:border-dark-border shadow-md bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Code" className="max-w-[300px] rounded-md border border-surface-200 dark:border-dark-border shadow-md" />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={download} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors" aria-label={`Download QR as ${outputFormat.toUpperCase()}`}>
              Download as {outputFormat.toUpperCase()}
            </button>
            <button onClick={() => {
              if (!qrSvg) return;
              const blob = new Blob([qrSvg], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "qrcode.svg"; a.click();
              URL.revokeObjectURL(url);
            }} disabled={!qrSvg} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Export as SVG">
              Export SVG
            </button>
            <button onClick={copyToClipboard} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy QR image to clipboard">
              Copy Image
            </button>
            <button onClick={() => { const w = window.open(""); if (w) { const img = w.document.createElement("img"); img.src = qrDataUrl; w.document.body.appendChild(img); } }}
              className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Preview full size">
              Preview Full Size
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <details className="rounded-md border border-surface-200 dark:border-dark-border">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface flex items-center justify-between">
            <span>History ({history.length})</span>
            <div className="flex gap-1">
              <button onClick={exportHistory} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface" title="Export history as JSON" aria-label="Export history">
                Export
              </button>
              <button onClick={clearHistory} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface" title="Clear history" aria-label="Clear history">
                Clear
              </button>
            </div>
          </summary>
          <div className="max-h-32 overflow-y-auto border-t border-surface-200 dark:border-dark-border p-2 space-y-1">
            {history.map((item, i) => (
              <button key={i} onClick={() => setInput(item)}
                className="w-full truncate rounded px-2 py-1 text-left text-xs text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface transition-colors">
                {item}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
