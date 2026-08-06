import { describe, it, expect } from "vitest";
import {
  md5Hex,
  md5BytesHex,
  sha224Hex,
  sha256Hex,
  ripemd160Hex,
  sha3Hex,
  hmacHex,
  formatHashHex,
} from "@/lib/crypto-hash";

const encoder = new TextEncoder();

describe("md5Hex", () => {
  it("hashes empty string", () => {
    expect(md5Hex("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("hashes 'abc'", () => {
    expect(md5Hex("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  });

  it("matches byte-input variant", () => {
    expect(md5BytesHex(encoder.encode("The quick brown fox jumps over the lazy dog"))).toBe(
      "9e107d9d372bb6826bd81d3542a419d6"
    );
  });
});

describe("sha224 / sha256", () => {
  it("SHA-224('abc')", () => {
    expect(sha224Hex("abc")).toBe(
      "23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7"
    );
  });

  it("SHA-256('abc')", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("ripemd160", () => {
  it("RIPEMD-160('')", () => {
    expect(ripemd160Hex("")).toBe("9c1185a5c5e9fc54612808977ee8f548b2258d31");
  });

  it("RIPEMD-160('abc')", () => {
    expect(ripemd160Hex("abc")).toBe("8eb208f7e05d987a9b044a8e98c6b087f15a0bfc");
  });
});

describe("sha3 (Keccak)", () => {
  it("SHA3-256('')", () => {
    expect(sha3Hex("", 256)).toBe(
      "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
    );
  });

  it("SHA3-512('')", () => {
    expect(sha3Hex("", 512)).toBe(
      "a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26"
    );
  });
});

describe("hmacHex", () => {
  const msg = "The quick brown fox jumps over the lazy dog";

  it("HMAC-MD5", async () => {
    expect(await hmacHex("MD5", msg, "key")).toBe(
      "80070713463e7749b90c2dc24911e275"
    );
  });

  it("matches WebCrypto for SHA-1/SHA-256/SHA-384/SHA-512", async () => {
    for (const id of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const) {
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode("key"),
        { name: "HMAC", hash: id },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(msg));
      const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(await hmacHex(id, msg, "key")).toBe(expected);
    }
  });

  it("SHA-3 HMAC produces a non-empty hex digest", async () => {
    const hex = await hmacHex("SHA3-512", msg, "key");
    expect(hex).toMatch(/^[0-9a-f]{128}$/);
  });

  it("HMAC-RIPEMD-160", async () => {
    expect(await hmacHex("RIPEMD-160", "abc", "secret")).toBe(
      "a36c211134cfaa21b513beb803ae4db81717398d"
    );
  });

  it("HMAC-SHA-224", async () => {
    expect(await hmacHex("SHA-224", msg, "key")).toBe(
      "88ff8b54675d39b8f72322e65ff945c52d96379988ada25639747e69"
    );
  });
});

describe("formatHashHex", () => {
  it("hex passthrough", () => {
    expect(formatHashHex("ff00", "hex")).toBe("ff00");
  });

  it("base64 encoding", () => {
    expect(formatHashHex("ff00", "base64")).toBe(btoa(String.fromCharCode(0xff, 0x00)));
  });

  it("binary encoding", () => {
    expect(formatHashHex("ff05", "binary")).toBe("1111111100000101");
  });
});