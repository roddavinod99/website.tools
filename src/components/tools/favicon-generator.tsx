"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type GeneratorMode = "image" | "text";
type BorderRadiusOption = "square" | "rounded" | "circle";
type FillType = "solid" | "gradient";

interface FaviconSize {
  label: string;
  size: number;
  purpose: string;
}

const FAVICON_SIZES: FaviconSize[] = [
  { label: "Favicon (16x16)", size: 16, purpose: "standard" },
  { label: "Favicon (32x32)", size: 32, purpose: "standard" },
  { label: "Favicon (48x48)", size: 48, purpose: "standard" },
  { label: "Small (64x64)", size: 64, purpose: "standard" },
  { label: "Small (96x96)", size: 96, purpose: "standard" },
  { label: "iPad (128x128)", size: 128, purpose: "standard" },
  { label: "Android (192x192)", size: 192, purpose: "android" },
  { label: "Small (256x256)", size: 256, purpose: "standard" },
  { label: "iPhone (512x512)", size: 512, purpose: "ios" },
];

const SPECIAL_SIZES: FaviconSize[] = [
  { label: "Apple Touch Icon", size: 180, purpose: "ios" },
  { label: "Android Chrome", size: 192, purpose: "android" },
  { label: "Windows Tile", size: 144, purpose: "windows" },
  { label: "Windows Wide Tile", size: 310, purpose: "windows" },
];

const ALL_FAVICON_SIZES = [...FAVICON_SIZES, ...SPECIAL_SIZES];

function generateICO(sizes: { data: string; size: number }[]): string {
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = sizes.length;
  let offset = headerSize + numImages * dirEntrySize;
  const header = new ArrayBuffer(headerSize + numImages * dirEntrySize);
  const view = new DataView(header);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, numImages, true);

  const imageBuffers: ArrayBuffer[] = [];

  for (let i = 0; i < numImages; i++) {
    const { data, size } = sizes[i];
    const pngData = data.split(",")[1];
    const binaryStr = atob(pngData);
    const buf = new ArrayBuffer(binaryStr.length);
    const bufView = new Uint8Array(buf);
    for (let j = 0; j < binaryStr.length; j++) {
      bufView[j] = binaryStr.charCodeAt(j);
    }
    imageBuffers.push(buf);

    const entryOffset = headerSize + i * dirEntrySize;
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    view.setUint8(entryOffset, w);
    view.setUint8(entryOffset + 1, h);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, buf.byteLength, true);
    view.setUint32(entryOffset + 12, offset, true);
    offset += buf.byteLength;
  }

  const buffers = [header, ...imageBuffers];
  const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let pos = 0;
  for (const buf of buffers) {
    combined.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }
  const blob = new Blob([combined], { type: "image/x-icon" });
  return URL.createObjectURL(blob);
}

function generateManifest(backgroundColor: string, sizes: number[]): string {
  return JSON.stringify(
    {
      name: "Web App",
      icons: sizes.map((s) => ({
        src: `favicon-${s}x${s}.png`,
        sizes: `${s}x${s}`,
        type: "image/png",
      })),
      theme_color: backgroundColor,
      background_color: backgroundColor,
      display: "standalone",
    },
    null,
    2
  );
}

function generateHTMLTags(backgroundColor: string, sizes: FaviconSize[]): string {
  const tags: string[] = [];
  const standard = sizes.filter((s) => s.purpose === "standard");
  const ios = sizes.filter((s) => s.purpose === "ios");
  const android = sizes.filter((s) => s.purpose === "android");
  const windows = sizes.filter((s) => s.purpose === "windows");

  if (standard.length > 0) {
    tags.push(`  <link rel="icon" type="image/png" sizes="${standard[standard.length - 1].size}x${standard[standard.length - 1].size}" href="/favicon-${standard[standard.length - 1].size}x${standard[standard.length - 1].size}.png">`);
  }
  tags.push(`  <link rel="icon" type="image/x-icon" href="/favicon.ico">`);

  ios.forEach((s) => {
    tags.push(`  <link rel="apple-touch-icon" sizes="${s.size}x${s.size}" href="/favicon-${s.size}x${s.size}.png">`);
  });

  android.forEach((s) => {
    tags.push(`  <link rel="icon" type="image/png" sizes="${s.size}x${s.size}" href="/favicon-${s.size}x${s.size}.png">`);
  });

  if (windows.length > 0) {
    tags.push(`  <meta name="msapplication-TileColor" content="${backgroundColor}">`);
    tags.push(`  <meta name="msapplication-TileImage" content="/favicon-144x144.png">`);
    tags.push(`  <link rel="manifest" href="/manifest.json">`);
  }

  return tags.join("\n");
}

