"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Download } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

// sha512-224/256 hand-rolled for unsupported WebCrypto envs

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CryptoJSApi = any;

let cryptoJSPromise: Promise<CryptoJSApi> | null = null;
function getCryptoJS(): Promise<CryptoJSApi> {
  if (!cryptoJSPromise) cryptoJSPromise = import("crypto-js");
  return cryptoJSPromise;
}

async function md5Hex(data: string): Promise<string> {
  const C = await getCryptoJS();
  return C.MD5(data).toString();
}

async function md5BytesHex(data: Uint8Array): Promise<string> {
  const C = await getCryptoJS();
  return C.MD5(C.lib.WordArray.create(data)).toString();
}

async function rmd160Hex(data: string): Promise<string> {
  const C = await getCryptoJS();
  return C.RIPEMD160(data).toString();
}

async function sha224(data: string): Promise<string> {
  const C = await getCryptoJS();
  return C.SHA224(data).toString();
}

const SHA512_K = [
  0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
  0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
  0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
  0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,
  0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
  0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,
  0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
  0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
  0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,
  0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,
  0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,
  0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn,
  0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n,
];

const SHA512_MASK = (1n << 64n) - 1n;

function sha512Core(data: Uint8Array, iv: bigint[]): Uint8Array {
  const rotr = (x: bigint, n: bigint) => ((x >> n) | (x << (64n - n))) & SHA512_MASK;
  const ml = data.length;
  const rem = (ml + 1) % 128;
  const padLen = rem <= 112 ? 112 - rem : 240 - rem;
  const total = ml + 1 + padLen + 16;
  const buf = new Uint8Array(total);
  buf.set(data);
  buf[ml] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setBigUint64(total - 8, BigInt(ml * 8), false);
  const h = iv.map((x) => BigInt(x));
  for (let i = 0; i < total; i += 128) {
    const w = new Array<bigint>(80).fill(0n);
    for (let j = 0; j < 16; j++) w[j] = dv.getBigUint64(i + j * 8, false);
    for (let j = 16; j < 80; j++) {
      const s0 = rotr(w[j - 15], 1n) ^ rotr(w[j - 15], 8n) ^ (w[j - 15] >> 7n);
      const s1 = rotr(w[j - 2], 19n) ^ rotr(w[j - 2], 61n) ^ (w[j - 2] >> 6n);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) & SHA512_MASK;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (let j = 0; j < 80; j++) {
      const S1 = rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA512_K[j] + w[j]) & SHA512_MASK;
      const S0 = rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) & SHA512_MASK;
      hh = g; g = f; f = e; e = (d + t1) & SHA512_MASK; d = c; c = b; b = a; a = (t1 + t2) & SHA512_MASK;
    }
    h[0] = (h[0] + a) & SHA512_MASK; h[1] = (h[1] + b) & SHA512_MASK;
    h[2] = (h[2] + c) & SHA512_MASK; h[3] = (h[3] + d) & SHA512_MASK;
    h[4] = (h[4] + e) & SHA512_MASK; h[5] = (h[5] + f) & SHA512_MASK;
    h[6] = (h[6] + g) & SHA512_MASK; h[7] = (h[7] + hh) & SHA512_MASK;
  }
  const out = new Uint8Array(64);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setBigUint64(i * 8, h[i], false);
  return out;
}

const SHA512_224_IV = [
  0x8c3d37c819544da2n, 0x73e1996689dcd4d6n, 0x1dfab7ae32ff9c82n, 0x679dd514582f9fcfn,
  0x0f6d2b697bd44da8n, 0x77e36f7304c48942n, 0x3f9d85a86a1d36c8n, 0x1112e6ad91d692a1n,
];
const SHA512_256_IV = [
  0x22312194fc2bf72cn, 0x9f555fa3c84c64c2n, 0x2393b86b6f53b151n, 0x963877195940eabdn,
  0x96283ee2a88effe3n, 0xbe5e1e2553863992n, 0x2b0199fc2c85b8aan, 0x0eb72ddc81c52ca2n,
];

function bytesToHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha512_224(data: string): Promise<string> {
  return bytesToHex(sha512Core(new TextEncoder().encode(data), SHA512_224_IV).slice(0, 28));
}

async function sha512_256(data: string): Promise<string> {
  return bytesToHex(sha512Core(new TextEncoder().encode(data), SHA512_256_IV).slice(0, 32));
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
  { id: "MD5", label: "MD5", bits: 128, hash: async (d) => md5Hex(d) },
  { id: "SHA-1", label: "SHA-1", bits: 160, hash: async (d) => hexDigest("SHA-1", d) },
  { id: "SHA-224", label: "SHA-224", bits: 224, hash: async (d) => sha224(d) },
  { id: "SHA-256", label: "SHA-256", bits: 256, hash: async (d) => hexDigest("SHA-256", d) },
  { id: "SHA-384", label: "SHA-384", bits: 384, hash: async (d) => hexDigest("SHA-384", d) },
  { id: "SHA-512", label: "SHA-512", bits: 512, hash: async (d) => hexDigest("SHA-512", d) },
  { id: "SHA-512/224", label: "SHA-512/224", bits: 224, hash: async (d) => sha512_224(d) },
  { id: "SHA-512/256", label: "SHA-512/256", bits: 256, hash: async (d) => sha512_256(d) },
  { id: "RIPEMD-160", label: "RIPEMD-160", bits: 160, hash: async (d) => rmd160Hex(d) },
  { id: "CRC32", label: "CRC32", bits: 32, hash: async (d) => crc32(d) },
  { id: "CRC32C", label: "CRC32C", bits: 32, hash: async (d) => crc32c(d) },
];

const CORE_ALGO_IDS = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

