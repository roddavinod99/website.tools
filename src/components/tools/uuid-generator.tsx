"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type UuidVersion = "v4" | "v7" | "v1" | "v3" | "v5";
type FormatStyle = "hyphens" | "no-hyphens" | "uppercase" | "lowercase" | "curly" | "uuid-format" | "base64";
type ExportFormat = "text" | "json" | "csv" | "tsv";

function uuidV4(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const h = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function uuidV7(): string {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, "0");
  const buf = new Uint8Array(10);
  crypto.getRandomValues(buf);
  const rand = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  const variant = (8 + (buf[0] % 4)).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${rand.slice(0, 3)}-${variant}${rand.slice(3, 6)}-${rand.slice(6, 18)}`;
}

function uuidV1(): string {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, "0") + "00000000";
  const timeLow = hex.slice(4, 12);
  const timeMid = hex.slice(0, 4);
  const timeHi = hex.slice(12, 14);
  const buf1 = new Uint16Array(1);
  const buf2 = new Uint8Array(6);
  crypto.getRandomValues(buf1);
  crypto.getRandomValues(buf2);
  const clockSeq = ((buf1[0] & 0x3fff) | 0x8000).toString(16).padStart(4, "0");
  const node = Array.from(buf2, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-1${timeHi}-${clockSeq.slice(0, 2)}-${clockSeq.slice(2, 4)}${node}`;
}

const UUID_NAMESPACES: Record<string, string> = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

