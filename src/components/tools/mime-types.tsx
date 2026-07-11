"use client";

import { useState, useCallback } from "react";

type Direction = "extToMime" | "mimeToExt";

const MIME_DB: Record<string, string[]> = {
  "application/atom+xml": ["atom"],
  "application/ecmascript": ["es"],
  "application/javascript": ["js"],
  "application/json": ["json", "geojson"],
  "application/ld+json": ["jsonld"],
  "application/msword": ["doc", "dot"],
  "application/octet-stream": ["bin", "exe", "dll", "so", "class"],
  "application/ogg": ["ogx"],
  "application/pdf": ["pdf"],
  "application/postscript": ["ai", "eps", "ps"],
  "application/rtf": ["rtf"],
  "application/vnd.api+json": ["jsonapi"],
  "application/vnd.ms-excel": ["xls", "xla", "xlt"],
  "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.rar": ["rar"],
  "application/vnd.zip": ["zip"],
  "application/wasm": ["wasm"],
  "application/x-7z-compressed": ["7z"],
  "application/x-bzip2": ["bz2"],
  "application/x-gzip": ["gz", "gzip"],
  "application/x-tar": ["tar"],
  "application/x-www-form-urlencoded": ["form"],
  "application/xml": ["xml", "xsl", "xsd"],
  "application/zip": ["zip"],
  "audio/aac": ["aac"],
  "audio/flac": ["flac"],
  "audio/midi": ["midi", "mid"],
  "audio/mpeg": ["mp3"],
  "audio/ogg": ["oga"],
  "audio/wav": ["wav"],
  "audio/webm": ["weba"],
  "font/collection": ["ttc"],
  "font/otf": ["otf"],
  "font/ttf": ["ttf"],
  "font/woff": ["woff"],
  "font/woff2": ["woff2"],
  "image/avif": ["avif"],
  "image/bmp": ["bmp"],
  "image/gif": ["gif"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "image/jpeg": ["jpg", "jpeg", "jfif", "pjpeg", "pjp"],
  "image/png": ["png"],
  "image/svg+xml": ["svg"],
  "image/tiff": ["tiff", "tif"],
  "image/webp": ["webp"],
  "image/x-icon": ["ico", "cur"],
  "text/calendar": ["ics"],
  "text/css": ["css"],
  "text/csv": ["csv"],
  "text/html": ["html", "htm", "shtml"],
  "text/javascript": ["js", "mjs"],
  "text/markdown": ["md", "markdown"],
  "text/plain": ["txt", "text", "log"],
  "text/richtext": ["rtx"],
  "text/sgml": ["sgml", "sgm"],
  "text/tab-separated-values": ["tsv"],
  "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
  "text/uri-list": ["uri", "uris", "urls"],
  "text/vcard": ["vcard", "vcf"],
  "text/xml": ["xml", "xsl"],
  "video/3gpp": ["3gp"],
  "video/3gpp2": ["3g2"],
  "video/mp2t": ["ts"],
  "video/mp4": ["mp4", "mp4v", "mpg4"],
  "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
  "video/ogg": ["ogv"],
  "video/quicktime": ["mov"],
  "video/webm": ["webm"],
  "video/x-flv": ["flv"],
  "video/x-msvideo": ["avi"],
  "video/x-ms-wmv": ["wmv"],
};

const extToMimeMap: Record<string, string> = {};
const mimeToExtMap: Record<string, string> = {};

for (const [mime, exts] of Object.entries(MIME_DB)) {
  mimeToExtMap[mime] = exts[0];
  for (const ext of exts) {
    extToMimeMap[ext] = mime;
  }
}

export function MimeTypes() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>("extToMime");

  const lookup = useCallback(() => {
    const q = input.trim().toLowerCase();
    if (!q) { setOutput([]); return; }

    if (direction === "extToMime") {
      const ext = q.replace(/^\./, "");
      const mime = extToMimeMap[ext];
      setOutput(mime ? [mime] : []);
    } else {
      const results: string[] = [];
      const normalizedInput = q.replace(/\s*;\s*charset=.*$/, "");
      for (const [mime, exts] of Object.entries(MIME_DB)) {
        if (mime.toLowerCase() === normalizedInput) {
          results.push(...exts.map((e) => `.${e}`));
          break;
        }
      }
      if (results.length === 0) {
        for (const [mime, exts] of Object.entries(MIME_DB)) {
          if (mime.toLowerCase().includes(normalizedInput)) {
            results.push(`${mime} → .${exts.join(", .")}`);
          }
        }
      }
      setOutput(results.slice(0, 20));
    }
  }, [input, direction]);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput([]); return; }
    const q = val.trim().toLowerCase();
    if (direction === "extToMime") {
      const ext = q.replace(/^\./, "");
      const mime = extToMimeMap[ext];
      setOutput(mime ? [mime] : []);
    } else {
      const results: string[] = [];
      const normalizedInput = q.replace(/\s*;\s*charset=.*$/, "");
      for (const [mime, exts] of Object.entries(MIME_DB)) {
        if (mime.toLowerCase().includes(normalizedInput)) {
          results.push(`${mime} → .${exts.join(", .")}`);
        }
      }
      setOutput(results.slice(0, 20));
    }
  }, [direction]);

  const copy = async () => { if (output.length) await navigator.clipboard.writeText(output.join("\n")); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([["extToMime", "Extension → MIME"], ["mimeToExt", "MIME → Extension"]] as [Direction, string][]).map(([d, label]) => (
          <button key={d} onClick={() => { setDirection(d); setOutput([]); setInput(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${direction === d ? "bg-brand-500 text-white" : "rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">
          {direction === "extToMime" ? "File Extension (e.g. .json, pdf)" : "MIME Type (e.g. application/json)"}
        </label>
        <input
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={direction === "extToMime" ? ".json" : "application/json"}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {output.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Results ({output.length})</label>
            <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all whitespace-pre-wrap">{output.join("\n")}</pre>
        </div>
      )}

      {input && output.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">No matches found.</p>
        </div>
      )}
    </div>
  );
}
