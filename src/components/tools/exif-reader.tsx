"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateFileSize } from "@/lib/file-security";

interface ExifData {
  Make?: string; Model?: string; Lens?: string; Software?: string;
  ISO?: number; FNumber?: number; ShutterSpeed?: string; FocalLength?: string; Flash?: string; ExposureProgram?: string; MeteringMode?: string; WhiteBalance?: string;
  DateTimeOriginal?: string; DateTimeDigitized?: string; OffsetTime?: string;
  GPSLatitude?: string; GPSLongitude?: string; GPSAltitude?: string; GPSLatitudeRef?: string; GPSLongitudeRef?: string;
  ImageWidth?: number; ImageHeight?: number; Orientation?: string; ColorSpace?: string; Compression?: string; ResolutionUnit?: string; XResolution?: number; YResolution?: number;
  Format?: string;
  [key: string]: unknown;
}

type TabKey = "camera" | "settings" | "gps" | "timestamps" | "raw";

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/tiff", "image/heic", "image/x-canon-cr2", "image/x-nikon-nef", "image/x-sony-arw"];

const FORMAT_NAMES: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/tiff": "TIFF",
  "image/heic": "HEIC",
  "image/x-canon-cr2": "RAW (CR2)",
  "image/x-nikon-nef": "RAW (NEF)",
  "image/x-sony-arw": "RAW (ARW)",
};

function formatGPSCoordinate(value: string | undefined, ref?: string): string {
  if (!value) return "";
  const parts = value.split(",").map((s) => s.trim());
  if (parts.length === 3) {
    return `${parts[0]}°${parts[1]}'${parts[2]}"${ref || ""}`;
  }
  return `${value}${ref || ""}`;
}