function md5Hex(message: string): Uint8Array {
  const msgBuf = new TextEncoder().encode(message);
  const msgLen = msgBuf.length;
  const bitLen = msgLen * 8;
  const padLen = ((msgLen % 64) < 56) ? (56 - (msgLen % 64)) : (120 - (msgLen % 64));
  const padded = new Uint8Array(msgLen + padLen + 8);
  padded.set(msgBuf);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(msgLen + padLen, bitLen >>> 0, true);
  view.setUint32(msgLen + padLen + 4, Math.floor(bitLen / 0x100000000) >>> 0, true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  function md5cycle(x: number[]) {
    let a = a0, b = b0, c = c0, d = d0;

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return (b & c | ~b & d) + a + x + t | 0; }
    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return (b & d | c & ~d) + a + x + t | 0; }
    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return (b ^ c ^ d) + a + x + t | 0; }
    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return (c ^ (b | ~d)) + a + x + t | 0; }

    a = ff(a, b, c, d, x[0], 7, 0xd76aa478); d = ff(d, a, b, c, x[1], 12, 0xe8c7b756); c = ff(c, d, a, b, x[2], 17, 0x242070db); b = ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[4], 7, 0xf57c0faf); d = ff(d, a, b, c, x[5], 12, 0x4787c62a); c = ff(c, d, a, b, x[6], 17, 0xa8304613); b = ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[8], 7, 0x698098d8); d = ff(d, a, b, c, x[9], 12, 0x8b44f7af); c = ff(c, d, a, b, x[10], 17, 0xffff5bb1); b = ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[12], 7, 0x6b901122); d = ff(d, a, b, c, x[13], 12, 0xfd987193); c = ff(c, d, a, b, x[14], 17, 0xa679438e); b = ff(b, c, d, a, x[15], 22, 0x49b40821);

    a = gg(a, b, c, d, x[1], 5, 0xf61e2562); d = gg(d, a, b, c, x[6], 9, 0xc040b340); c = gg(c, d, a, b, x[11], 14, 0x265e5a51); b = gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[5], 5, 0xd62f105d); d = gg(d, a, b, c, x[10], 9, 0x02441453); c = gg(c, d, a, b, x[15], 14, 0xd8a1e681); b = gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[9], 5, 0x21e1cde6); d = gg(d, a, b, c, x[14], 9, 0xc33707d7); c = gg(c, d, a, b, x[3], 14, 0xf4d50d87); b = gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[13], 5, 0xa9e3e905); d = gg(d, a, b, c, x[2], 9, 0xfcefa3f8); c = gg(c, d, a, b, x[7], 14, 0x676f02d9); b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[5], 4, 0xfffa3942); d = hh(d, a, b, c, x[8], 11, 0x8771f681); c = hh(c, d, a, b, x[11], 16, 0x6d9d6122); b = hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[1], 4, 0xa4beea44); d = hh(d, a, b, c, x[4], 11, 0x4bdecfa9); c = hh(c, d, a, b, x[7], 16, 0xf6bb4b60); b = hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[13], 4, 0x289b7ec6); d = hh(d, a, b, c, x[0], 11, 0xeaa127fa); c = hh(c, d, a, b, x[3], 16, 0xd4ef3085); b = hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[9], 4, 0xd9d4d039); d = hh(d, a, b, c, x[12], 11, 0xe6db99e5); c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8); b = hh(b, c, d, a, x[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, x[0], 6, 0xf4292244); d = ii(d, a, b, c, x[7], 10, 0x432aff97); c = ii(c, d, a, b, x[14], 15, 0xab9423a7); b = ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[12], 6, 0x655b59c3); d = ii(d, a, b, c, x[3], 10, 0x8f0ccc92); c = ii(c, d, a, b, x[10], 15, 0xffeff47d); b = ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[8], 6, 0x6fa87e4f); d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0); c = ii(c, d, a, b, x[6], 15, 0xa3014314); b = ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[4], 6, 0xf7537e82); d = ii(d, a, b, c, x[11], 10, 0xbd3af235); c = ii(c, d, a, b, x[2], 15, 0x2ad7d2bb); b = ii(b, c, d, a, x[9], 21, 0xeb86d391);

    a0 = a0 + a | 0; b0 = b0 + b | 0; c0 = c0 + c | 0; d0 = d0 + d | 0;
  }

  for (let i = 0; i < padded.length; i += 64) {
    const M: number[] = [];
    const dv = new DataView(padded.buffer, i, 64);
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(j * 4, true);
    md5cycle(M);
  }

  function toHex(n: number) { return (n >>> 0).toString(16).padStart(8, "0"); }
  const hashHex = toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hashHex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function uuidV3(nameStr: string, namespace: string): string {
  const nsBytes = hexToBytes(namespace.replace(/-/g, ""));
  const nameBytes = new TextEncoder().encode(nameStr);
  const input = new Uint8Array(nsBytes.length + nameBytes.length);
  input.set(nsBytes);
  input.set(nameBytes, nsBytes.length);
  const hash = md5Hex(new TextDecoder().decode(input));
  hash[6] = (hash[6] & 0x0f) | 0x30;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-3${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function uuidV5(nameStr: string, namespace: string): Promise<string> {
  const nsBytes = hexToBytes(namespace.replace(/-/g, ""));
  const nameBytes = new TextEncoder().encode(nameStr);
  const data = new Uint8Array(nsBytes.length + nameBytes.length);
  data.set(nsBytes);
  data.set(nameBytes, nsBytes.length);
  const hashBuf = await crypto.subtle.digest("SHA-1", data);
  const hash = new Uint8Array(hashBuf).slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function formatUuid(raw: string, style: FormatStyle): string {
  const clean = raw.replace(/-/g, "").toLowerCase();
  switch (style) {
    case "no-hyphens": return clean;
    case "uppercase": return raw.toUpperCase();
    case "lowercase": return raw.toLowerCase();
    case "curly": return `{${raw}}`;
    case "uuid-format": return `urn:uuid:${raw}`;
    case "base64": {
      const bytes: number[] = [];
      for (let i = 0; i < 32; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
      return btoa(String.fromCharCode(...bytes)).replace(/=+$/, "");
    }
    default: return raw;
  }
}

function makeUuid(version: UuidVersion, name?: string, namespace?: string): string {
  switch (version) {
    case "v4": return uuidV4();
    case "v7": return uuidV7();
    case "v1": return uuidV1();
    case "v3": return uuidV3(name || "example.com", namespace || UUID_NAMESPACES.DNS);
    default: return uuidV4();
  }
}

async function makeUuidAsync(version: UuidVersion, name?: string, namespace?: string): Promise<string> {
  if (version === "v5") return uuidV5(name || "example.com", namespace || UUID_NAMESPACES.DNS);
  return makeUuid(version, name, namespace);
}

function extractTimestamp(raw: string, version: UuidVersion): string | null {
  const clean = raw.replace(/-/g, "").toLowerCase();
  if (clean.length < 32) return null;
  if (version === "v1") {
    const timeLow = parseInt(clean.slice(0, 8), 16);
    const timeMid = parseInt(clean.slice(8, 12), 16);
    const timeHi = parseInt(clean.slice(13, 16), 16);
    const msSinceEpoch = timeHi * 28147497671.0656 + timeMid * 429496.7296 + timeLow / 10000 - 12219292800000;
    return new Date(Math.round(msSinceEpoch)).toISOString();
  }
  if (version === "v7") {
    const ts = parseInt(clean.slice(0, 12), 16);
    return new Date(ts).toISOString();
  }
  return null;
}

function generateTimestampId(type: "snowflake" | "nanoid"): string {
  if (type === "snowflake") {
    const ts = Date.now().toString(36).padStart(8, "0");
    const buf = new Uint8Array(3);
    crypto.getRandomValues(buf);
    const rand = Array.from(buf, (b) => b.toString(36).padStart(2, "0")).join("");
    return `${ts}-${rand}`;
  }
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
  const len = 21;
  let id = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) id += alphabet[buf[i] % alphabet.length];
  return id;
}

function validateUuid(input: string): { valid: boolean; version: string; variant: string; error?: string } {
  const clean = input.replace(/[{}uUrRnN:]/g, "").trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hexRe = /^[0-9a-f]{32}$/i;
  const formatted = clean.includes("-") ? clean : clean.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  if (!uuidRe.test(formatted) && !hexRe.test(clean)) return { valid: false, version: "N/A", variant: "N/A", error: "Not a valid UUID" };
  const normalized = formatted.toLowerCase();
  const versionChar = normalized[14];
  const variantChar = normalized[19];
  const vMap: Record<string, string> = { "1": "v1 (Time-based)", "2": "v2 (DCE)", "3": "v3 (Name-based MD5)", "4": "v4 (Random)", "5": "v5 (Name-based SHA-1)", "7": "v7 (Time-ordered)" };
  const variant = variantChar >= "8" && variantChar <= "b" ? "RFC 4122" : "Other";
  return { valid: true, version: vMap[versionChar] || `Unknown (${versionChar})`, variant };
}

export function UUIDGenerator() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<FormatStyle>("hyphens");
  const [exportFmt, setExportFmt] = useState<ExportFormat>("text");
  const [uuids, setUuids] = useState<string[]>(() => {
    const init: string[] = [];
    for (let i = 0; i < 5; i++) init.push(formatUuid(makeUuid("v4"), "hyphens"));
    return init;
  });
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [history, setHistory] = useState<{ time: string; uuids: string[] }[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [validateInput, setValidateInput] = useState("");
  const [validateResult, setValidateResult] = useState<ReturnType<typeof validateUuid> | null>(null);
  const [tsIdType, setTsIdType] = useState<"snowflake" | "nanoid">("snowflake");
  const [tsIds, setTsIds] = useState<string[]>([]);
  const cancelRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [namespace, setNamespace] = useState<keyof typeof UUID_NAMESPACES>("DNS");
  const [uuidName, setUuidName] = useState("example.com");

  const generate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setProgress(0);
    cancelRef.current = false;
    const batchSize = Math.min(count, 100);
    const results: string[] = [];
    const total = Math.min(count, 10000);
    for (let i = 0; i < total; i += batchSize) {
      if (cancelRef.current) break;
      const n = Math.min(batchSize, total - i);
      for (let j = 0; j < n; j++) {
        const raw = await makeUuidAsync(version, uuidName, UUID_NAMESPACES[namespace]);
        results.push(formatUuid(raw, format));
      }
      setProgress(Math.min(100, Math.round(((i + n) / total) * 100)));
      if (total > 1000) await new Promise((r) => setTimeout(r, 0));
    }
    setUuids(results);
    if (results.length > 0) {
      setHistory((prev) => [{ time: new Date().toISOString(), uuids: results.slice(0, 5) }, ...prev].slice(0, 10));
    }
    setGenerating(false);
    setProgress(100);
  }, [version, count, format, generating, uuidName, namespace]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => { generate(); }, 3000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); cancelRef.current = true; };
  }, [autoRefresh, generate]);

  const handleVersionChange = (v: UuidVersion) => {
    setVersion(v);
    if (autoRefresh) generate();
  };

  const handleFormatChange = (f: FormatStyle) => {
    setFormat(f);
    if (autoRefresh) generate();
  };

  const copyOne = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const copyAll = async (variant: "text" | "json" | "csv") => {
    let text = "";
    if (variant === "json") text = JSON.stringify(uuids, null, 2);
    else if (variant === "csv") text = uuids.join(",\n");
    else text = uuids.join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedIdx(-2);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const handleExport = () => {
    let content = "";
    switch (exportFmt) {
      case "json": content = JSON.stringify(uuids, null, 2); break;
      case "csv": content = "uuid\n" + uuids.join("\n"); break;
      case "tsv": content = "uuid\n" + uuids.join("\t"); break;
      default: content = uuids.join("\n");
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `uuids.${exportFmt === "json" ? "json" : "txt"}`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const content = uuids.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "uuids.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = () => {
    setValidateResult(validateUuid(validateInput));
  };

  const handleGenTsId = () => {
    setTsIds(Array.from({ length: 5 }, () => generateTimestampId(tsIdType)));
  };

  const stats = uuids.length > 0 && format !== "base64" ? (() => {
    const raw = makeUuid(version);
    const ts = extractTimestamp(raw, version);
    return { count: uuids.length, version: `UUID ${version}`, timestamp: ts || "N/A" };
  })() : null;

  return (
    <div className="space-y-4">
<div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="uuid-version" className="text-sm font-medium text-surface-700 dark:text-dark-text">Version:</label>
        <select id="uuid-version" value={version} onChange={(e) => handleVersionChange(e.target.value as UuidVersion)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="v4">UUID v4 (Random)</option>
          <option value="v7">UUID v7 (Time-ordered)</option>
          <option value="v1">UUID v1 (Time-based MAC)</option>
          <option value="v3">UUID v3 (Name-based MD5)</option>
          <option value="v5">UUID v5 (Name-based SHA-1)</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="uuid-count" className="text-sm font-medium text-surface-700 dark:text-dark-text">Count:</label>
        <input type="number" id="uuid-count" min={1} max={10000} value={count}
          onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-20 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="uuid-format" className="text-sm font-medium text-surface-700 dark:text-dark-text">Format:</label>
        <select id="uuid-format" value={format} onChange={(e) => handleFormatChange(e.target.value as FormatStyle)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="hyphens">Standard</option>
          <option value="uppercase">Uppercase</option>
          <option value="curly">Braces {}</option>
          <option value="uuid-format">URN (urn:uuid:)</option>
          <option value="no-hyphens">No Hyphens</option>
          <option value="lowercase">Lowercase</option>
          <option value="base64">Base64</option>
        </select>
      </div>
    </div>

      {(version === "v3" || version === "v5") && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div>
            <label htmlFor="uuid-namespace" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Namespace</label>
            <select id="uuid-namespace" value={namespace} onChange={(e) => setNamespace(e.target.value as keyof typeof UUID_NAMESPACES)}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              {Object.keys(UUID_NAMESPACES).map((ns) => (
                <option key={ns} value={ns}>{ns} ({UUID_NAMESPACES[ns].slice(0, 8)}…)</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="uuid-name" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Name</label>
            <input type="text" id="uuid-name" value={uuidName} onChange={(e) => setUuidName(e.target.value)}
              placeholder="e.g. example.com or any string"
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} disabled={generating}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {generating ? `Generating ${progress}%` : "Generate"}
        </button>
        {uuids.length > 0 && (
          <>
            <button onClick={() => copyAll("text")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy all UUIDs as text">
              {copiedIdx === -2 ? "Copied!" : "Copy All"}
            </button>
            <button onClick={() => copyAll("json")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy all UUIDs as JSON">Copy as JSON</button>
            <button onClick={() => copyAll("csv")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy all UUIDs as CSV">Copy as CSV</button>
            <button onClick={downloadTxt} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download UUIDs as text file">Download .txt</button>
          </>
        )}
        <label htmlFor="uuid-auto-refresh" className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" id="uuid-auto-refresh" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="accent-brand-500" />
          Auto-refresh (3s)
        </label>
      </div>

      {generating && (
        <div className="h-2 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {stats && (
        <div className="flex gap-4 text-xs text-surface-600 dark:text-dark-muted">
          <span>Count: <strong>{stats.count}</strong></span>
          <span>Version: <strong>{stats.version}</strong></span>
          <span>Timestamp: <strong>{stats.timestamp}</strong></span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <label htmlFor="uuid-export-format" className="sr-only">Export format</label>
        <select id="uuid-export-format" value={exportFmt} onChange={(e) => setExportFmt(e.target.value as ExportFormat)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="text">Text (line)</option>
          <option value="json">JSON Array</option>
          <option value="csv">CSV</option>
          <option value="tsv">TSV</option>
        </select>
        <button onClick={handleExport} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Export</button>
      </div>

      {uuids.length > 0 && (
        <div className="max-h-80 overflow-y-auto space-y-1">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all truncate">{uuid}</code>
              <button onClick={() => copyOne(uuid, i)} className="text-xs text-brand-500 hover:text-brand-600 whitespace-nowrap" aria-label={`Copy UUID ${i + 1} to clipboard`}>
                {copiedIdx === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">UUID Validation</p>
        <div className="flex gap-2">
          <label htmlFor="uuid-validate-input" className="sr-only">Enter a UUID to validate</label>
          <input type="text" id="uuid-validate-input" value={validateInput} onChange={(e) => setValidateInput(e.target.value)} placeholder="Enter a UUID to validate..."
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <button onClick={handleValidate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Validate</button>
        </div>
        {validateResult && (
          <div className={`mt-2 rounded-lg border p-2 text-xs ${validateResult.valid ? "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300" : "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
            {validateResult.valid ? `Valid UUID — ${validateResult.version}, ${validateResult.variant}` : validateResult.error}
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Timestamp-based IDs</p>
        <div className="flex gap-2 mb-2">
          <label htmlFor="uuid-ts-id-type" className="sr-only">Timestamp ID type</label>
          <select id="uuid-ts-id-type" value={tsIdType} onChange={(e) => setTsIdType(e.target.value as "snowflake" | "nanoid")}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="snowflake">Snowflake-style</option>
            <option value="nanoid">NanoID-style</option>
          </select>
          <button onClick={handleGenTsId} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        </div>
        {tsIds.length > 0 && (
          <div className="space-y-1">
            {tsIds.map((id, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-surface-200 bg-surface-50 px-3 py-1.5 dark:border-dark-border dark:bg-dark-surface">
                <code className="flex-1 text-xs font-mono text-surface-900 dark:text-dark-text select-all">{id}</code>
                <button onClick={() => copyOne(id, i + 1000)} className="text-xs text-brand-500 hover:text-brand-600" aria-label={`Copy timestamp ID ${i + 1} to clipboard`}>
                  {copiedIdx === i + 1000 ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Recent Generations</p>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-xs text-surface-500 dark:text-dark-muted truncate">
                <span className="font-mono">{new Date(h.time).toLocaleTimeString()}</span> — {h.uuids.length} UUIDs
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
