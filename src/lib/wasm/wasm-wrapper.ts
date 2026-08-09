// WASM module wrapper for website-tools-wasm
// Dynamically imports WASM only on client side to avoid SSR issues.
// Every exported helper returns a Promise and only touches WASM after the
// module is loaded. Callers should treat failures as "not available" and
// fall back to their existing JS implementation.

type WasmModule = {
  json_format: (input: string, indent: number) => string;
  json_minify: (input: string) => string;
  json_validate: (input: string) => boolean;
  base64_encode: (input: string) => string;
  base64_decode: (input: string) => string;
  base64_url_encode: (input: string) => string;
  base64_url_decode: (input: string) => string;
  url_encode: (input: string) => string;
  url_decode: (input: string) => string;
  md5_hash: (input: string) => string;
  sha1_hash: (input: string) => string;
  sha224_hash: (input: string) => string;
  sha224_bytes: (input: Uint8Array) => string;
  sha256_hash: (input: string) => string;
  sha384_hash: (input: string) => string;
  sha512_hash: (input: string) => string;
  hmac_sha1: (input: string, key: string) => string;
  hmac_sha256: (input: string, key: string) => string;
  hmac_sha512: (input: string, key: string) => string;
};

let wasmModule: WasmModule | null = null;
let wasmInitPromise: Promise<void> | null = null;

async function loadWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  if (wasmInitPromise) await wasmInitPromise;

  // Only load WASM on client side
  if (typeof window === "undefined") {
    throw new Error("WASM can only be loaded on the client side");
  }

  wasmInitPromise = (async () => {
    const mod = await import("./pkg/website_tools_wasm.js");
    // Modern wasm-bindgen (>=0.2.100) exposes an async `__wbg_init` default
    // export that must be awaited before any function can run. Resolve the
    // .wasm via an explicit URL so both Vite (vitest) and webpack/Next.js
    // emit and fetch the asset correctly.
    if (typeof mod.default === "function") {
      const wasmUrl = new URL("./pkg/website_tools_wasm_bg.wasm", import.meta.url);
      await mod.default({ module_or_path: wasmUrl });
    }
    wasmModule = {
      json_format: mod.json_format,
      json_minify: mod.json_minify,
      json_validate: mod.json_validate,
      base64_encode: mod.base64_encode,
      base64_decode: mod.base64_decode,
      base64_url_encode: mod.base64_url_encode,
      base64_url_decode: mod.base64_url_decode,
      url_encode: mod.url_encode,
      url_decode: mod.url_decode,
      md5_hash: mod.md5_hash,
      sha1_hash: mod.sha1_hash,
      sha224_hash: mod.sha224_hash,
      sha224_bytes: mod.sha224_bytes,
      sha256_hash: mod.sha256_hash,
      sha384_hash: mod.sha384_hash,
      sha512_hash: mod.sha512_hash,
      hmac_sha1: mod.hmac_sha1,
      hmac_sha256: mod.hmac_sha256,
      hmac_sha512: mod.hmac_sha512,
    };
  })();
  await wasmInitPromise;
  if (!wasmModule) throw new Error("WASM module failed to initialize");
  return wasmModule;
}

export async function jsonFormatWasm(input: string, indent: number): Promise<string> {
  const mod = await loadWasm();
  return mod.json_format(input, indent);
}

export async function jsonMinifyWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.json_minify(input);
}

export async function jsonValidateWasm(input: string): Promise<boolean> {
  const mod = await loadWasm();
  return mod.json_validate(input);
}

export async function base64EncodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.base64_encode(input);
}

export async function base64DecodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.base64_decode(input);
}

export async function base64UrlEncodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.base64_url_encode(input);
}

export async function base64UrlDecodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.base64_url_decode(input);
}

export async function urlEncodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.url_encode(input);
}

export async function urlDecodeWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.url_decode(input);
}

export async function md5HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.md5_hash(input);
}

export async function sha1HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.sha1_hash(input);
}

export async function sha224HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.sha224_hash(input);
}

export async function sha224BytesWasm(input: Uint8Array): Promise<string> {
  const mod = await loadWasm();
  return mod.sha224_bytes(input);
}

export async function sha256HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.sha256_hash(input);
}

export async function sha384HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.sha384_hash(input);
}

export async function sha512HashWasm(input: string): Promise<string> {
  const mod = await loadWasm();
  return mod.sha512_hash(input);
}

export async function hmacSha1Wasm(input: string, key: string): Promise<string> {
  const mod = await loadWasm();
  return mod.hmac_sha1(input, key);
}

export async function hmacSha256Wasm(input: string, key: string): Promise<string> {
  const mod = await loadWasm();
  return mod.hmac_sha256(input, key);
}

export async function hmacSha512Wasm(input: string, key: string): Promise<string> {
  const mod = await loadWasm();
  return mod.hmac_sha512(input, key);
}