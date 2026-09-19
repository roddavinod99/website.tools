"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { validateFileUpload } from "@/lib/file-security";
import { useLoadExample } from "@/lib/load-example";
import { AdvancedOptions, OptionGroup, OptionRow } from "@/components/ui/advanced-options";
import { useToolUrlState } from "@/lib/url-state";

type Mode = "encode" | "decode";
type OutputFormat = "plain" | "datauri" | "base64url";
type CharEncoding = "utf-8" | "ascii" | "utf-16" | "latin-1";
type Tab = "text-encode" | "text-decode" | "image-encode" | "image-decode";

const TEXT_MIME_TYPES = ["text/plain", "application/json", "text/csv", "application/xml", "text/xml"];

function encodeChar(str: string, enc: CharEncoding): string {
  if (enc === "ascii") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "latin-1") {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c > 255) throw new Error(`Character '${str[i]}' cannot be encoded in Latin-1`);
      bytes[i] = c;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  if (enc === "utf-16") {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      bytes[i * 2] = c & 0xff;
      bytes[i * 2 + 1] = (c >> 8) & 0xff;
    }
    return btoa(String.fromCharCode(...bytes));
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeChar(str: string, enc: CharEncoding): string {
  const raw = atob(str);
  if (enc === "ascii" || enc === "latin-1") {
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return String.fromCharCode(...bytes);
  }
  if (enc === "utf-16") {
    if (raw.length % 2 !== 0) throw new Error("Invalid UTF-16 encoded base64 (odd byte count)");
    const chars: number[] = [];
    for (let i = 0; i < raw.length; i += 2)
      chars.push(raw.charCodeAt(i) | (raw.charCodeAt(i + 1) << 8));
    return String.fromCharCode(...chars);
  }
  return decodeURIComponent(escape(raw));
}

function detectImageMime(raw: string): string {
  try {
    const header = atob(raw).slice(0, 4);
    if (header.startsWith("\u0089PNG")) return "image/png";
    if (header.startsWith("\u00ff\u00d8")) return "image/jpeg";
    if (header.startsWith("RIFF")) return "image/webp";
    if (header.startsWith("GIF8")) return "image/gif";
    if (header.startsWith("BM")) return "image/bmp";
  } catch { /* ignore */ }
  return "image/png";
}

