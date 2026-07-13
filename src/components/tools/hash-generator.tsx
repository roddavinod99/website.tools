"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Download } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

function rotateLeft(x: number, n: number) { return (x << n) | (x >>> (32 - n)); }

function md5(text: string): string {
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const T: number[] = [];
  for (let i = 1; i <= 64; i++) T[i] = Math.floor(Math.abs(Math.sin(i)) * 0x100000000);
  const bytes = new TextEncoder().encode(text);
  const ml = bytes.length * 8;
  const paddedLen = (((bytes.length + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(paddedLen - 8, ml >>> 32, true);
  dv.setUint32(paddedLen - 4, ml & 0xffffffff, true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const S = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
  for (let offset = 0; offset < paddedLen; offset += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(offset + i * 4, true);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let Fn: (x: number, y: number, z: number) => number, g: number;
      if (i < 16) { Fn = F; g = i; }
      else if (i < 32) { Fn = G; g = (5 * i + 1) % 16; }
      else if (i < 48) { Fn = H; g = (3 * i + 5) % 16; }
      else { Fn = I; g = (7 * i) % 16; }
      const s = S[Math.floor(i / 16)][i % 4];
      const temp = D; D = C; C = B;
      B = (B + rotateLeft((A + Fn(B, C, D) + M[g] + T[i + 1]) >>> 0, s)) >>> 0;
      A = temp;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

async function sha224(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-224", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha512_224(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-512/224", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha512_256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-512/256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function rmd160(data: string): string {
  const bytes = new TextEncoder().encode(data);
  const ml = bytes.length * 8;
  const paddedLen = (((bytes.length + 8) >>> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(paddedLen - 8, ml >>> 32, true);
  dv.setUint32(paddedLen - 4, ml & 0xffffffff, true);
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const rol = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  const f1 = (x: number, y: number, z: number) => x ^ y ^ z;
  const f2 = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const f3 = (x: number, y: number, z: number) => (x | ~y) ^ z;
  const f4 = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const f5 = (x: number, y: number, z: number) => x ^ (y | ~z);
  const k1 = 0x00000000, k2 = 0x5a827999, k3 = 0x6ed9eba1, k4 = 0x8f1bbcdc, k5 = 0xa953fd4e;
  const k1r = 0x50a28be6, k2r = 0x5c4dd124, k3r = 0x6d703ef3, k4r = 0x7a6d76e9, k5r = 0x00000000;
  const r = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
  const rr = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];
  const s = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
  const sr = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
  for (let offset = 0; offset < paddedLen; offset += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) M[i] = dv.getUint32(offset + i * 4, true);
    let A = h0, B = h1, C = h2, D = h3, E = h4;
    let Ar = h0, Br = h1, Cr = h2, Dr = h3, Er = h4;
    for (let i = 0; i < 80; i++) {
      const j = Math.floor(i / 16);
      const f = [f1, f2, f3, f4, f5][j](B, C, D);
      const k = [k1, k2, k3, k4, k5][j];
      const T = (rol((A + f + M[r[i]] + k) >>> 0, s[i]) + E) >>> 0;
      A = E; E = D; D = rol(C, 10); C = B; B = T;
      const jr = Math.floor(i / 16);
      const fr = [f5, f4, f3, f2, f1][jr](Br, Cr, Dr);
      const kr = [k1r, k2r, k3r, k4r, k5r][jr];
      const Tr = (rol((Ar + fr + M[rr[i]] + kr) >>> 0, sr[i]) + Er) >>> 0;
      Ar = Er; Er = Dr; Dr = rol(Cr, 10); Cr = Br; Br = Tr;
    }
    const T = (h1 + C + Dr) >>> 0;
    h1 = (h2 + D + Er) >>> 0; h2 = (h3 + E + Ar) >>> 0;
    h3 = (h4 + A + Br) >>> 0; h4 = (h0 + B + Cr) >>> 0; h0 = T;
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
}

const CRC32_TABLE = new Uint32Array(256).map((_, i) => {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

const CRC32C_TABLE = new Uint32Array(256).map((_, i) => {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0x82f63b78 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(data: string): string {
  const buf = new TextEncoder().encode(data);
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC32_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function crc32c(data: string): string {
  const buf = new TextEncoder().encode(data);
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC32C_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function formatHash(hex: string, fmt: "hex" | "base64" | "binary"): string {
  if (fmt === "hex") return hex;
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  if (fmt === "base64") return btoa(String.fromCharCode(...bytes));
  return bytes.map((b) => b.toString(2).padStart(8, "0")).join("");
}

type HashAlgorithm = {
  id: string;
  label: string;
  bits: number;
  hash: (data: string, hmacSecret?: string, salt?: string, saltPos?: "prepend" | "append") => Promise<string>;
};

const ALL_ALGORITHMS: HashAlgorithm[] = [
  { id: "MD5", label: "MD5", bits: 128, hash: async (d) => md5(d) },
  { id: "SHA-1", label: "SHA-1", bits: 160, hash: async (d) => hexDigest("SHA-1", d) },
  { id: "SHA-224", label: "SHA-224", bits: 224, hash: async (d) => sha224(d) },
  { id: "SHA-256", label: "SHA-256", bits: 256, hash: async (d) => hexDigest("SHA-256", d) },
  { id: "SHA-384", label: "SHA-384", bits: 384, hash: async (d) => hexDigest("SHA-384", d) },
  { id: "SHA-512", label: "SHA-512", bits: 512, hash: async (d) => hexDigest("SHA-512", d) },
  { id: "SHA-512/224", label: "SHA-512/224", bits: 224, hash: async (d) => sha512_224(d) },
  { id: "SHA-512/256", label: "SHA-512/256", bits: 256, hash: async (d) => sha512_256(d) },
  { id: "RIPEMD-160", label: "RIPEMD-160", bits: 160, hash: async (d) => rmd160(d) },
  { id: "CRC32", label: "CRC32", bits: 32, hash: async (d) => crc32(d) },
  { id: "CRC32C", label: "CRC32C", bits: 32, hash: async (d) => crc32c(d) },
];

const CORE_ALGO_IDS = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

async function hexDigest(algo: string, data: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacDigest(algo: string, data: string, secret: string): Promise<string> {
  const hashName = algo === "MD5" ? "SHA-256" : algo;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: hashName }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function birthdayProb(bits: number): string {
  const half = bits / 2;
  const exp = Math.round(half * 0.30103);
  return `2^${half} ≈ 10^${exp}`;
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(() => ALL_ALGORITHMS.map((a) => a.id));
  const [results, setResults] = useState<Record<string, string>>({});
  const [hmac, setHmac] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [salt, setSalt] = useState("");
  const [saltPos, setSaltPos] = useState<"prepend" | "append">("prepend");
  const [hashFmt, setHashFmt] = useState<"hex" | "base64" | "binary">("hex");
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [fileAlgo, setFileAlgo] = useState("SHA-256");
  const [hasFile, setHasFile] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ idx: number; line: string; results: Record<string, string> }[]>([]);
  const [copied, setCopied] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const computeAll = useCallback(async (text: string) => {
    if (!text.trim()) { setResults({}); return; }
    const r: Record<string, string> = {};
    const active = ALL_ALGORITHMS.filter((a) => selected.includes(a.id));
    for (const algo of active) {
      try {
        let data = text;
        if (salt) data = saltPos === "prepend" ? salt + text : text + salt;
        let hex: string;
        if (hmac && !["CRC32", "CRC32C"].includes(algo.id)) {
          hex = await hmacDigest(algo.id === "MD5" ? "SHA-256" : algo.id, data, hmacKey || "secret");
        } else {
          hex = await algo.hash(data);
        }
        r[algo.id] = formatHash(hex, hashFmt);
      } catch { r[algo.id] = "Error"; }
    }
    setResults(r);
  }, [selected, hmac, hmacKey, salt, saltPos, hashFmt]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { computeAll(input); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, computeAll]);

  useEffect(() => {
    const run = async () => {
      if (!bulkMode || !input.trim()) { setBulkResults([]); return; }
      const lines = input.split("\n").filter((l) => l.trim());
      const active = ALL_ALGORITHMS.filter((a) => selected.includes(a.id));
      const results: { idx: number; line: string; results: Record<string, string> }[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const lineResults: Record<string, string> = {};
        for (const algo of active) {
          try {
            let data = line;
            if (salt) data = saltPos === "prepend" ? salt + line : line + salt;
            let hex: string;
            if (hmac && !["CRC32", "CRC32C"].includes(algo.id)) {
              hex = await hmacDigest(algo.id === "MD5" ? "SHA-256" : algo.id, data, hmacKey || "secret");
            } else {
              hex = await algo.hash(data);
            }
            lineResults[algo.label] = formatHash(hex, hashFmt);
          } catch { lineResults[algo.label] = "err"; }
        }
        results.push({ idx, line, results: lineResults });
      }
      setBulkResults(results);
    };
    run();
  }, [input, bulkMode, selected, hmac, hmacKey, salt, saltPos, hashFmt]);

  const toggleAlgo = (id: string) => {
    if (CORE_ALGO_IDS.includes(id)) return;
    setSelected((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const hashFile = async (f: File) => {
    const sizeCheck = validateFileSize(f, 25);
    if (!sizeCheck.valid) {
      alert(sizeCheck.error);
      return;
    }
    setFile(f);
    setHasFile(true);
    const buf = await f.arrayBuffer();
    let hex: string;
    try {
      if (fileAlgo === "MD5") {
        const text = new TextDecoder().decode(buf);
        hex = md5(text);
      } else {
        const hashBuf = await crypto.subtle.digest(fileAlgo, buf);
        hex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      setFileHash(formatHash(hex, hashFmt));
    } catch {
      setFileHash("Error");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) hashFile(f);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) hashFile(f);
  };

  const copyResult = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadHash = (algoId: string, hash: string) => {
    const blob = new Blob([hash], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hash-${algoId.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const coreAlgos = ALL_ALGORITHMS.filter((a) => CORE_ALGO_IDS.includes(a.id));
  const extraAlgos = ALL_ALGORITHMS.filter((a) => !CORE_ALGO_IDS.includes(a.id));
  const activeAlgos = ALL_ALGORITHMS.filter((a) => selected.includes(a.id));

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {coreAlgos.map((a) => (
            <span key={a.id}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-500 text-white cursor-default">
              {a.label}
            </span>
          ))}
          {extraAlgos.map((a) => (
            <button key={a.id} onClick={() => toggleAlgo(a.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selected.includes(a.id)
                  ? "bg-brand-500 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
              }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Format:</label>
          <select value={hashFmt} onChange={(e) => setHashFmt(e.target.value as "hex" | "base64" | "binary")}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
            <option value="binary">Binary</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={hmac} onChange={(e) => setHmac(e.target.checked)} className="accent-brand-500" />
          HMAC
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} className="accent-brand-500" />
          Compare
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} className="accent-brand-500" />
          Bulk (per line)
        </label>
      </div>

      {hmac && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">HMAC Secret Key</label>
          <input type="text" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Enter secret key..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Salt (optional)</label>
          <input type="text" value={salt} onChange={(e) => setSalt(e.target.value)} placeholder="Enter salt..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Salt Position</label>
          <select value={saltPos} onChange={(e) => setSaltPos(e.target.value as "prepend" | "append")}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="prepend">Prepend</option>
            <option value="append">Append</option>
          </select>
        </div>
      </div>

      {!compareMode && !bulkMode && (
        <div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash (real-time)..."
            rows={4}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      )}

      {compareMode && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Hash 1</label>
            <input type="text" value={compareA} onChange={(e) => setCompareA(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Hash 2</label>
            <input type="text" value={compareB} onChange={(e) => setCompareB(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <div className="col-span-2">
            <button onClick={() => setCompareResult(compareA.trim().toLowerCase() === compareB.trim().toLowerCase())}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Compare</button>
            {compareResult !== null && (
              <span className={`ml-3 text-sm font-medium ${compareResult ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {compareResult ? "✓ Match" : "✗ No Match"}
              </span>
            )}
          </div>
        </div>
      )}

      {bulkMode && (
        <div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text (one item per line)..."
            rows={6}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          {bulkResults.length > 0 && (
            <div className="mt-2 max-h-64 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-100 dark:bg-dark-surface">
                    <th className="border border-surface-200 dark:border-dark-border px-2 py-1 text-left">#</th>
                    <th className="border border-surface-200 dark:border-dark-border px-2 py-1 text-left">Input</th>
                    {activeAlgos.map((a) => <th key={a.id} className="border border-surface-200 dark:border-dark-border px-2 py-1 text-left">{a.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((br) => (
                    <tr key={br.idx} className="hover:bg-surface-50 dark:hover:bg-dark-surface">
                      <td className="border border-surface-200 dark:border-dark-border px-2 py-1 font-mono">{br.idx + 1}</td>
                      <td className="border border-surface-200 dark:border-dark-border px-2 py-1 max-w-[120px] truncate">{br.line}</td>
                      {activeAlgos.map((a) => <td key={a.id} className="border border-surface-200 dark:border-dark-border px-2 py-1 font-mono max-w-[180px] truncate">{br.results[a.label] || ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border-2 border-dashed border-surface-300 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:text-dark-muted"
      >
        <p>Drop a file here or <label className="text-brand-500 hover:text-brand-600 cursor-pointer underline">browse<input type="file" onChange={handleFilePick} className="hidden" /></label></p>
        <div className="flex items-center gap-2 justify-center mt-2">
          <span className="text-xs">Algorithm:</span>
          <select value={fileAlgo} onChange={(e) => setFileAlgo(e.target.value)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {ALL_ALGORITHMS.filter((a) => a.id !== "CRC32" && a.id !== "CRC32C" && a.id !== "RIPEMD-160").map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        {hasFile && (
          <div className="mt-2 rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">{file?.name} ({file ? (file.size / 1024).toFixed(1) : 0} KB)</p>
            <code className="block text-xs font-mono text-surface-900 dark:text-dark-text break-all select-all">{fileHash}</code>
          </div>
        )}
      </div>

      {Object.keys(results).length > 0 && !compareMode && !bulkMode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500 dark:text-dark-muted">
              Birthday attack: {birthdayProb(activeAlgos.length > 0 ? activeAlgos[0].bits : 256)}
            </p>
            <button onClick={() => {
              const json = JSON.stringify(results, null, 2);
              navigator.clipboard.writeText(json);
            }} className="text-xs text-brand-500 hover:text-brand-600">Copy All as JSON</button>
          </div>
          {activeAlgos.map((algo) => {
            const hash = results[algo.id];
            if (!hash) return null;
            return (
              <div key={algo.id} className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">{algo.label}</span>
                    <span className="text-xs text-surface-400 dark:text-dark-muted">{algo.bits} bits ({algo.bits / 4} hex chars)</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => downloadHash(algo.id, hash)} className="text-xs text-surface-500 hover:text-brand-600 flex items-center gap-0.5" title="Download hash file">
                      <Download size={12} />
                    </button>
                    <button onClick={() => copyResult(hash, algo.id)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                      <Copy size={12} /> {copied === algo.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <code className="block text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">{hash}</code>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