async function hexDigest(algo: string, data: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const CRYPTOJS_HMAC: Record<string, string> = {
  MD5: "HmacMD5",
  "SHA-1": "HmacSHA1",
  "SHA-224": "HmacSHA224",
  "SHA-256": "HmacSHA256",
  "SHA-384": "HmacSHA384",
  "SHA-512": "HmacSHA512",
  "RIPEMD-160": "HmacRIPEMD160",
};

function canHmac(algoId: string): boolean {
  return !!CRYPTOJS_HMAC[algoId];
}

async function hmacDigest(algo: string, data: string, secret: string): Promise<string> {
  const fn = CRYPTOJS_HMAC[algo];
  if (fn) {
    const C = await getCryptoJS();
    return C[fn](data, secret).toString();
  }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
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
  const [verifyHash, setVerifyHash] = useState("");
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
          hex = canHmac(algo.id) ? await hmacDigest(algo.id, data, hmacKey || "secret") : "N/A";
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
              hex = canHmac(algo.id) ? await hmacDigest(algo.id, data, hmacKey || "secret") : "N/A";
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
    const sizeCheck = validateFileSize(f, 25 * 1024 * 1024);
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
        hex = await md5BytesHex(new Uint8Array(buf));
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
  const normHash = (h: string) => h.trim().toLowerCase().replace(/\s+/g, "");
  const expectedNormalized = normHash(verifyHash);
  const verifiedCount = expectedNormalized
    ? activeAlgos.filter((a) => results[a.id] && normHash(results[a.id]) === expectedNormalized).length
    : 0;
  const fileMatchesExpected = expectedNormalized ? normHash(fileHash) === expectedNormalized : null;

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
          <label htmlFor="hash-format" className="text-sm font-medium text-surface-700 dark:text-dark-text">Format:</label>
          <select id="hash-format" value={hashFmt} onChange={(e) => setHashFmt(e.target.value as "hex" | "base64" | "binary")}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
            <option value="binary">Binary</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" id="hash-hmac" checked={hmac} onChange={(e) => setHmac(e.target.checked)} className="accent-brand-500" />
          HMAC
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" id="hash-compare" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} className="accent-brand-500" />
          Compare
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" id="hash-bulk" checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} className="accent-brand-500" />
          Bulk (per line)
        </label>
      </div>

      {hmac && (
        <div>
          <label htmlFor="hash-hmac-key" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">HMAC Secret Key</label>
          <input type="text" id="hash-hmac-key" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Enter secret key..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="hash-salt" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Salt (optional)</label>
          <input type="text" id="hash-salt" value={salt} onChange={(e) => setSalt(e.target.value)} placeholder="Enter salt..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label htmlFor="hash-salt-pos" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Salt Position</label>
          <select id="hash-salt-pos" value={saltPos} onChange={(e) => setSaltPos(e.target.value as "prepend" | "append")}
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
            <label htmlFor="hash-compare-a" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Hash 1</label>
            <input type="text" id="hash-compare-a" value={compareA} onChange={(e) => setCompareA(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <div>
            <label htmlFor="hash-compare-b" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Hash 2</label>
            <input type="text" id="hash-compare-b" value={compareB} onChange={(e) => setCompareB(e.target.value)}
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
          <label htmlFor="hash-bulk-input" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Enter text (one item per line)</label>
          <textarea id="hash-bulk-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text (one item per line)..."
            rows={6}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          {bulkResults.length > 0 && (
            <div className="mt-2 max-h-64 overflow-auto">
              <div className="table-responsive">
              <table className="table-base table-hover">
                <thead>
                  <tr className="bg-surface-100 dark:bg-dark-surface">
                    <th className="table-header text-left">#</th>
                    <th className="table-header text-left">Input</th>
                    {activeAlgos.map((a) => <th key={a.id} className="table-header text-left">{a.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((br) => (
                    <tr key={br.idx}>
                      <td className="table-cell font-mono">{br.idx + 1}</td>
                      <td className="table-cell max-w-[120px] truncate">{br.line}</td>
                      {activeAlgos.map((a) => <td key={a.id} className="table-cell font-mono max-w-[180px] truncate">{br.results[a.label] || ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
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
        <p>Drop a file here or <label htmlFor="hash-file-picker" className="text-brand-500 hover:text-brand-600 cursor-pointer underline">browse<input type="file" id="hash-file-picker" onChange={handleFilePick} className="hidden" /></label></p>
        <div className="flex items-center gap-2 justify-center mt-2">
          <span className="text-xs">Algorithm:</span>
          <label htmlFor="hash-file-algo" className="sr-only">File hash algorithm</label>
          <select id="hash-file-algo" value={fileAlgo} onChange={(e) => setFileAlgo(e.target.value)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-900 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {ALL_ALGORITHMS.filter((a) => a.id !== "CRC32" && a.id !== "CRC32C" && a.id !== "RIPEMD-160").map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        {hasFile && (
          <div className="mt-2 rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">{file?.name} ({file ? (file.size / 1024).toFixed(1) : 0} KB)</p>
            <code className="block text-xs font-mono text-surface-900 dark:text-dark-text break-all select-all">{fileHash}</code>
            {fileMatchesExpected !== null && (
              <p className={`mt-1 text-xs font-medium ${fileMatchesExpected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {fileMatchesExpected ? "✓ File hash matches expected" : "✗ File hash does not match expected"}
              </p>
            )}
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
          <div className="flex items-center gap-2">
            <label htmlFor="hash-verify" className="text-xs text-surface-500 dark:text-dark-muted shrink-0">Expected hash (verify):</label>
            <input type="text" id="hash-verify" value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} placeholder="Paste a hash to verify results against..."
              className="flex-1 min-w-0 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            {expectedNormalized && (
              <span className={`text-xs font-medium shrink-0 ${verifiedCount === activeAlgos.length ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                {verifiedCount}/{activeAlgos.length} match
              </span>
            )}
          </div>
          {activeAlgos.map((algo) => {
            const hash = results[algo.id];
            if (!hash) return null;
            const matches = expectedNormalized ? normHash(hash) === expectedNormalized : null;
            return (
              <div key={algo.id} className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">{algo.label}</span>
                    <span className="text-xs text-surface-400 dark:text-dark-muted">{algo.bits} bits ({algo.bits / 4} hex chars)</span>
                    {matches !== null && (
                      <span className={`text-xs font-medium ${matches ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {matches ? "✓ matches" : "✗ differs"}
                      </span>
                    )}
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
