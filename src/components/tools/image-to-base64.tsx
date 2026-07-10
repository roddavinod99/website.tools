"use client";

import { useState, useRef, useCallback } from "react";

type OutputFormat = "raw" | "datauri" | "html" | "css";

const INPUT_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/bmp,image/x-icon,image/vnd.microsoft.icon";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ImageToBase64() {
  const [images, setImages] = useState<{ file: File; dataUri: string; raw: string; base64url: string; mime: string; size: number }[]>([]);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodedPreview, setDecodedPreview] = useState("");
  const [decodedMime, setDecodedMime] = useState("");
  const [error, setError] = useState("");
  const [maxWidth, setMaxWidth] = useState(1920);
  const [resize, setResize] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("raw");
  const fileRef = useRef<HTMLInputElement>(null);

  const resizeImage = (dataUri: string, maxW: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL());
      };
      img.src = dataUri;
    });
  };

  const processFile = useCallback(async (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
      setError("Unsupported format. Use PNG, JPG, GIF, WebP, SVG, BMP, or ICO");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 10MB limit");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      let dataUri = e.target?.result as string;
      if (resize) {
        dataUri = await resizeImage(dataUri, maxWidth);
      }
      const raw = dataUri.split(",")[1] ?? "";
      const base64url = raw.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      setImages((prev) => [...prev, { file, dataUri, raw, base64url, mime: file.type, size: raw.length }]);
    };
    reader.readAsDataURL(file);
  }, [resize, maxWidth]);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(processFile); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { Array.from(e.target.files ?? []).forEach(processFile); };

  const formatOutput = (entry: { raw: string; dataUri: string; mime: string }, fmt: OutputFormat): string => {
    switch (fmt) {
      case "raw": return entry.raw;
      case "datauri": return entry.dataUri;
      case "html": return `<img src="${entry.dataUri}" alt="Base64 Image" />`;
      case "css": return `background-image: url("${entry.dataUri}");`;
      default: return entry.raw;
    }
  };

  const copy = async (text: string) => { if (text) await navigator.clipboard.writeText(text); };

  const download = (content: string, filename: string) => {
    const a = document.createElement("a");
    a.href = content.startsWith("data:") ? content : "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    a.download = filename;
    a.click();
  };

  const decodeBase64 = () => {
    try {
      const raw = decodeInput.replace(/^data:.+;base64,/, "").replace(/-/g, "+").replace(/_/g, "/");
      const mime = decodeInput.startsWith("data:") ? decodeInput.split(";")[0]!.split(":")[1]! : detectMime(raw);
      setDecodedMime(mime);
      setDecodedPreview(`data:${mime};base64,${raw}`);
      setError("");
    } catch { setError("Invalid base64 string"); setDecodedPreview(""); }
  };

  const detectMime = (raw: string): string => {
    const header = atob(raw).slice(0, 4);
    if (header.startsWith("\u0089PNG")) return "image/png";
    if (header.startsWith("\u00ff\u00d8")) return "image/jpeg";
    if (header.startsWith("RIFF")) return "image/webp";
    if (header.startsWith("GIF8")) return "image/gif";
    if (header.startsWith("BM")) return "image/bmp";
    if (header.startsWith("<svg") || header.startsWith("<?xml")) return "image/svg+xml";
    return "image/png";
  };

  const clear = () => { setImages([]); setDecodeInput(""); setDecodedPreview(""); setDecodedMime(""); setError(""); if (fileRef.current) fileRef.current.value = ""; };

  const handleDecodeInput = (val: string) => {
    setDecodeInput(val);
    if (!val) { setDecodedPreview(""); setDecodedMime(""); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode("encode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "encode" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Encode Image</button>
        <button onClick={() => setMode("decode")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "decode" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Decode Base64</button>
      </div>

      {mode === "encode" ? (
        <>
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-white p-6 cursor-pointer hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface">
            <input ref={fileRef} type="file" accept={INPUT_ACCEPT} multiple className="hidden" onChange={handleFileChange} />
            <svg className="w-8 h-8 text-surface-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-sm text-surface-500 dark:text-dark-muted">Click or drop images here</p>
            <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">PNG, JPG, GIF, WebP, SVG, BMP, ICO &middot; Max 10MB</p>
          </div>

          <label className="flex flex-wrap items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
            <input type="checkbox" checked={resize} onChange={(e) => setResize(e.target.checked)} className="accent-brand-500" />
            Resize to max width:
            <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(+e.target.value)} disabled={!resize} className="w-20 rounded border border-surface-200 bg-white px-2 py-1 text-sm dark:border-dark-border dark:bg-dark-surface" />
            px (maintains aspect ratio)
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-surface-500 dark:text-dark-muted">Output Format:</label>
              {(["raw", "datauri", "html", "css"] as OutputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    outputFormat === fmt
                      ? "bg-brand-500 text-white"
                      : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text"
                  }`}
                >
                  {fmt === "raw" ? "Raw Base64" : fmt === "datauri" ? "Data URI" : fmt === "html" ? "HTML img" : "CSS background"}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-4">
            {images.map((img, i) => (
              <div key={i} className="rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
                <div className="flex gap-4">
                  <img src={img.dataUri} alt={img.file.name} className="max-h-32 rounded border border-surface-100 dark:border-dark-border" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-surface-700 dark:text-dark-text truncate">{img.file.name}</p>
                    <p className="text-xs text-surface-500 dark:text-dark-muted">MIME: {img.mime}</p>
                    <p className="text-xs text-surface-500 dark:text-dark-muted">File size: {formatFileSize(img.file.size)}</p>
                    <p className="text-xs text-surface-500 dark:text-dark-muted">Base64 chars: {img.raw.length.toLocaleString()}</p>
                    <p className="text-xs text-surface-500 dark:text-dark-muted">Size after encoding: {formatFileSize(img.raw.length)}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => copy(formatOutput(img, "raw"))} className={`rounded px-2.5 py-1 text-xs text-white hover:bg-brand-600 ${outputFormat === "raw" ? "bg-brand-500" : "bg-surface-400"}`}>Copy Raw</button>
                  <button onClick={() => copy(formatOutput(img, "datauri"))} className={`rounded px-2.5 py-1 text-xs text-white hover:bg-brand-600 ${outputFormat === "datauri" ? "bg-brand-500" : "bg-surface-400"}`}>Copy Data URI</button>
                  <button onClick={() => copy(formatOutput(img, "html"))} className={`rounded px-2.5 py-1 text-xs text-white hover:bg-brand-600 ${outputFormat === "html" ? "bg-brand-500" : "bg-surface-400"}`}>Copy HTML img</button>
                  <button onClick={() => copy(formatOutput(img, "css"))} className={`rounded px-2.5 py-1 text-xs text-white hover:bg-brand-600 ${outputFormat === "css" ? "bg-brand-500" : "bg-surface-400"}`}>Copy CSS</button>
                  <button onClick={() => download(formatOutput(img, outputFormat), `${img.file.name}.txt`)} className="rounded border border-surface-200 px-2.5 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Download</button>
                  <button onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900">Remove</button>
                </div>
                <details className="mt-2">
                  <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-600 dark:hover:text-dark-muted">Show {outputFormat === "raw" ? "raw base64" : outputFormat === "datauri" ? "data URI" : outputFormat === "html" ? "HTML" : "CSS"}</summary>
                  <code className="mt-1 block max-h-20 overflow-auto break-all rounded bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:bg-dark-surface/50 dark:text-dark-text">{formatOutput(img, outputFormat)}</code>
                </details>
              </div>
            ))}
          </div>

          {images.length > 0 && (
            <button onClick={clear} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Clear All ({images.length})</button>
          )}
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Paste Base64 String</label>
            <textarea value={decodeInput} onChange={(e) => handleDecodeInput(e.target.value)} placeholder="Paste base64 (data URI or raw)..." rows={4} className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <button onClick={decodeBase64} disabled={!decodeInput} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">Decode</button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {decodedPreview && (
            <div className="space-y-2">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Detected format: {decodedMime}</p>
              <img src={decodedPreview} alt="Decoded" className="max-h-48 rounded-lg border border-surface-200 dark:border-dark-border" />
              <div className="flex gap-2">
                <button onClick={() => download(decodedPreview, `decoded.${decodedMime.split("/")[1]}`)} className="rounded bg-brand-500 px-2.5 py-1 text-xs text-white hover:bg-brand-600">Download Image</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
