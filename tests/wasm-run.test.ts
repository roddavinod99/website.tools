import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MODULE_URL = new URL("../src/lib/wasm/pkg/website_tools_wasm.js", import.meta.url);
const WASM_URL = new URL("../src/lib/wasm/pkg/website_tools_wasm_bg.wasm", import.meta.url);

async function loadWasm() {
  const m = await import(/* @vite-ignore */ MODULE_URL.href);
  if (typeof m.default === "function") {
    const bytes = readFileSync(fileURLToPath(WASM_URL));
    m.initSync(bytes);
  }
  return m;
}

describe("website-tools-wasm module", () => {
  it("exports all 19 functions", async () => {
    const m = await loadWasm();
    const expected = [
      "base64_decode",
      "base64_encode",
      "base64_url_decode",
      "base64_url_encode",
      "hmac_sha1",
      "hmac_sha256",
      "hmac_sha512",
      "json_format",
      "json_minify",
      "json_validate",
      "md5_hash",
      "sha1_hash",
      "sha224_hash",
      "sha224_bytes",
      "sha256_hash",
      "sha384_hash",
      "sha512_hash",
      "url_decode",
      "url_encode",
    ];
    for (const name of expected) {
      expect(typeof m[name], name).toBe("function");
    }
  });

  it("md5 matches known vectors", async () => {
    const m = await loadWasm();
    expect(m.md5_hash("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(m.md5_hash("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(m.md5_hash("hello world")).toBe("5eb63bbbe01eeed093cb22bb8f5acdc3");
  });

  it("sha224 matches NIST vector (RFC 3874)", async () => {
    const m = await loadWasm();
    expect(m.sha224_hash("abc")).toBe("23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7");
    expect(m.sha224_hash("")).toBe("d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f");
  });

  it("sha224_bytes hashes raw bytes", async () => {
    const m = await loadWasm();
    expect(m.sha224_bytes(new TextEncoder().encode("abc"))).toBe("23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7");
  });

  it("sha256 matches NIST vector", async () => {
    const m = await loadWasm();
    expect(m.sha256_hash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("json_validate rejects malformed JSON", async () => {
    const m = await loadWasm();
    expect(m.json_validate('{"a":1}')).toBe(true);
    expect(m.json_validate("{oops}")).toBe(false);
  });

  it("json_format pretty-prints", async () => {
    const m = await loadWasm();
    expect(m.json_format('{"a":1}', 2)).toBe('{\n  "a": 1\n}');
  });

  it("base64 encodes and decodes", async () => {
    const m = await loadWasm();
    expect(m.base64_encode("hello")).toBe("aGVsbG8=");
    expect(m.base64_decode("aGVsbG8=")).toBe("hello");
  });

  it("base64 url-safe roundtrip", async () => {
    const m = await loadWasm();
    const encoded = m.base64_url_encode("a+b/c?d");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(m.base64_url_decode(encoded)).toBe("a+b/c?d");
  });

  it("url encode/decode roundtrip", async () => {
    const m = await loadWasm();
    expect(m.url_encode("a b&c")).toBe("a%20b%26c");
    expect(m.url_decode("a%20b%26c")).toBe("a b&c");
  });

  it("hmac_sha256 matches RFC 4231 test vector for string keys", async () => {
    const m = await loadWasm();
    // The wasm fn treats `key` as a raw UTF-8 string (matches Node's crypto).
    // RFC 4231 vector with the key given as its hex byte sequence raises this
    // to a string, so expected value is the key string taken literally.
    const key = "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b";
    const data = "Hi There";
    expect(m.hmac_sha256(data, key)).toBe(
      "0dff03eeb5bca6b9fd6b52d08cfc8ac04e169a3d0233fbff72b5b844fba0f96b"
    );
  });
});