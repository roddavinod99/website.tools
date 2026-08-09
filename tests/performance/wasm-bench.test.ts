import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { md5Hex, sha224Hex } from "@/lib/crypto-hash";

const MODULE_URL = new URL("../../src/lib/wasm/pkg/website_tools_wasm.js", import.meta.url);
const WASM_URL = new URL("../../src/lib/wasm/pkg/website_tools_wasm_bg.wasm", import.meta.url);

async function loadWasm() {
  const m = await import(/* @vite-ignore */ MODULE_URL.href);
  if (typeof m.default === "function") {
    const bytes = readFileSync(fileURLToPath(WASM_URL));
    m.initSync(bytes);
  }
  return m;
}

const encoder = new TextEncoder();

interface WasmModule {
  json_format: (input: string, indent: number) => string;
  json_minify: (input: string) => string;
  json_validate: (input: string) => boolean;
  base64_encode: (input: string) => string;
  base64_decode: (input: string) => string;
  url_encode: (input: string) => string;
  url_decode: (input: string) => string;
  md5_hash: (input: string) => string;
  sha224_hash: (input: string) => string;
  sha256_hash: (input: string) => string;
  sha512_hash: (input: string) => string;
  hmac_sha256: (input: string, key: string) => string;
}

const WARMUP = 1;
const SAMPLES = 7;
const SIZES = [1024, 100 * 1024, 1024 * 1024];
const LARGE_SIZES = [1024, 100 * 1024, 1024 * 1024, 5 * 1024 * 1024];
const STRICT = process.env.WASM_BENCH_STRICT === "1";

const TEXT_BLOCK =
  "The quick brown fox jumps over the lazy dog. 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ ~!@#$%^&*()_+{}[]|\\:;\"'<>,.?/ \n\t";

function textOfSize(size: number): string {
  return TEXT_BLOCK.repeat(Math.ceil(size / TEXT_BLOCK.length)).slice(0, size);
}

function jsonOfSize(size: number): string {
  const record =
    '{"id":1,"name":"dev tool","active":true,"score":0.95,"tags":["json","wasm"],"meta":{"a":1,"b":2}}';
  const count = Math.max(1, Math.floor(size / record.length));
  const items = Array.from({ length: count }, (_, i) => record.replace("1}", `${i + 1000}}`));
  return `[${items.join(",")}]`;
}

function bytesToHex(buf: Uint8Array): string {
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function benchMs(fn: () => unknown): number {
  for (let i = 0; i < WARMUP; i++) fn();
  const runs: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const start = performance.now();
    fn();
    runs.push(performance.now() - start);
  }
  return median(runs);
}

async function benchAsyncMs(fn: () => Promise<unknown>): Promise<number> {
  for (let i = 0; i < WARMUP; i++) await fn();
  const runs: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const start = performance.now();
    await fn();
    runs.push(performance.now() - start);
  }
  return median(runs);
}

async function hmacSha256Hex(input: string, key: string, subtle: SubtleCrypto): Promise<string> {
  const cryptoKey = await subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await subtle.sign("HMAC", cryptoKey, encoder.encode(input));
  return bytesToHex(new Uint8Array(sig));
}

interface CaseRow {
  labelName: string;
  size: number;
  jsMs: number;
  wasmMs: number;
  ratio: number;
  label: "ADOPT" | "TIE" | "SKIP";
}

const results: CaseRow[] = [];

function record(labelName: string, size: number, jsMs: number, wasmMs: number): void {
  const ratio = jsMs / wasmMs;
  const label: "ADOPT" | "TIE" | "SKIP" =
    ratio >= 1.2 ? "ADOPT" : ratio <= 0.8 ? "SKIP" : "TIE";
  results.push({ labelName, size, jsMs, wasmMs, ratio, label });
  console.log(
    `  ${label.padEnd(5)} ${labelName.padEnd(13)} ${String(size).padStart(8)}B  js=${jsMs.toFixed(3).padStart(9)}ms  wasm=${wasmMs.toFixed(3).padStart(9)}ms  ratio=${ratio.toFixed(2)}`
  );
}

