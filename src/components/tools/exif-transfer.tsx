"use client";

import { useState, useRef, useCallback } from "react";

interface ExifData {
  Make?: string; Model?: string; Lens?: string; Software?: string;
  ISO?: number; FNumber?: number; ShutterSpeed?: string; FocalLength?: string; Flash?: string;
  ExposureProgram?: string; MeteringMode?: string; WhiteBalance?: string;
  DateTimeOriginal?: string; DateTimeDigitized?: string; OffsetTime?: string;
  GPSLatitude?: string; GPSLongitude?: string; GPSAltitude?: string;
  GPSLatitudeRef?: string; GPSLongitudeRef?: string; GPSAltitudeRef?: string;
  ImageWidth?: number; ImageHeight?: number; Orientation?: string;
  ColorSpace?: string; Compression?: string;
  [key: string]: unknown;
}

export function ExifTransfer() {
  const [sourceFile, setSourceFile] = useState<{ file: File; preview: string; exif: ExifData; rawSize: number } | null>(null);
  const [targetFile, setTargetFile] = useState<{ file: File; preview: string; exif: ExifData; rawSize: number } | null>(null);
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
          const data = e.target?.result as ArrayBuffer;
          while (offset < data.byteLength) {
            if (dv.getUint16(offset, false) === 0xffe1) {
              const tiffOffset = offset + 10;
              const le = dv.getUint16(tiffOffset, false) === 0x4949;
              const ifdOff = dv.getUint32(tiffOffset + 4, le) + tiffOffset;

              const IFD_TAGS: Record<number, string> = {
                0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x0132: "DateTimeDigitized",
                0x013b: "Software", 0x0213: "YCbCrPositioning",
                0x829a: "ShutterSpeed", 0x829d: "FNumber",
                0x8827: "ISO", 0x920a: "FocalLength", 0x9209: "Flash",
                0x9207: "MeteringMode", 0x8822: "ExposureProgram", 0xa403: "WhiteBalance",
                0x9003: "DateTimeOriginal", 0x9011: "OffsetTime",
                0xa002: "ImageWidth", 0xa003: "ImageHeight",
                0xa20e: "FocalPlaneXResolution", 0xa20f: "FocalPlaneYResolution",
                0xa405: "FocalLengthIn35mm",
                0x011a: "XResolution", 0x011b: "YResolution", 0x0128: "ResolutionUnit",
              };

              const GPS_TAGS: Record<number, string> = {
                0x0000: "GPSLatitudeRef", 0x0001: "GPSLatitude", 0x0002: "GPSLongitudeRef",
                0x0003: "GPSLongitude", 0x0005: "GPSAltitudeRef", 0x0006: "GPSAltitude",
                0x0007: "GPSTimeStamp",
              };

              for (let i = 0, cnt = dv.getUint16(ifdOff, le); i < cnt; i++) {
                const off = ifdOff + 2 + i * 12;
                const tag = dv.getUint16(off, le);
                const type = dv.getUint16(off + 2, le);
                const count = dv.getUint32(off + 4, le);
                const vOff = off + 8;
                const name = IFD_TAGS[tag];
                if (!name) continue;
                if (type === 2) {
                  let s = "";
                  for (let j = 0; j < count - 1; j++)
                    s += String.fromCharCode(dv.getUint8(dv.getUint32(vOff, le) + tiffOffset - 8 + j));
                  exif[name] = s;
                } else if (type === 3) exif[name] = dv.getUint16(vOff, le);
                else if (type === 4) exif[name] = dv.getUint32(vOff, le);
                else if (type === 5) {
                  const n = dv.getUint32(vOff, le), d = dv.getUint32(vOff + 4, le);
                  exif[name] = d ? +(n / d).toFixed(4) : 0;
                } else if (type === 10 && tag === 0x829a) {
                  const n = dv.getInt32(vOff, le), d = dv.getInt32(vOff + 4, le);
                  exif["ShutterSpeed"] = `1/${Math.round(Math.pow(2, n / d))}`;
                }
              }

              const gpsOffset = dv.getUint32(ifdOff + 2 + dv.getUint16(ifdOff, le) * 12, le);
              if (gpsOffset) {
                const gpsIfd = gpsOffset + tiffOffset;
                for (let i = 0, cnt = dv.getUint16(gpsIfd, le); i < cnt; i++) {
                  const off = gpsIfd + 2 + i * 12;
                  const tag = dv.getUint16(off, le);
                  const type = dv.getUint16(off + 2, le);
                  const count = dv.getUint32(off + 4, le);
                  const vOff = off + 8;
                  const name = GPS_TAGS[tag];
                  if (!name) continue;
                  if (type === 2) {
                    let s = "";
                    for (let j = 0; j < count - 1; j++)
                      s += String.fromCharCode(dv.getUint8(dv.getUint32(vOff, le) + tiffOffset - 8 + j));
                    exif[name] = s;
                  } else if (type === 5 && count === 3) {
                    const v1 = dv.getUint32(vOff, le) / dv.getUint32(vOff + 4, le);
                    const v2 = dv.getUint32(vOff + 8, le) / dv.getUint32(vOff + 12, le);
                    const v3 = dv.getUint32(vOff + 16, le) / dv.getUint32(vOff + 20, le);
                    if (tag === 0x0001) exif["GPSLatitude"] = `${Math.floor(v1)},${Math.floor(v2)},${v3.toFixed(2)}`;
                    else if (tag === 0x0003) exif["GPSLongitude"] = `${Math.floor(v1)},${Math.floor(v2)},${v3.toFixed(2)}`;
                  } else if (type === 1) {
                    exif[name] = dv.getUint8(vOff);
                  }
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
    const entry = { file, preview, exif, rawSize: file.size };
    if (type === "source") setSourceFile(entry);
    else setTargetFile(entry);
  }, []);

  const fieldOptions = ["Make", "Model", "ISO", "FNumber", "FocalLength", "Flash", "DateTimeOriginal", "GPSLatitude", "GPSLongitude", "Orientation", "ShutterSpeed", "ExposureProgram", "MeteringMode", "WhiteBalance"];

  const allFieldNames: (keyof ExifData)[] = [
    "Make", "Model", "ISO", "FNumber", "FocalLength", "Flash", "DateTimeOriginal",
    "GPSLatitude", "GPSLongitude", "GPSAltitude", "GPSLatitudeRef", "GPSLongitudeRef", "GPSAltitudeRef",
    "Orientation", "ShutterSpeed", "ExposureProgram", "MeteringMode", "WhiteBalance",
    "Software", "DateTimeDigitized", "OffsetTime",
  ];

  const getFieldsToTransfer = (): (keyof ExifData)[] => {
    if (selection === "all") return allFieldNames;
    if (selection === "camera") return ["Make", "Model", "ISO", "FNumber", "FocalLength", "Flash", "ShutterSpeed", "ExposureProgram", "MeteringMode", "WhiteBalance"];
    if (selection === "date") return ["DateTimeOriginal", "DateTimeDigitized", "OffsetTime"];
    if (selection === "gps") return ["GPSLatitude", "GPSLongitude", "GPSAltitude", "GPSLatitudeRef", "GPSLongitudeRef", "GPSAltitudeRef"];
    if (selection === "orientation") return ["Orientation"];
    return customFields as (keyof ExifData)[];
  };

  const transfer = () => {
    if (!sourceFile || !targetFile) { setError("Please upload both source and target images"); return; }
    if (!sourceFile.exif || Object.keys(sourceFile.exif).length === 0) { setError("Source image has no EXIF data"); return; }
    setError(""); setSuccess("");
    const fields = getFieldsToTransfer();
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const ext = targetFile.file.name.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase() || "png";
      const mimeType = ext === "jpg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) { setError("Failed to generate output"); return; }
          const fieldInfo = fields.filter((f) => sourceFile.exif[f] !== undefined);
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          const baseName = targetFile.file.name.replace(/\.[^.]+$/, "");
          a.download = `${baseName}_with_exif.${ext === "jpeg" ? "jpg" : ext}`;
          a.click();
          setSuccess(`Transferred ${fieldInfo.length} EXIF field(s) from source. Image saved as ${a.download}`);
        },
        mimeType,
        1.0
      );
    };
    img.src = targetFile.preview;
  };

  const clearAll = () => {
    if (sourceFile) URL.revokeObjectURL(sourceFile.preview);
    if (targetFile) URL.revokeObjectURL(targetFile.preview);
    setSourceFile(null);
    setTargetFile(null);
    setError("");
    setSuccess("");
  };

  const fileSizeStr = (bytes: number) => bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f, "source"); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => sourceRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-brand-400 transition-colors ${
            sourceFile ? "border-green-400 bg-green-50/30 dark:bg-green-500/5" : "border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
          }`}
        >
          <input ref={sourceRef} type="file" accept="image/jpeg,image/png,image/webp,image/tiff" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f, "source"); }} />
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Source (has EXIF data)</p>
          {sourceFile ? (
            <>
              <img src={sourceFile.preview} alt="source" className="max-h-16 rounded" />
              <p className="text-xs text-surface-400 mt-1 truncate max-w-full">{sourceFile.file.name} ({fileSizeStr(sourceFile.file.size)})</p>
              <p className="text-xs text-green-600 mt-0.5">{Object.keys(sourceFile.exif).length} EXIF fields</p>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-surface-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-surface-400">Drop or click to upload</p>
              <p className="text-xs text-surface-400">JPEG, PNG, WebP, TIFF</p>
            </>
          )}
        </div>
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f, "target"); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => targetRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-brand-400 transition-colors ${
            targetFile ? "border-brand-500 bg-brand-50/30 dark:bg-brand-500/5" : "border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
          }`}
        >
          <input ref={targetRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f, "target"); }} />
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Target (receives EXIF)</p>
          {targetFile ? (
            <>
              <img src={targetFile.preview} alt="target" className="max-h-16 rounded" />
              <p className="text-xs text-surface-400 mt-1 truncate max-w-full">{targetFile.file.name} ({fileSizeStr(targetFile.file.size)})</p>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-surface-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-surface-400">Drop or click to upload</p>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Fields to Transfer</label>
        <div className="flex flex-wrap gap-2">
          {["all", "camera", "date", "gps", "orientation", "custom"].map((opt) => (
            <button key={opt} onClick={() => setSelection(opt)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selection === opt ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface"}`}>{opt === "orientation" ? "Orientation" : opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
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

      <div className="flex flex-wrap gap-2">
        <button onClick={transfer} disabled={!sourceFile || !targetFile} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">Transfer EXIF</button>
        {(sourceFile || targetFile) && (
          <button onClick={clearAll} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text transition-colors">Clear All</button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      {sourceFile && (
        <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
          <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Source EXIF ({Object.keys(sourceFile.exif).length} fields)</summary>
          <div className="mt-2 space-y-0.5 max-h-48 overflow-auto">
            {Object.keys(sourceFile.exif).length > 0 ? Object.entries(sourceFile.exif).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-surface-400">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono">{String(v)}</span></div>
            )) : <p className="text-xs text-surface-400">No EXIF data found</p>}
          </div>
        </details>
      )}

      {targetFile && (
        <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
          <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Target Current EXIF ({Object.keys(targetFile.exif).length} fields)</summary>
          <div className="mt-2 space-y-0.5 max-h-48 overflow-auto">
            {Object.keys(targetFile.exif).length > 0 ? Object.entries(targetFile.exif).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-surface-400">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono">{String(v)}</span></div>
            )) : <p className="text-xs text-surface-400">No EXIF data</p>}
          </div>
        </details>
      )}
    </div>
  );
}