export function FaviconGenerator() {
  const [mode, setMode] = useState<GeneratorMode>("text");
  const [text, setText] = useState("⚡");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fillType, setFillType] = useState<FillType>("solid");
  const [borderRadius, setBorderRadius] = useState<BorderRadiusOption>("rounded");
  const [padding, setPadding] = useState(10);
  const [generatedSizes, setGeneratedSizes] = useState<{ size: number; label: string; dataUrl: string }[]>([]);
  const [icoUrl, setIcoUrl] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 96, 128, 192, 256, 512]);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setMode("image");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const toggleSize = useCallback((size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeSizes = ALL_FAVICON_SIZES.filter((s) => selectedSizes.includes(s.size));
    if (activeSizes.length === 0) return;

    const results: { size: number; label: string; dataUrl: string }[] = [];
    const maxSize = Math.max(...activeSizes.map((s) => s.size));

    const img = new Image();
    img.onload = () => {
      for (const fav of activeSizes) {
        const s = fav.size;
        canvas.width = s;
        canvas.height = s;
        const ctx = canvas.getContext("2d")!;

        if (borderRadius === "circle") {
          ctx.beginPath();
          ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
          ctx.clip();
        } else if (borderRadius === "rounded") {
          const r = s * 0.2;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(s - r, 0);
          ctx.quadraticCurveTo(s, 0, s, r);
          ctx.lineTo(s, s - r);
          ctx.quadraticCurveTo(s, s, s - r, s);
          ctx.lineTo(r, s);
          ctx.quadraticCurveTo(0, s, 0, s - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
          ctx.clip();
        }

        if (fillType === "gradient") {
          const gradient = ctx.createLinearGradient(0, 0, s, s);
          gradient.addColorStop(0, bgColor);
          gradient.addColorStop(1, adjustColor(bgColor, -40));
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = bgColor;
        }
        ctx.fillRect(0, 0, s, s);

        if (mode === "image" && img.complete && img.naturalWidth > 0) {
          const pad = s * (padding / 100);
          const drawSize = s - pad * 2;
          ctx.drawImage(img, pad, pad, drawSize, drawSize);
        } else if (mode === "text" && text) {
          ctx.fillStyle = textColor;
          const fontSize = s * 0.6;
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text.slice(0, 2), s / 2, s / 2);
        }

        results.push({
          size: s,
          label: fav.label,
          dataUrl: canvas.toDataURL("image/png"),
        });
      }
      setGeneratedSizes(results);

      if (results.length > 0) {
        const icoSizes = results
          .filter((r) => [16, 32, 48, 64].includes(r.size))
          .map((r) => ({ data: r.dataUrl, size: r.size }));
        if (icoSizes.length > 0) {
          setIcoUrl(generateICO(icoSizes));
        } else {
          setIcoUrl(null);
        }
      }
    };

    if (mode === "image" && imageUrl) {
      img.src = imageUrl;
    } else {
      const imgData = canvas.toDataURL("image/png");
      results.push({
        size: maxSize,
        label: "Preview",
        dataUrl: imgData,
      });
      setGeneratedSizes(results);
      const icoSizes = results
        .filter((r) => [16, 32, 48, 64].includes(r.size))
        .map((r) => ({ data: r.dataUrl, size: r.size }));
      if (icoSizes.length > 0) {
        setIcoUrl(generateICO(icoSizes));
      } else {
        setIcoUrl(null);
      }
      return;
    }
  }, [mode, text, imageUrl, bgColor, textColor, fillType, borderRadius, padding, selectedSizes]);

  useEffect(() => {
    if (generatedSizes.length > 0) generate();
  }, [borderRadius, padding, generate, generatedSizes.length]);

  const downloadAll = useCallback(() => {
    if (generatedSizes.length === 0) return;

    if (icoUrl) {
      const link = document.createElement("a");
      link.download = "favicon.ico";
      link.href = icoUrl;
      link.click();
    }

    generatedSizes.forEach((gen, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.download = `favicon-${gen.size}x${gen.size}.png`;
        link.href = gen.dataUrl;
        link.click();
      }, 200 * (i + 1));
    });

    setTimeout(() => {
      const manifest = generateManifest(bgColor, generatedSizes.map((g) => g.size));
      const blob = new Blob([manifest], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "manifest.json";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 200 * (generatedSizes.length + 2));
  }, [generatedSizes, icoUrl, bgColor]);

  const copyHTML = useCallback(async () => {
    const tags = generateHTMLTags(bgColor, ALL_FAVICON_SIZES.filter((s) => selectedSizes.includes(s.size)));
    await navigator.clipboard.writeText(tags);
  }, [bgColor, selectedSizes]);

  const downloadSVG = useCallback(() => {
    const size = 64;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${borderRadius === "circle" ? size / 2 : borderRadius === "rounded" ? size * 0.2 : 0}" fill="${bgColor}"/>
  ${mode === "text" && text ? `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size * 0.6}px" font-weight="bold" fill="${textColor}" font-family="sans-serif">${text.slice(0, 2)}</text>` : ""}
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "favicon.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [mode, text, bgColor, textColor, borderRadius]);

  const handleGenerate = useCallback(() => {
    generate();
  }, [generate]);

  const allSelected = selectedSizes.length === ALL_FAVICON_SIZES.length;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode("text")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "text"
              ? "bg-brand-500 text-white"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"
          }`}
        >
          Text / Emoji
        </button>
        <button
          onClick={() => setMode("image")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "image"
              ? "bg-brand-500 text-white"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"
          }`}
        >
          Upload Image
        </button>
      </div>

      {mode === "text" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-dark-text">Text / Emoji</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="⚡"
            maxLength={2}
            className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
            dragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-surface-200 bg-white hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
          />
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded" className="max-h-20 rounded object-contain" />
          ) : (
            <>
              <svg className="mb-1 h-6 w-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-surface-400 dark:text-dark-muted">Click or drop image</p>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-surface-200 dark:border-dark-border"
          />
        </div>
        {mode === "text" && (
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-lg border border-surface-200 dark:border-dark-border"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Fill</label>
          <select
            value={fillType}
            onChange={(e) => setFillType(e.target.value as FillType)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Corners</label>
          <select
            value={borderRadius}
            onChange={(e) => setBorderRadius(e.target.value as BorderRadiusOption)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="circle">Circle</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Padding: {padding}%</label>
          <input
            type="range"
            min={0}
            max={40}
            value={padding}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            className="w-20 accent-brand-500"
          />
        </div>
      </div>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
          Sizes to Generate ({selectedSizes.length})
        </summary>
        <div className="border-t border-surface-200 p-3 dark:border-dark-border">
          <label className="mb-2 flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() =>
                setSelectedSizes(allSelected ? [] : ALL_FAVICON_SIZES.map((s) => s.size))
              }
              className="accent-brand-500"
            />
            Select All
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_FAVICON_SIZES.map((s) => (
              <label
                key={s.size}
                className="flex items-center gap-1 rounded-lg border border-surface-200 px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(s.size)}
                  onChange={() => toggleSize(s.size)}
                  className="accent-brand-500"
                />
                {s.size}x{s.size}
              </label>
            ))}
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Generate Favicons
        </button>
        {generatedSizes.length > 0 && (
          <>
            <button
              onClick={downloadAll}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Download All ({generatedSizes.length + 2} files)
            </button>
            <button
              onClick={copyHTML}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Copy HTML Tags
            </button>
            <button
              onClick={downloadSVG}
              className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              Download SVG
            </button>
          </>
        )}
      </div>

      {generatedSizes.length > 0 && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-3 flex items-center gap-4">
            <div className="relative rounded-lg border border-surface-300 bg-white p-2 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex items-center gap-2 rounded-t border-b border-surface-200 bg-surface-100 px-3 py-1 dark:border-dark-border dark:bg-dark-surface">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-[10px] text-surface-400">favicon — Browser Tab</span>
              </div>
              <div className="flex items-center gap-2 p-3">
                <img
                  src={generatedSizes.find((s) => s.size === 32)?.dataUrl || generatedSizes[0]?.dataUrl}
                  alt="favicon"
                  className="h-5 w-5"
                />
                <span className="text-xs text-surface-500 dark:text-dark-muted">example.com</span>
              </div>
            </div>
            {icoUrl && (
              <div className="text-center">
                <p className="text-xs text-surface-500 dark:text-dark-muted">favicon.ico</p>
                <img
                  src={icoUrl}
                  alt="ICO"
                  className="mx-auto mt-1 h-8 w-8"
                />
              </div>
            )}
          </div>
          <p className="mb-2 text-xs font-medium text-surface-500 dark:text-dark-muted">
            Generated Sizes ({generatedSizes.length})
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {generatedSizes.map((gen) => (
              <div
                key={gen.size}
                className="flex flex-col items-center rounded-lg border border-surface-200 bg-white p-2 dark:border-dark-border dark:bg-dark-surface"
              >
                <img
                  src={gen.dataUrl}
                  alt={`${gen.size}x${gen.size}`}
                  className="mb-1 rounded"
                  style={{ width: Math.min(gen.size, 64), height: Math.min(gen.size, 64) }}
                />
                <span className="text-[10px] text-surface-500 dark:text-dark-muted">
                  {gen.size}x{gen.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedSizes.length > 0 && (
        <details className="rounded-lg border border-surface-200 dark:border-dark-border">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
            HTML Snippet
          </summary>
          <pre className="max-h-40 overflow-auto border-t border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {generateHTMLTags(bgColor, ALL_FAVICON_SIZES.filter((s) => selectedSizes.includes(s.size)))}
          </pre>
        </details>
      )}
    </div>
  );
}