export function ExifReader() {
  const [files, setFiles] = useState<{ file: File; preview: string; exif: ExifData | null; raw: string }[]>([]);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("camera");
  const fileRef = useRef<HTMLInputElement>(null);

  const readExif = (file: File): Promise<ExifData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer;
        const exif: ExifData = {};
        try {
          const dv = new DataView(data);
          if (dv.getUint16(0, false) !== 0xffd8) {
            if (file.type === "image/png") {
              const pngText = new TextDecoder().decode(data.slice(0, Math.min(data.byteLength, 100)));
              if (pngText.includes("tEXt") || pngText.includes("iTXt") || pngText.includes("zTXt")) {
                exif["Format"] = "PNG with text chunks";
              }
            }
            resolve(exif);
            return;
          }
          let offset = 2;
          while (offset < data.byteLength) {
            if (dv.getUint16(offset, false) === 0xffe1) {
              const tiffOffset = offset + 10;
              const littleEndian = dv.getUint16(tiffOffset, false) === 0x4949;
              const ifdOffset = dv.getUint32(tiffOffset + 4, littleEndian) + tiffOffset;
              const tagCount = dv.getUint16(ifdOffset, littleEndian);
              const tags: Record<number, string> = {
                0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x0132: "DateTimeDigitized",
                0x013b: "Software", 0x0213: "YCbCrPositioning", 0x829a: "ShutterSpeed", 0x829d: "FNumber",
                0x8827: "ISO", 0x920a: "FocalLength", 0x9209: "Flash", 0x9207: "MeteringMode",
                0x9003: "DateTimeOriginal", 0x9011: "OffsetTime", 0xa002: "ImageWidth", 0xa003: "ImageHeight",
                0xa20e: "FocalPlaneXResolution", 0xa20f: "FocalPlaneYResolution",
                0xa405: "FocalLengthIn35mm", 0xa432: "LensSpec",
                0x8822: "ExposureProgram", 0xa403: "WhiteBalance",
                0x011a: "XResolution", 0x011b: "YResolution", 0x0128: "ResolutionUnit",
                0x013e: "WhitePoint", 0x013f: "PrimaryChromaticities",
              };
              const gpsTags: Record<number, string> = {
                0x0000: "GPSLatitudeRef", 0x0001: "GPSLatitude", 0x0002: "GPSLongitudeRef",
                0x0003: "GPSLongitude", 0x0005: "GPSAltitudeRef", 0x0006: "GPSAltitude",
                0x0007: "GPSTimeStamp", 0x0008: "GPSSatellites", 0x0010: "GPSImgDirection",
                0x0011: "GPSImgDirectionRef",
              };

              for (let i = 0; i < tagCount; i++) {
                const tagOffset = ifdOffset + 2 + i * 12;
                const tag = dv.getUint16(tagOffset, littleEndian);
                const type = dv.getUint16(tagOffset + 2, littleEndian);
                const count = dv.getUint32(tagOffset + 4, littleEndian);
                const valueOffset = tagOffset + 8;
                const name = tags[tag];
                if (name) {
                  if (type === 2) {
                    const strOff = dv.getUint32(valueOffset, littleEndian) + tiffOffset - 8;
                    let s = "";
                    for (let j = 0; j < count - 1; j++) s += String.fromCharCode(dv.getUint8(strOff + j));
                    exif[name] = s;
                  } else if (type === 3) {
                    exif[name] = dv.getUint16(valueOffset, littleEndian);
                  } else if (type === 4 || type === 9) {
                    exif[name] = dv.getUint32(valueOffset, littleEndian);
                  } else if (type === 5) {
                    const num = dv.getUint32(valueOffset, littleEndian);
                    const den = dv.getUint32(valueOffset + 4, littleEndian);
                    exif[name] = den ? +(num / den).toFixed(4) : 0;
                  } else if (type === 10) {
                    const num = dv.getInt32(valueOffset, littleEndian);
                    const den = dv.getInt32(valueOffset + 4, littleEndian);
                    if (tag === 0x829a) {
                      exif["ShutterSpeed"] = `1/${Math.round(Math.pow(2, num / den))}`;
                    }
                  }
                }
              }

              const gpsOffset = dv.getUint32(ifdOffset + 2 + tagCount * 12, littleEndian);
              if (gpsOffset) {
                const gpsIfd = gpsOffset + tiffOffset;
                const gpsCount = dv.getUint16(gpsIfd, littleEndian);
                for (let i = 0; i < gpsCount; i++) {
                  const tagOffset = gpsIfd + 2 + i * 12;
                  const tag = dv.getUint16(tagOffset, littleEndian);
                  const type = dv.getUint16(tagOffset + 2, littleEndian);
                  const count = dv.getUint32(tagOffset + 4, littleEndian);
                  const valOff = tagOffset + 8;
                  const name = gpsTags[tag];
                  if (!name) continue;
                  if (type === 2) {
                    const strOff = dv.getUint32(valOff, littleEndian) + tiffOffset - 8;
                    let s = "";
                    for (let j = 0; j < count - 1; j++) s += String.fromCharCode(dv.getUint8(strOff + j));
                    exif[name] = s;
                  } else if (type === 5 && count === 3) {
                    const lat1 = dv.getUint32(valOff, littleEndian) / dv.getUint32(valOff + 4, littleEndian);
                    const lat2 = dv.getUint32(valOff + 8, littleEndian) / dv.getUint32(valOff + 12, littleEndian);
                    const lat3 = dv.getUint32(valOff + 16, littleEndian) / dv.getUint32(valOff + 20, littleEndian);
                    if (tag === 0x0001) exif["GPSLatitude"] = `${Math.floor(lat1)},${Math.floor(lat2)},${lat3.toFixed(2)}`;
                    else if (tag === 0x0003) exif["GPSLongitude"] = `${Math.floor(lat1)},${Math.floor(lat2)},${lat3.toFixed(2)}`;
                  } else if (type === 1) {
                    exif[name] = dv.getUint8(valOff);
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

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Not an image"); return; }
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { setError(sizeCheck.error!); return; }
    setError("");
    setWarning("");

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setWarning(`Format "${file.type}" may not be fully supported. EXIF parsing works best with JPEG.`);
    }

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
    setFiles((prev) => prev.map((f, i) => i === index ? { ...f, exif: { ...f.exif, GPSLatitude: undefined, GPSLongitude: undefined, GPSAltitude: undefined, GPSLatitudeRef: undefined, GPSLongitudeRef: undefined }, raw: JSON.stringify({ ...f.exif, GPSLatitude: undefined, GPSLongitude: undefined, GPSAltitude: undefined, GPSLatitudeRef: undefined, GPSLongitudeRef: undefined }, null, 2) } : f));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => { const n = [...prev]; URL.revokeObjectURL(n[index]!.preview); n.splice(index, 1); return n; });
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "camera", label: "Camera Info" },
    { key: "settings", label: "Photo Settings" },
    { key: "gps", label: "GPS" },
    { key: "timestamps", label: "Timestamps" },
    { key: "raw", label: "Raw Metadata" },
  ];

  const getTabData = (exif: ExifData | null, tab: TabKey): [string, string | number | undefined][] => {
    if (!exif) return [];
    const all = exif as unknown as Record<string, string | number | undefined>;
    switch (tab) {
      case "camera":
        return Object.entries({
          Make: all.Make, Model: all.Model, Lens: all.Lens, Software: all.Software,
          "Focal Length (35mm)": all.FocalLengthIn35mm, Orientation: all.Orientation,
        }).filter(([, v]) => v !== undefined && v !== "");
      case "settings":
        return Object.entries({
          ISO: all.ISO, "F-Number": all.FNumber, Shutter: all.ShutterSpeed,
          "Focal Length": all.FocalLength, Flash: all.Flash,
          "Exposure Program": all.ExposureProgram, "Metering Mode": all.MeteringMode,
          "White Balance": all.WhiteBalance,
        }).filter(([, v]) => v !== undefined && v !== "");
      case "gps":
        return Object.entries({
          Latitude: formatGPSCoordinate(all.GPSLatitude as string, all.GPSLatitudeRef as string),
          Longitude: formatGPSCoordinate(all.GPSLongitude as string, all.GPSLongitudeRef as string),
          Altitude: all.GPSAltitude, "Altitude Ref": all.GPSAltitudeRef,
          "Img Direction": all.GPSImgDirection,
        }).filter(([, v]) => v !== undefined && v !== "");
      case "timestamps":
        return Object.entries({
          "Date Taken": all.DateTimeOriginal, Digitized: all.DateTimeDigitized,
          "Time Offset": all.OffsetTime, "GPS Time": all.GPSTimeStamp,
        }).filter(([, v]) => v !== undefined && v !== "");
      case "raw":
        return Object.entries(all).filter(([, v]) => v !== undefined && v !== "");
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-white p-6 cursor-pointer hover:border-brand-400 dark:border-dark-border dark:bg-dark-surface">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        <svg className="w-8 h-8 text-surface-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <p className="text-sm text-surface-500 dark:text-dark-muted">Drop images here to read EXIF</p>
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">JPEG, PNG, TIFF, HEIC, RAW</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {warning && <p className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</p>}

      {files.map((f, idx) => (
        <div key={idx} className="rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <img src={f.preview} alt={f.file.name} className="h-10 w-10 rounded border border-surface-100 object-cover dark:border-dark-border flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-700 dark:text-dark-text truncate">{f.file.name}</p>
                <p className="text-xs text-surface-400">{FORMAT_NAMES[f.file.type] || f.file.type} &middot; {(f.file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => copyAll("json")} className="text-xs text-brand-500 hover:text-brand-600">Copy JSON</button>
              <button onClick={() => exportJson(idx)} className="text-xs text-brand-500 hover:text-brand-600">Export .json</button>
              <button onClick={() => stripExif(idx)} className="text-xs text-red-500 hover:text-red-600">Strip EXIF</button>
              <button onClick={() => anonymizeGps(idx)} className="text-xs text-orange-500 hover:text-orange-600">Anonymize GPS</button>
              <button onClick={() => removeFile(idx)} className="text-xs text-surface-400 hover:text-surface-600">Remove</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <img src={f.preview} alt={f.file.name} className="max-h-40 rounded border border-surface-100 dark:border-dark-border object-contain" />
            {f.exif && Object.keys(f.exif).length > 0 ? (
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === tab.key
                          ? "bg-brand-500 text-white"
                          : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-0.5 max-h-48 overflow-auto">
                  {getTabData(f.exif, activeTab).length > 0 ? getTabData(f.exif, activeTab).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-0.5"><span className="text-surface-400 dark:text-dark-muted">{k}</span><span className="text-surface-700 dark:text-dark-text font-mono ml-2 text-right">{String(v)}</span></div>
                  )) : <p className="text-xs text-surface-400 dark:text-dark-muted">No data in this category</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-surface-400 dark:text-dark-muted">No EXIF data found for this format</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