export function Base64Tool() {
  const { state, updateState } = useToolUrlState({
    mode: "encode",
    outputFormat: "plain",
    charEncoding: "utf-8",
    input: "",
  });

  const [input, setInput] = useState(() => (state.input as string) ?? "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [validationMsg, setValidationMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mode, setMode] = useState<Mode>(() => (state.mode as Mode) ?? "encode");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(() => (state.outputFormat as OutputFormat) ?? "plain");
  const [charEncoding, setCharEncoding] = useState<CharEncoding>(() => (state.charEncoding as CharEncoding) ?? "utf-8");
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const m = (state.mode as Mode) ?? "encode";
    return m === "encode" ? "text-encode" : "text-decode";
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Image -> Base64 states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUri, setImageDataUri] = useState("");
  const [imageRaw, setImageRaw] = useState("");
  const [imageMime, setImageMime] = useState("");
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Base64 -> Image states
  const [b64ImageInput, setB64ImageInput] = useState("");
  const [decodedImagePreview, setDecodedImagePreview] = useState("");
  const [decodedImageMime, setDecodedImageMime] = useState("");
  const [decodedImageError, setDecodedImageError] = useState("");

  const convert = useCallback(() => {
    setError("");
    setValidationMsg(null);
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        let encoded = encodeChar(input, charEncoding);
        if (outputFormat === "base64url") {
          encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        } else if (outputFormat === "datauri") {
          const mime = "text/plain;charset=utf-8";
          encoded = `data:${mime};base64,${encoded}`;
        }
        setOutput(encoded);
      } else {
        let cleaned = input.trim();
        if (outputFormat === "datauri") {
          const match = cleaned.match(/^data:.*?;base64,(.+)$/);
          if (!match) throw new Error("Invalid data URI format");
          cleaned = match[1];
        } else if (outputFormat === "base64url") {
          cleaned = cleaned.replace(/-/g, "+").replace(/_/g, "/");
          while (cleaned.length % 4 !== 0) cleaned += "=";
        }
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          setValidationMsg({ ok: false, text: "Input contains invalid Base64 characters" });
        } else {
          setValidationMsg({ ok: true, text: `Valid Base64 string (${cleaned.length} chars)` });
        }
        setOutput(decodeChar(cleaned, charEncoding));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, outputFormat, charEncoding]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const handleInputChange = (val: string) => {
    setInput(val);
    updateState({ input: val });
  };

  useLoadExample("base64", handleInputChange);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const downloadTxt = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBin = () => {
    if (!output) return;
    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.bin"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const validation = await validateFileUpload(file);
    if (!validation.valid) { setError(validation.error!); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setInput(result);
      setMode("decode");
      setOutputFormat("datauri");
      setActiveTab("text-decode");
      updateState({ input: result, mode: "decode", outputFormat: "datauri" });
    };
    reader.readAsDataURL(file);
  }, [updateState]);

  const handleFileUpload = useCallback(async () => {
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = ".txt,.json,.csv,.xml,text/plain,application/json,text/csv,text/xml";
    inputEl.onchange = async () => {
      const file = inputEl.files?.[0];
      if (!file) return;
      const validation = await validateFileUpload(file);
      if (!validation.valid) { setError(validation.error!); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setInput(content);
        setMode("encode");
        setActiveTab("text-encode");
        updateState({ input: content, mode: "encode" });
      };
      if (TEXT_MIME_TYPES.some((m) => file.type.includes(m.split("/")[1]))) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
        setMode("decode");
        setActiveTab("text-decode");
        setOutputFormat("datauri");
        updateState({ mode: "decode", outputFormat: "datauri" });
      }
    };
    inputEl.click();
  }, [updateState]);

  const handleDecodedFileDownload = () => {
    if (!output || mode !== "decode") return;
    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) bytes[i] = output.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "decoded.bin"; a.click();
    URL.revokeObjectURL(url);
  };

  // Image -> Base64 handlers
  const handleImageFile = useCallback(async (f: File) => {
    setImageError("");
    const validation = await validateFileUpload(f);
    if (!validation.valid) { setImageError(validation.error!); return; }
    if (!f.type.startsWith("image/")) {
      setImageError("Please upload an image file (PNG, JPG, WebP, GIF, SVG, BMP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const uri = reader.result as string;
      const raw = uri.split(",")[1] ?? "";
      setImageFile(f);
      setImageDataUri(uri);
      setImageRaw(raw);
      setImageMime(f.type || "image/png");
    };
    reader.onerror = () => setImageError("Failed to read image");
    reader.readAsDataURL(f);
  }, []);

  const handleImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await handleImageFile(file);
  }, [handleImageFile]);

  const handleImageBrowse = useCallback(async () => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = "image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/bmp,image/x-icon";
    el.onchange = async () => {
      const f = el.files?.[0];
      if (!f) return;
      await handleImageFile(f);
    };
    el.click();
  }, [handleImageFile]);

  const copyImageBase64 = async (fmt: "raw" | "datauri") => {
    const text = fmt === "raw" ? imageRaw : imageDataUri;
    if (text) await navigator.clipboard.writeText(text);
  };

  const downloadImageBase64 = (fmt: "raw" | "datauri") => {
    const text = fmt === "raw" ? imageRaw : imageDataUri;
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fmt === "raw" ? "image-base64.txt" : "image-datauri.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearImageEncode = () => {
    setImageFile(null);
    setImageDataUri("");
    setImageRaw("");
    setImageMime("");
    setImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Base64 -> Image handlers
  const handleB64ImageChange = (val: string) => {
    setB64ImageInput(val);
    setDecodedImageError("");
    if (!val.trim()) { setDecodedImagePreview(""); setDecodedImageMime(""); return; }
    try {
      const trimmed = val.trim();
      const isDataUri = trimmed.startsWith("data:");
      let raw = trimmed;
      let mime = "";
      if (isDataUri) {
        const m = trimmed.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) throw new Error("Invalid data URI format");
        mime = m[1];
        raw = m[2];
      } else {
        raw = trimmed.replace(/\s+/g, "");
        // pad base64url -> standard
        const isUrlSafe = raw.includes("-") || raw.includes("_");
        if (isUrlSafe) {
          raw = raw.replace(/-/g, "+").replace(/_/g, "/");
          while (raw.length % 4 !== 0) raw += "=";
        }
        mime = detectImageMime(raw);
      }
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) throw new Error("Invalid Base64 characters");
      // validate atob
      atob(raw);
      const preview = mime ? `data:${mime};base64,${raw}` : `data:image/png;base64,${raw}`;
      setDecodedImagePreview(preview);
      setDecodedImageMime(mime || detectImageMime(raw));
    } catch (e) {
      setDecodedImageError(e instanceof Error ? e.message : "Invalid base64 image data");
      setDecodedImagePreview("");
    }
  };

  const handleB64ImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const validation = await validateFileUpload(file);
    if (!validation.valid) { setDecodedImageError(validation.error!); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = (reader.result as string).trim();
      handleB64ImageChange(text);
    };
    reader.readAsText(file);
  }, []);

  const downloadDecodedImage = () => {
    if (!decodedImagePreview) return;
    const ext = decodedImageMime.split("/")[1] || "png";
    const a = document.createElement("a");
    a.href = decodedImagePreview;
    a.download = `decoded.${ext}`;
    a.click();
  };

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = output ? new TextEncoder().encode(output).length : 0;
  const overhead = mode === "encode" && inputSize > 0 ? ((outputSize / inputSize - 1) * 100).toFixed(1) : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "text-encode", label: "Text \u2192 Base64" },
    { id: "text-decode", label: "Base64 \u2192 Text" },
    { id: "image-encode", label: "Image \u2192 Base64" },
    { id: "image-decode", label: "Base64 \u2192 Image" },
  ];

  const switchTab = (t: Tab) => {
    setActiveTab(t);
    if (t === "text-encode") { setMode("encode"); updateState({ mode: "encode" }); }
    if (t === "text-decode") { setMode("decode"); updateState({ mode: "decode" }); }
  };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Base64 converter modes" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => switchTab(tab.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "text-encode" || activeTab === "text-decode" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {(["encode", "decode"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setActiveTab(m === "encode" ? "text-encode" : "text-decode"); setError(""); updateState({ mode: m }); }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === m && activeTab.startsWith("text-") ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
                {m === "encode" ? "Encode" : "Decode"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <label htmlFor="base64-output-format" className="sr-only">Output format</label>
            <select id="base64-output-format" value={outputFormat} onChange={(e) => { const v = e.target.value as OutputFormat; setOutputFormat(v); updateState({ outputFormat: v }); }}
              className="rounded-md border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="plain">Plain Text</option>
              <option value="datauri">Data URI</option>
              <option value="base64url">Base64url</option>
            </select>
            <label htmlFor="base64-char-encoding" className="sr-only">Character encoding</label>
            <select id="base64-char-encoding" value={charEncoding} onChange={(e) => { const v = e.target.value as CharEncoding; setCharEncoding(v); updateState({ charEncoding: v }); }}
              className="rounded-md border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="utf-8">UTF-8</option>
              <option value="ascii">ASCII</option>
              <option value="utf-16">UTF-16</option>
              <option value="latin-1">Latin-1</option>
            </select>
            <button onClick={handleFileUpload} className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
              Upload File
            </button>
          </div>

          <AdvancedOptions title="Advanced options" defaultOpen={false}>
            <OptionGroup title="Encoding & Output" description="Configure how data is encoded and formatted">
              <OptionRow columns={2}>
                <label htmlFor="base64-char-encoding-adv" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Character Encoding</label>
                <select id="base64-char-encoding-adv" value={charEncoding} onChange={(e) => { const v = e.target.value as CharEncoding; setCharEncoding(v); updateState({ charEncoding: v }); }}
                  className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <option value="utf-8">UTF-8 (default)</option>
                  <option value="ascii">ASCII</option>
                  <option value="utf-16">UTF-16</option>
                  <option value="latin-1">Latin-1</option>
                </select>

                <label htmlFor="base64-output-format-adv" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Output Format</label>
                <select id="base64-output-format-adv" value={outputFormat} onChange={(e) => { const v = e.target.value as OutputFormat; setOutputFormat(v); updateState({ outputFormat: v }); }}
                  className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <option value="plain">Plain Text</option>
                  <option value="datauri">Data URI</option>
                  <option value="base64url">Base64url (URL-safe)</option>
                </select>
              </OptionRow>
            </OptionGroup>

            <OptionGroup title="File Operations" description="Upload, drag & drop, or download files">
              <OptionRow columns={1}>
                <div onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()} className="rounded-md border-2 border-dashed border-surface-300 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:text-dark-muted">
                  <p>Drag & drop a file here</p>
                  <button onClick={handleFileUpload} className="mt-2 rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
                    Browse Files
                  </button>
                </div>
              </OptionRow>
            </OptionGroup>

            <OptionGroup title="Download Options" description="Export results in different formats">
              <OptionRow columns={3}>
                <button onClick={downloadTxt} disabled={!output} className="rounded border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Download as text file">.txt</button>
                <button onClick={downloadBin} disabled={!output} className="rounded border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Download as binary file">.bin</button>
                {mode === "decode" && (
                  <button onClick={handleDecodedFileDownload} disabled={!output} className="rounded border border-surface-200 px-3 py-1.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Save decoded file">Save Decoded</button>
                )}
              </OptionRow>
            </OptionGroup>
          </AdvancedOptions>

          <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
            <label htmlFor="base64-input" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
            </label>
            <textarea id="base64-input" value={input} onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === "encode" ? "Enter text or drop a file..." : "Enter Base64 string or drop a file..."}
              rows={5} spellCheck={false}
              className="w-full rounded-md border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            {!input && (
              <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Drag & drop a file or use Upload File button</p>
            )}
          </div>

          {validationMsg && mode === "decode" && (
            <div className={`rounded-md border p-3 ${validationMsg.ok ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"}`}>
              <p className={`text-sm ${validationMsg.ok ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                {validationMsg.text}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20" role="alert">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            <button onClick={copy} disabled={!output} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600 disabled:opacity-40" aria-label="Copy output to clipboard">Copy</button>
            <button onClick={downloadTxt} disabled={!output} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Download as text file">.txt</button>
            <button onClick={downloadBin} disabled={!output} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Download as binary file">.bin</button>
            {mode === "decode" && (
              <button onClick={handleDecodedFileDownload} disabled={!output} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Save decoded file">Save Decoded</button>
            )}
          </div>

          {output && (
            <div data-testid="tool-output">
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Output</label>
              <pre className="w-full rounded-md border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
            </div>
          )}

          {input && (
            <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
              <span>Input: {inputSize} byte{inputSize !== 1 ? "s" : ""}</span>
              <span>Output: {outputSize} byte{outputSize !== 1 ? "s" : ""}</span>
              {overhead !== null && <span className="text-accent-brand-500">+{overhead}% overhead (Base64 adds ~33%)</span>}
            </div>
          )}
        </>
      ) : activeTab === "image-encode" ? (
        <div id="panel-image-encode" role="tabpanel" aria-labelledby="tab-image-encode" className="space-y-4">
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleImageBrowse}
            className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-surface-200 bg-white p-6 hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleImageBrowse(); }}
            aria-label="Upload image to encode as Base64"
          >
            <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/bmp" className="hidden" />
            <svg className="mb-2 h-8 w-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-surface-600 dark:text-dark-text text-center">
              {imageFile ? `${imageFile.name} · ${imageMime}` : "Click or drop an image to encode"}
            </p>
            <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted text-center">PNG, JPG, GIF, WebP, SVG, BMP · 10MB max · 100% local</p>
          </div>

          {imageError && <p className="text-sm text-red-500" role="alert">{imageError}</p>}

          {imageDataUri && (
            <div data-testid="tool-output" className="space-y-3 rounded-md border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUri} alt={imageFile?.name || "Image preview"} className="max-h-32 rounded border border-surface-100 dark:border-dark-border" />
                <div className="flex-1 min-w-0 space-y-1 text-xs text-surface-500 dark:text-dark-muted">
                  <p className="text-sm font-medium text-surface-700 dark:text-dark-text truncate">{imageFile?.name}</p>
                  <p>MIME: {imageMime}</p>
                  <p>File size: {imageFile ? (imageFile.size < 1024 ? imageFile.size + " B" : imageFile.size < 1024*1024 ? (imageFile.size/1024).toFixed(1)+" KB" : (imageFile.size/1024/1024).toFixed(2)+" MB") : "—"}</p>
                  <p>Base64 chars: {imageRaw.length.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => copyImageBase64("raw")} className="rounded bg-brand-500 px-2.5 py-1 text-xs text-white hover:bg-brand-600">Copy Raw Base64</button>
                <button onClick={() => copyImageBase64("datauri")} className="rounded bg-brand-500 px-2.5 py-1 text-xs text-white hover:bg-brand-600">Copy Data URI</button>
                <button onClick={() => downloadImageBase64("raw")} className="rounded border border-surface-200 px-2.5 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Download .txt (raw)</button>
                <button onClick={clearImageEncode} className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900">Clear</button>
              </div>

              <details className="rounded-md border border-surface-200 dark:border-dark-border">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">Show raw base64</summary>
                <pre className="max-h-40 overflow-auto break-all border-t border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">{imageRaw}</pre>
              </details>
              <details className="rounded-md border border-surface-200 dark:border-dark-border">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">Show data URI</summary>
                <pre className="max-h-40 overflow-auto break-all border-t border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">{imageDataUri}</pre>
              </details>
            </div>
          )}
        </div>
      ) : (
        <div id="panel-image-decode" role="tabpanel" aria-labelledby="tab-image-decode" className="space-y-4">
          <div>
            <label htmlFor="b64-image-input" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Base64 Image String</label>
            <textarea
              id="b64-image-input"
              value={b64ImageInput}
              onChange={(e) => handleB64ImageChange(e.target.value)}
              onDrop={handleB64ImageDrop}
              onDragOver={(e) => e.preventDefault()}
              placeholder="Paste base64 (data URI or raw) — drop a .txt file too..."
              rows={5}
              spellCheck={false}
              className="w-full rounded-md border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
            />
            <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Supports plain base64 or data URI (<code className="rounded bg-surface-100 px-1 dark:bg-dark-border">data:image/png;base64,...</code>). Drag &amp; drop a text file.</p>
          </div>

          {decodedImageError && <p className="text-sm text-red-500" role="alert">{decodedImageError}</p>}

          {decodedImagePreview && (
            <div data-testid="tool-output" className="space-y-3 rounded-md border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Detected MIME: {decodedImageMime}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={decodedImagePreview} alt="Decoded preview" className="max-h-64 rounded border border-surface-200 dark:border-dark-border" />
              <div className="flex flex-wrap gap-2">
                <button onClick={downloadDecodedImage} className="rounded bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">Download Image</button>
                <button onClick={() => { setB64ImageInput(""); setDecodedImagePreview(""); setDecodedImageMime(""); setDecodedImageError(""); }} className="rounded border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Clear</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
