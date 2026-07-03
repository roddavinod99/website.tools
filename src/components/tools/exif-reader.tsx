"use client";

import { useState, useRef, useCallback } from "react";

interface ExifData {
  Make?: string; Model?: string; Lens?: string; Software?: string;
  ISO?: number; FNumber?: number; ShutterSpeed?: string; FocalLength?: string; Flash?: string;
  DateTimeOriginal?: string; DateTimeDigitized?: string; OffsetTime?: string;
  GPSLatitude?: string; GPSLongitude?: string; GPSAltitude?: string;
  ImageWidth?: number; ImageHeight?: number; Orientation?: string; ColorSpace?: string; Compression?: string;
  [key: string]: unknown;
}

export function ExifReader() {
  const [files, setFiles] = useState<{ file: File; preview: string; exif: ExifData | null; raw: string }[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<"corrected" | "raw">("corrected");
  const fileRef = useRef<HTMLInputElement>(null);

  const readExif = (file: File): Promise<ExifData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer;
        const exif: ExifData = {};
        try {
          const dv = new DataView(data);
          if (dv.getUint16(0, false) !== 0xffd8) { resolve(exif); return; }
          let offset = 2;
          while (offset < data.byteLength) {
            if (dv.getUint16(offset, false) === 0xffe1) {
              const tiffOffset = offset + 10;
              const littleEndian = dv.getUint16(tiffOffset, false) === 0x4949;
              const ifdOffset = dv.getUint32(tiffOffset + 4, littleEndian) + tiffOffset;
              const tagCount = dv.getUint16(ifdOffset, littleEndian);
              const tags: Record<number, string> = {
                0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x0132: "DateTimeDigitized",
                0x013b: "Software", 0x829a: "ShutterSpeed", 0x829d: "FNumber",
                0x8827: "ISO", 0x920a: "FocalLength", 0x9209: "Flash",
                0x9003: "DateTimeOriginal", 0x9011: "OffsetTime", 0xa002: "ImageWidth", 0xa003: "ImageHeight",
              };
              for (let i = 0; i < tagCount; i++) {
                const tagOffset = ifdOffset + 2 + i * 12;
                const tag = dv.getUint16(tagOffset, littleEndian);
                const type = dv.getUint16(tagOffset + 2, littleEndian);
                const count = dv.getUint32(tagOffset + 4, littleEndian);
                const valueOffset = tagOffset + 8;
                if (tags[tag]) {
                  if (type === 2) {
                    const strOff = dv.getUint32(valueOffset, littleEndian) + tiffOffset - 8;
                    exif[tags[tag]!] = "";
                    for (let j = 0; j < count - 1; j++) {
                      exif[tags[tag]!]! += String.fromCharCode(dv.getUint8(strOff + j));
                    }
                  } else if (type === 3) {
                    exif[tags[tag]!] = dv.getUint16(valueOffset, littleEndian);
                  } else if (type === 4 || type === 9) {
                    exif[tags[tag]!] = dv.getUint32(valueOffset, littleEndian);
                  } else if (type === 5) {
                    const num = dv.getUint32(valueOffset, littleEndian);
                    const den = dv.getUint32(valueOffset + 4, littleEndian);
                    exif[tags[tag]!] = den ? num / den : 0;
                  } else if (type === 10) {
                    const num = dv.getInt32(valueOffset, littleEndian);
                    const den = dv.getInt32(valueOffset + 4, littleEndian);
                    if (tags[tag] === "ShutterSpeed") {
                      exif["ShutterSpeed"] = `1/${Math.round(Math.pow(2, num / den))}`;
                    }
                  }
                }
              }
              break;
            }
            offset += 2 + dv.getUint16(offset + 2, false);
          }
        } catch { /* ignore parse errors */ }
        resolve(exif);
      };
      reader.onerror = () => reject(new Error("Failed to read"));
      reader.readAsArrayBuffer(file);
    });
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Not an image"); return; }
    setError("");
    const preview = URL.createObjectURL(file);
    const exif = await readExif(file);
    setFiles((prev) => [...prev, { file, preview, exif, raw: JSON.stringify(exif, null, 2) }]);
  }, []);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(processFile); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { Array.from(e.target.files ?? []).forEach(processFile); };

  const copyAll = async (format: "json" | "csv") => {
    const all = files.map((f) => format === "json" ? JSON.stringify(f.exif, null, 2) : Object.entries(f.exif ?? {}).map(([k, v]) => `${k},"${v}"`).join("\n")).join("\n\n");
    await navigator.clipboard.writeText(all);
  };

  const exportJson = (index: number) => {
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(files[index]?.exif, null, 2));
    a.download = `${files[index]?.file.name ?? "exif"}.json`;
    a.click();
  };

  const stripExif = (index: number) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${files[index]?.file.name?.replace(/\.[^.]+$/, "") ?? "stripped"}.png`;
        a.click();
      }, "image/png");
    };
    img.src = files[index]!.preview;
  };

  const anonymizeGps = (index: number) => {
    setFiles((prev) => prev.map((f, i) => i === index ? { ...f, exif: { ...f.exif, GPSLatitude: undefined, GPSLongitude: undefined, GPSAltitude: undefined }, raw: JSON.stringify({ ...f.exif, GPSLatitude: undefined, GPSLongitude: undefined, GPSAltitude: undefined }, null, 2) } : f));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => { const n = [...prev]; URL.revokeObjectURL(n[index]!.preview); n.splice(index, 1); return n; });
  };

  const ExifSection = ({ title, data }: { title: string; data: Record<string, string | number | undefined> }) => {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== "");
    if (!entries.length) return null;
    return (
      <div>
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider dark:text-dark-muted mb-1">{title}</p>
        <div className="space-y-0.5">
          {entries.map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs"><span className="text-surface-400 dark:text-dark-muted">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono">{String(v)}</span></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-white p-6 cursor-pointer hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        <svg className="w-8 h-8 text-surface-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">Drop images here to read EXIF</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button onClick={() => setView((v) => (v === "corrected" ? "raw" : "corrected"))} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">View: {view === "corrected" ? "Corrected" : "Raw"}</button>
      </div>

      {files.map((f, idx) => (
        <div key={idx} className="rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-text truncate">{f.file.name}</p>
            <div className="flex gap-1">
              <button onClick={() => copyAll("json")} className="text-xs text-brand-500 hover:text-brand-600">Copy JSON</button>
              <button onClick={() => copyAll("csv")} className="text-xs text-brand-500 hover:text-brand-600">Copy CSV</button>
              <button onClick={() => exportJson(idx)} className="text-xs text-brand-500 hover:text-brand-600">Export .json</button>
              <button onClick={() => stripExif(idx)} className="text-xs text-red-500 hover:text-red-600">Strip EXIF</button>
              <button onClick={() => anonymizeGps(idx)} className="text-xs text-orange-500 hover:text-orange-600">Anonymize GPS</button>
              <button onClick={() => removeFile(idx)} className="text-xs text-surface-400 hover:text-surface-600">Remove</button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <img src={f.preview} alt={f.file.name} className="max-h-40 rounded border border-surface-100 dark:border-dark-border" />
            {f.exif && Object.keys(f.exif).length > 0 ? (
              <div className="flex-1 space-y-2 max-h-60 overflow-auto">
                <ExifSection title="Camera" data={{ Make: f.exif.Make, Model: f.exif.Model, Lens: f.exif.Lens, Software: f.exif.Software }} />
                <ExifSection title="Photo Settings" data={{ ISO: f.exif.ISO, "F-Number": f.exif.FNumber, Shutter: f.exif.ShutterSpeed, "Focal Length": f.exif.FocalLength, Flash: f.exif.Flash }} />
                <ExifSection title="Date/Time" data={{ "Date Taken": f.exif.DateTimeOriginal, Digitized: f.exif.DateTimeDigitized, "Time Offset": f.exif.OffsetTime }} />
                <ExifSection title="GPS" data={{ Latitude: f.exif.GPSLatitude, Longitude: f.exif.GPSLongitude, Altitude: f.exif.GPSAltitude }} />
                <ExifSection title="Image" data={{ Width: f.exif.ImageWidth, Height: f.exif.ImageHeight, Orientation: f.exif.Orientation, "Color Space": f.exif.ColorSpace, Compression: f.exif.Compression }} />
              </div>
            ) : (
              <p className="text-sm text-surface-400 dark:text-dark-muted">No EXIF data found</p>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-surface-400 dark:text-dark-muted">
            <span>Size: {(f.file.size / 1024).toFixed(1)} KB</span>
            <span>Type: {f.file.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
