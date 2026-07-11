"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";

type ECCLevel = "L" | "M" | "Q" | "H";
type OutputFormat = "png" | "svg" | "jpeg";
type QRType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location";
type DotShape = "square" | "circle" | "rounded";

const ECC_MAP: Record<ECCLevel, string> = { L: "Low (7%)", M: "Medium (15%)", Q: "Quartile (25%)", H: "High (30%)" };
const ECC_QRCODE = { L: "L", M: "M", Q: "Q", H: "H" } as const;

function formatQRData(type: QRType, value: string, extra: Record<string, string>): string {
  switch (type) {
    case "url": return value;
    case "email": return `mailto:${value}${extra.subject ? `?subject=${encodeURIComponent(extra.subject)}` : ""}`;
    case "phone": return `tel:${value}`;
    case "sms": return `smsto:${value}:${extra.body || ""}`;
    case "wifi": return `WIFI:T:${extra.encryption || "WPA"};S:${value};P:${extra.password || ""};;`;
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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getEffectiveInput = useCallback(() => {
    if (!input.trim()) return "";
    return formatQRData(qrType, input.trim(), extra);
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

    let qrData;
    try {
      qrData = QRCode.create(data, { errorCorrectionLevel: ECC_QRCODE[ecc] });
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

    const svgString = buildSvgFromMatrix(matrix, mSize, padding);
    setQrSvg(svgString);

    if (includeLogo && logoUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const logoSize = mSize * cellSize * 0.25;
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
  }, [getEffectiveInput, ecc, fgColor, bgColor, useGradient, gradientStart, gradientEnd, dotShape, cellSize, margin, outputFormat, includeLogo, logoUrl, input, renderToCanvas, buildSvgFromMatrix]);

  useEffect(() => {
    if (input.trim()) {
      const id = requestAnimationFrame(() => { generate(); });
      return () => cancelAnimationFrame(id);
    }
  }, [generate, input]);

  const download = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    const ext = outputFormat === "svg" && qrSvg ? "svg" : outputFormat;
    link.download = `qrcode.${ext}`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, outputFormat, qrSvg]);

  const copyToClipboard = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const blob = await (await fetch(qrDataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      // Fallback: copy SVG string to clipboard
      if (qrSvg) {
        await navigator.clipboard.writeText(qrSvg);
      }
    }
  }, [qrDataUrl, qrSvg]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setIncludeLogo(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["url", "text", "email", "phone", "sms", "wifi", "vcard", "location"] as QRType[]).map((t) => (
          <button key={t} onClick={() => setQrType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${qrType === t ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"}`}>
            {t === "url" ? "URL" : t === "vcard" ? "vCard" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {qrType === "url" ? "URL" : qrType === "email" ? "Email Address" : qrType === "phone" ? "Phone Number" : qrType === "sms" ? "Phone Number" : qrType === "wifi" ? "SSID (Network Name)" : qrType === "vcard" ? "Phone Number" : qrType === "location" ? "Label" : "Text"}
          </label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={qrType === "url" ? "https://example.com" : qrType === "email" ? "user@example.com" : qrType === "phone" ? "+1234567890" : qrType === "sms" ? "+1234567890" : qrType === "wifi" ? "MyNetwork" : qrType === "location" ? "My Location" : "Enter text..."}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>

        {qrType === "email" && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Subject</label>
            <input type="text" value={extra.subject || ""} onChange={(e) => setExtra(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject"
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          </div>
        )}
        {qrType === "sms" && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Message Body</label>
            <input type="text" value={extra.body || ""} onChange={(e) => setExtra(p => ({ ...p, body: e.target.value }))} placeholder="SMS text"
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          </div>
        )}
        {qrType === "wifi" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Password</label>
              <input type="text" value={extra.password || ""} onChange={(e) => setExtra(p => ({ ...p, password: e.target.value }))} placeholder="WiFi password"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Encryption</label>
              <select value={extra.encryption || "WPA"} onChange={(e) => setExtra(p => ({ ...p, encryption: e.target.value }))}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </>
        )}
        {qrType === "vcard" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Full Name</label>
              <input type="text" value={extra.name || ""} onChange={(e) => setExtra(p => ({ ...p, name: e.target.value }))} placeholder="John Doe"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Organization</label>
              <input type="text" value={extra.org || ""} onChange={(e) => setExtra(p => ({ ...p, org: e.target.value }))} placeholder="Company Inc."
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Email</label>
              <input type="text" value={extra.email || ""} onChange={(e) => setExtra(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Website</label>
              <input type="text" value={extra.url || ""} onChange={(e) => setExtra(p => ({ ...p, url: e.target.value }))} placeholder="https://example.com"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Address</label>
              <input type="text" value={extra.address || ""} onChange={(e) => setExtra(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
          </>
        )}
        {qrType === "location" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Latitude</label>
              <input type="number" step="any" value={extra.lat || ""} onChange={(e) => setExtra(p => ({ ...p, lat: e.target.value }))} placeholder="37.7749"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Longitude</label>
              <input type="number" step="any" value={extra.lng || ""} onChange={(e) => setExtra(p => ({ ...p, lng: e.target.value }))} placeholder="-122.4194"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
          </>
        )}
      </div>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">Advanced Options</summary>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-surface-200 dark:border-dark-border">
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Error Correction</label>
            <select value={ecc} onChange={(e) => setEcc(e.target.value as ECCLevel)}
              className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              {(["L", "M", "Q", "H"] as ECCLevel[]).map((l) => (<option key={l} value={l}>{ECC_MAP[l]}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Output Format</label>
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              {(["png", "svg", "jpeg"] as OutputFormat[]).map((f) => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Cell Size: {cellSize}px</label>
            <input type="range" min={4} max={20} value={cellSize} onChange={(e) => setCellSize(parseInt(e.target.value))} className="w-full accent-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Margin: {margin} modules</label>
            <input type="range" min={1} max={8} value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full accent-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Dot Shape</label>
            <select value={dotShape} onChange={(e) => setDotShape(e.target.value as DotShape)}
              className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Foreground Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" />
              <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
              <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="accent-brand-500" />
              Gradient colors
            </label>
          </div>
          {useGradient && (
            <>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Gradient Start</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" />
                  <input type="text" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Gradient End</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="h-8 w-12 rounded border border-surface-200 dark:border-dark-border" />
                  <input type="text" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </div>
            </>
          )}
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
              <input type="checkbox" checked={includeLogo} onChange={(e) => setIncludeLogo(e.target.checked)} className="accent-brand-500" />
              Add Logo
            </label>
          </div>
          {includeLogo && (
            <div>
              <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Logo Image</label>
              <button onClick={() => fileRef.current?.click()} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors">Upload Logo</button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
          )}
        </div>
      </details>

      <canvas ref={canvasRef} className="hidden" />

      {qrDataUrl && (
        <div className="space-y-4">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" className="max-w-[300px] rounded-lg border border-surface-200 dark:border-dark-border shadow-md" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={download} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
              Download as {outputFormat.toUpperCase()}
            </button>
            <button onClick={copyToClipboard} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              Copy Image
            </button>
            <button onClick={() => { const w = window.open(""); w?.document.write(`<img src="${qrDataUrl}" />`); }}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              Preview Full Size
            </button>
          </div>
        </div>
      )}

      {history.length > 1 && (
        <details className="rounded-lg border border-surface-200 dark:border-dark-border">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
            History ({history.length})
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