describe("WASM vs JS benchmark harness", () => {
  it(
    "records and labels all paired cases",
    async () => {
    const mod = (await loadWasm()) as unknown as WasmModule;
    const subtle = globalThis.crypto.subtle;

    console.log("\n=== WASM vs JS benchmarks ===");

    for (const size of SIZES) {
      const json = jsonOfSize(size);
      // 1 JSON format. Parity compares parsed values: serde_json serializes
      // objects with sorted keys, JSON.stringify preserves insertion order.
      const fmtJs = () => JSON.stringify(JSON.parse(json), null, 2);
      const fmtWasm = () => mod.json_format(json, 2);
      expect(JSON.parse(fmtWasm())).toEqual(JSON.parse(fmtJs()));
      record("json.format", size, benchMs(fmtJs), benchMs(fmtWasm));

      // 2 JSON minify
      const minJs = () => JSON.stringify(JSON.parse(json));
      const minWasm = () => mod.json_minify(json);
      expect(JSON.parse(minWasm())).toEqual(JSON.parse(minJs()));
      record("json.minify", size, benchMs(minJs), benchMs(minWasm));

      // 3 JSON validate
      const valJs = () => {
        try { JSON.parse(json); return true; } catch { return false; }
      };
      const valWasm = () => mod.json_validate(json);
      expect(valWasm()).toBe(valJs());
      record("json.validate", size, benchMs(valJs), benchMs(valWasm));

      // 9a base64 encode
      const text = textOfSize(size);
      const b64Js = () => btoa(text);
      const b64Wasm = () => mod.base64_encode(text);
      expect(b64Wasm()).toBe(b64Js());
      record("b64.encode", size, benchMs(b64Js), benchMs(b64Wasm));

      // 9b base64 decode
      const encoded = btoa(text);
      const b64dJs = () => atob(encoded);
      const b64dWasm = () => mod.base64_decode(encoded);
      expect(b64dWasm()).toBe(b64dJs());
      record("b64.decode", size, benchMs(b64dJs), benchMs(b64dWasm));

      // 10a url encode. The wasm fn uses the WHATWG percent-encoding set
      // (escapes `! ~ * ( ) '`), JS encodeURIComponent leaves those literal.
      // Parity therefore asserts both encode into something that decodes back
      // to the original input.
      const ueJs = () => encodeURIComponent(text);
      const ueWasm = () => mod.url_encode(text);
      expect(decodeURIComponent(ueWasm())).toBe(text);
      expect(decodeURIComponent(ueJs())).toBe(text);
      record("url.encode", size, benchMs(ueJs), benchMs(ueWasm));

      // 10b url decode
      const encodedUrl = encodeURIComponent(text);
      const udJs = () => decodeURIComponent(encodedUrl);
      const udWasm = () => mod.url_decode(encodedUrl);
      expect(udWasm()).toBe(udJs());
      record("url.decode", size, benchMs(udJs), benchMs(udWasm));
    }

    for (const size of SIZES) {
      const text = textOfSize(size);

      // 4 md5
      const md5Js = () => md5Hex(text);
      const md5Wasm = () => mod.md5_hash(text);
      expect(md5Wasm()).toBe(md5Js());
      record("md5", size, benchMs(md5Js), benchMs(md5Wasm));

      // 5 sha224
      const s224Js = () => sha224Hex(text);
      const s224Wasm = () => mod.sha224_hash(text);
      expect(s224Wasm()).toBe(s224Js());
      record("sha224", size, benchMs(s224Js), benchMs(s224Wasm));

      // 6 sha256 (wasm vs WebCrypto)
      const s256Js = async () => bytesToHex(new Uint8Array(await subtle.digest("SHA-256", encoder.encode(text))));
      const s256Wasm = () => mod.sha256_hash(text);
      expect(s256Wasm()).toBe(await s256Js());
      record("sha256", size, await benchAsyncMs(s256Js), benchMs(s256Wasm));

      // 8 hmac-sha256
      const hJs = async () => hmacSha256Hex(text, "bench-key", subtle);
      const hWasm = () => mod.hmac_sha256(text, "bench-key");
      expect(hWasm()).toBe(await hJs());
      record("hmac.sha256", size, await benchAsyncMs(hJs), benchMs(hWasm));
    }

    for (const size of LARGE_SIZES) {
      const text = textOfSize(size);

      // 7 sha512 (wasm vs WebCrypto)
      const s512Js = async () => bytesToHex(new Uint8Array(await subtle.digest("SHA-512", encoder.encode(text))));
      const s512Wasm = () => mod.sha512_hash(text);
      expect(s512Wasm()).toBe(await s512Js());
      record("sha512", size, await benchAsyncMs(s512Js), benchMs(s512Wasm));
    }

    writeReport();

    const adoptCount = results.filter((r) => r.label === "ADOPT").length;
    const skipCount = results.filter((r) => r.label === "SKIP").length;
    console.log(`\n=== Summary: ${adoptCount} ADOPT, ${skipCount} SKIP, ${results.length} total (strict=${STRICT}) ===`);

    if (STRICT) {
      const nonAdopt = results.filter((r) => r.label !== "ADOPT");
      expect(nonAdopt).toEqual([]);
    }
    },
    120_000
  );
});

function writeReport(): void {
  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(
    join(dataDir, "wasm-benchmark.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), strict: STRICT, results }, null, 2),
    "utf-8"
  );
}