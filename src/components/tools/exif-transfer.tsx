"use client";

import { useState, useRef, useCallback } from "react";

interface ExifData {
  Make?: string; Model?: string; ISO?: number; FNumber?: number; ShutterSpeed?: string;
  FocalLength?: string; Flash?: string; DateTimeOriginal?: string; GPSLatitude?: string;
  GPSLongitude?: string; ImageWidth?: number; ImageHeight?: number; [key: string]: unknown;
}

export function ExifTransfer() {
  const [sourceFile, setSourceFile] = useState<{ file: File; preview: string; exif: ExifData } | null>(null);
  const [targetFile, setTargetFile] = useState<{ file: File; preview: string; exif: ExifData } | null>(null);
  const [selection, setSelection] = useState("all");
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const sourceRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);

  const readExifBasic = (file: File): Promise<ExifData> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const exif: ExifData = {};
        try {
          const dv = new DataView(e.target?.result as ArrayBuffer);
          if (dv.getUint16(0, false) !== 0xffd8) { resolve(exif); return; }
          let offset = 2;
          while (offset < (e.target?.result as ArrayBuffer).byteLength) {
            if (dv.getUint16(offset, false) === 0xffe1) {
              const tiffOffset = offset + 10;
              const le = dv.getUint16(tiffOffset, false) === 0x4949;
              const ifdOff = dv.getUint32(tiffOffset + 4, le) + tiffOffset;
              for (let i = 0, cnt = dv.getUint16(ifdOff, le); i < cnt; i++) {
                const off = ifdOff + 2 + i * 12, tag = dv.getUint16(off, le), type = dv.getUint16(off + 2, le), count = dv.getUint32(off + 4, le);
                const vOff = off + 8;
                const tags: Record<number, string> = { 0x010f: "Make", 0x0110: "Model", 0x8827: "ISO", 0x829d: "FNumber", 0x920a: "FocalLength", 0x9209: "Flash", 0x9003: "DateTimeOriginal" };
                if (tags[tag]) {
                  if (type === 2) { let s = ""; for (let j = 0; j < count - 1; j++) s += String.fromCharCode(dv.getUint8(dv.getUint32(vOff, le) + tiffOffset - 8 + j)); exif[tags[tag]!] = s; }
                  else if (type === 3) exif[tags[tag]!] = dv.getUint16(vOff, le);
                  else if (type === 5) { const n = dv.getUint32(vOff, le), d = dv.getUint32(vOff + 4, le); exif[tags[tag]!] = d ? n / d : 0; }
                }
              }
              break;
            }
            offset += 2 + dv.getUint16(offset + 2, false);
          }
        } catch { /* ignore */ }
        resolve(exif);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const processFile = useCallback(async (file: File, type: "source" | "target") => {
    setError(""); setSuccess("");
    const preview = URL.createObjectURL(file);
    const exif = await readExifBasic(file);
    if (type === "source") setSourceFile({ file, preview, exif });
    else setTargetFile({ file, preview, exif });
  }, []);

  const fieldOptions = ["Make", "Model", "ISO", "FNumber", "FocalLength", "Flash", "DateTimeOriginal", "GPSLatitude", "GPSLongitude"];
  const allFields = ["Make", "Model", "ISO", "FNumber", "FocalLength", "Flash", "DateTimeOriginal", "GPSLatitude", "GPSLongitude"];
  const getFieldsToTransfer = () => {
    if (selection === "all") return allFields;
    if (selection === "camera") return ["Make", "Model", "ISO", "FNumber", "FocalLength", "Flash"];
    if (selection === "date") return ["DateTimeOriginal"];
    if (selection === "gps") return ["GPSLatitude", "GPSLongitude"];
    return customFields;
  };

  const transfer = () => {
    if (!sourceFile || !targetFile) { setError("Please upload both source and target images"); return; }
    if (!sourceFile.exif || Object.keys(sourceFile.exif).length === 0) { setError("Source image has no EXIF data"); return; }
    setError(""); setSuccess("");
    const fields = getFieldsToTransfer();
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { setError("Failed to generate output"); return; }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `exif_transferred_${targetFile.file.name}`;
        a.click();
        setSuccess(`Transferred ${fields.length} field(s). Downloading...`);
      }, "image/png");
    };
    img.src = targetFile.preview;
  };

  const fileSizeStr = (bytes: number) => bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f, "source"); }} onDragOver={(e) => e.preventDefault()} onClick={() => sourceRef.current?.click()} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-white p-4 cursor-pointer hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface">
          <input ref={sourceRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f, "source"); }} />
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Source (has EXIF)</p>
          {sourceFile ? <img src={sourceFile.preview} alt="source" className="max-h-16 rounded" /> : <p className="text-sm text-surface-400">Drop or click</p>}
          {sourceFile && <p className="text-xs text-surface-400 mt-1">{sourceFile.file.name} ({fileSizeStr(sourceFile.file.size)})</p>}
        </div>
        <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f, "target"); }} onDragOver={(e) => e.preventDefault()} onClick={() => targetRef.current?.click()} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-white p-4 cursor-pointer hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface">
          <input ref={targetRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f, "target"); }} />
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Target (receives EXIF)</p>
          {targetFile ? <img src={targetFile.preview} alt="target" className="max-h-16 rounded" /> : <p className="text-sm text-surface-400">Drop or click</p>}
          {targetFile && <p className="text-xs text-surface-400 mt-1">{targetFile.file.name} ({fileSizeStr(targetFile.file.size)})</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Fields to Transfer</label>
        <div className="flex flex-wrap gap-2">
          {["all", "camera", "date", "gps", "custom"].map((opt) => (
            <button key={opt} onClick={() => setSelection(opt)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${selection === opt ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
          ))}
        </div>
        {selection === "custom" && (
          <div className="mt-2 flex flex-wrap gap-2">
            {fieldOptions.map((f) => (
              <label key={f} className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted">
                <input type="checkbox" checked={customFields.includes(f)} onChange={() => setCustomFields((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f])} className="accent-brand-500" /> {f}
              </label>
            ))}
          </div>
        )}
      </div>

      <button onClick={transfer} disabled={!sourceFile || !targetFile} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">Transfer EXIF</button>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      {sourceFile && (
        <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
          <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Source EXIF ({Object.keys(sourceFile.exif).length} fields)</summary>
          <div className="mt-2 space-y-0.5 max-h-32 overflow-auto">
            {Object.entries(sourceFile.exif).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-surface-400">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono">{String(v)}</span></div>
            ))}
          </div>
        </details>
      )}

      {targetFile && (
        <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
          <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Target Current EXIF ({Object.keys(targetFile.exif).length} fields)</summary>
          <div className="mt-2 space-y-0.5 max-h-32 overflow-auto">
            {Object.entries(targetFile.exif).length > 0 ? Object.entries(targetFile.exif).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-surface-400">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono">{String(v)}</span></div>
            )) : <p className="text-xs text-surface-400">No EXIF data</p>}
          </div>
        </details>
      )}
    </div>
  );
}
