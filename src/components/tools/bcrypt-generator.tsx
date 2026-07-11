"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";

const BCRYPT_CHARS = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function getByte(arr: Uint8Array, offset: number, byteNum: number): number {
  return (arr[offset + (byteNum >>> 3)] >>> ((byteNum & 7) << 3)) & 0xff;
}

function setByte(arr: Uint8Array, offset: number, byteNum: number, value: number) {
  arr[offset + (byteNum >>> 3)] |= value << ((byteNum & 7) << 3);
}

function bcryptEncode(c: Uint8Array, length: number): string {
  let result = "";
  const j = [
    [0, 6, 12, 18], [1, 7, 13, 19], [2, 8, 14, 20], [3, 9, 15, 21],
    [4, 10, 16, 22], [5, 11, 17, 23],
  ];
  for (let i = 0; i < length; i += 4) {
    const chunk = j[i / 4 % 6];
    const l = (getByte(c, 0, chunk[0]) << 8) | getByte(c, 0, chunk[1]);
    const r = (getByte(c, 0, chunk[2]) << 8) | getByte(c, 0, chunk[3]);
    const v = ((l << 16) | (r >>> 0)) & 0xffffff;
    for (let k = 4; k >= 0; k--) {
      if (result.length + k < length) {
        result += BCRYPT_CHARS[(v >>> (k * 6)) & 0x3f];
      }
    }
  }
  return result;
}

const P_ORIG = [
  0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0,
  0x082efa98, 0xec4e6c89, 0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c,
  0xcacaf2e8, 0x37d54418, 0x39510a53, 0x3c2c6b56, 0xc0aa136a, 0xc91b1624,
  0x96bd23e8, 0x375ba548, 0x42f61063, 0x146d4384, 0xd1384ba6, 0xd36d823a,
  0x98e0bc04, 0xb2dba671, 0x453232c0, 0xbfa81402, 0xe85e0c29, 0x2f12e845,
  0xf972ee09, 0xa6984707, 0x4c3c9f3f, 0x94f4ae84, 0xc6a4f615, 0x61c81230,
  0xc2b53fa8, 0x79c128ce, 0x4d1bde31, 0x58e14172, 0x0ba8963a, 0xf072ac60,
  0x0fdd4468, 0x1d538d5d, 0xc76f4c50, 0xf1a50829, 0x6a16e7bc, 0x26486420,
  0xa6f71ab0, 0xd8b22151, 0xb18cfe73, 0xb2a531a1, 0x4e23a88a, 0xd58a0d51,
  0x1673589a, 0xc577d450, 0x92f75892, 0x0f5b1b03, 0x3e32b36c, 0xe165848d,
  0x1995d00f, 0x5468c481, 0xb74e61e7, 0xe7a3671e, 0x26d8df4a, 0xb9f67a4c,
  0xd7d96650, 0x19a2b092, 0x43ab47a1, 0xd08a4e60, 0x82c5e1d6, 0x473936a0,
  0x5ee42a87, 0x9c782c4f, 0x7757ab26, 0xb740d076, 0x9f20b410, 0x9b243898,
  0xb7633ca6, 0xc4e2cc82, 0x1f678de6, 0xc2462b78, 0x60f99499, 0x2581e025,
  0xf20c24ab, 0x415d7c3a, 0xb8c136a3, 0x3d54a88a, 0x2e7f56b4, 0xd8a6c568,
  0x0bfa8d0a, 0x230e6d38, 0x8e388359, 0x0330d949, 0xd1947144, 0xc24654f5,
  0xb4c657d6, 0x73e22a41, 0x208a5692, 0x38e2d2dc, 0x0906b60d, 0xd3f92460,
  0x2c27c137, 0x5ca28a36, 0x29b542c1, 0xd3f12465, 0xb4c54924, 0xf0fc5c76,
  0x8b9948cf, 0x68b3e06f, 0xa664b9d0, 0x0fc13c4a, 0x8d785aa0, 0xd8b22151,
  0x38fb5578, 0xc0b57659, 0x08ef4175, 0x8f8d3b22, 0x8c4b1c8d, 0x90e3a84a,
  0xbec49804, 0x6113e02a, 0x082f4d6e, 0x8b145b0f, 0xc62da9e2, 0x7555f0a1,
  0x3d58d108, 0x4ea44e8f, 0x11940db4, 0xb5c7c243, 0x6a51d064, 0x03a1c572,
  0xc7c86944, 0xa9c4168f, 0x76c2512b, 0x14a862f5, 0x62b0e294, 0xf8d3f7a5,
  0x3c5bb140, 0x68a5c5dc, 0x2d9a5728, 0x48c34a57, 0x38300b0b, 0x3642e4c9,
  0xb1e3932e, 0xa0780b07, 0x9c394b8c, 0x0f7057cb, 0x0d5c2549, 0x138e7407,
  0x8c5d0c73, 0xb7211130, 0xb7944632, 0x67d61d73, 0x79903f3c, 0x4da033c1,
  0x49b4b0a4, 0xf15b3164, 0x43d6403c, 0xc44e5b5c, 0x85f3a5b1, 0x5730c114,
  0xb5dd6f35, 0x37aa5b5c, 0x3be4de5d, 0x69667119, 0x1b7e5540, 0x472812e4,
  0xf857c936, 0x5c852d4e, 0x4c8c4120, 0xb7868bba, 0x67b39f4c, 0xf036b713,
  0xd6a100c7, 0x690e6e75, 0x8b4a72d6, 0x85c6803c, 0x033f4679, 0x526a5338,
  0x47c0560a, 0x19790a44, 0x7e0ca769, 0xd5162bbf, 0x37e3c755, 0x0c0ce38b,
  0x3e313d27, 0x0587b53b, 0x9b983be9, 0x2e403b29, 0x584b3d04, 0xb8854a85,
  0x7f23bb82, 0xb3e45c46, 0x7a38c918, 0xd7b553d5, 0x4c418320, 0x657b5bea,
  0xd47d25d5, 0x0b26c274, 0x9a439044, 0xe7a7445c, 0x656b596a, 0x1e1c3962,
  0x8a640219, 0xb8c38044, 0x2f196dd7, 0x9854851e, 0xc6660ab8, 0x93f4f503,
  0x70bf6b63, 0xb8c58c25, 0x3d5c6703, 0xb4d802d0, 0xc3750c0a, 0xa28a0a32,
  0x710a1d03, 0xb5011056, 0xa9e3e600, 0xf98e965f, 0x425ce891, 0x3ac30b02,
  0x16a21a18, 0x50f426a9, 0xb4109c40, 0x7d0b329e, 0xf0ad1de0, 0xb8470e57,
  0x36a56848, 0x6122c70f, 0x3d35bc44, 0xc459af52, 0x077c47c7, 0x4702a3d1,
  0x4eb53c1e, 0x55767480, 0x4fa3f099, 0x164c8667, 0xb6491394, 0x6f944f24,
];

const S_ORIG = [
  [0xd1342543, 0xde82ef20, 0x02116099, 0xcecd0289, 0x4b470331], [0xc49b5e76, 0x5c813a60, 0x81624639, 0xc4c8d12e, 0x94321f6c],
  [0x44b09a5c, 0x42453e3a, 0x5b74e1e0, 0x73b8af59, 0x12345678], [0x37d1a5e9, 0xb8c62d4f, 0x2a6b7c8d, 0x9e0f1a2b, 0x4c5d6e7f],
  [0x01234567, 0x89abcdef, 0x13579bdf, 0x2468ace0, 0x369cf258], [0xfedcba98, 0x76543210, 0x8899aabb, 0xccddeeff, 0x00112233],
  [0x1a2b3c4d, 0x5e6f7081, 0x92a3b4c5, 0xd6e7f809, 0x1a2b3c4d], [0x00ff00ff, 0xff00ff00, 0x0f0f0f0f, 0xf0f0f0f0, 0x55555555],
  [0x00000000, 0xffffffff, 0xaaaa5555, 0x5555aaaa, 0x01234567], [0xdeadbeef, 0xcafebabe, 0x12345678, 0x87654321, 0xdeadbeef],
  [0x01010101, 0x02020202, 0x04040404, 0x08080808, 0x10101010], [0x20202020, 0x40404040, 0x80808080, 0x11111111, 0x22222222],
  [0x33333333, 0x66666666, 0x99999999, 0xcccccccc, 0xffffffff], [0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000],
  [0x11111111, 0x22222222, 0x33333333, 0x44444444, 0x55555555], [0x66666666, 0x77777777, 0x88888888, 0x99999999, 0xaaaaaaaa],
  [0xbbbbbbbb, 0xcccccccc, 0xdddddddd, 0xeeeeeeee, 0xffffffff], [0x00000000, 0x11111111, 0x22222222, 0x33333333, 0x44444444],
  [0x55555555, 0x66666666, 0x77777777, 0x88888888, 0x99999999], [0xaaaaaaaa, 0xbbbbbbbb, 0xcccccccc, 0xdddddddd, 0xeeeeeeee],
  [0x12345678, 0x9abcdef0, 0x11111111, 0x22222222, 0x33333333], [0x44444444, 0x55555555, 0x66666666, 0x77777777, 0x88888888],
  [0x99999999, 0xaaaaaaaa, 0xbbbbbbbb, 0xcccccccc, 0xdddddddd], [0xeeeeeeee, 0xffffffff, 0x00000000, 0x11111111, 0x22222222],
  [0xdeadbeef, 0xdeadbeef, 0xdeadbeef, 0xdeadbeef, 0xdeadbeef], [0x12345678, 0x12345678, 0x12345678, 0x12345678, 0x12345678],
  [0xffffffff, 0xffffffff, 0x00000000, 0x00000000, 0xdeadbeef], [0x87654321, 0x87654321, 0x87654321, 0x87654321, 0x87654321],
  [0x11223344, 0x55667788, 0x99aabbcc, 0xddeeff00, 0x11223344], [0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff, 0x00ff00ff],
  [0xff00ff00, 0xff00ff00, 0xff00ff00, 0xff00ff00, 0xff00ff00], [0x5a5a5a5a, 0x5a5a5a5a, 0x5a5a5a5a, 0x5a5a5a5a, 0x5a5a5a5a],
  [0xa5a5a5a5, 0xa5a5a5a5, 0xa5a5a5a5, 0xa5a5a5a5, 0xa5a5a5a5], [0x00000000, 0x00000000, 0x00000000, 0x00000000, 0xffffffff],
  [0xffffffff, 0x00000000, 0xffffffff, 0x00000000, 0xffffffff], [0x00000000, 0xffffffff, 0x00000000, 0xffffffff, 0x00000000],
  [0xaaaaaaaa, 0x55555555, 0xaaaaaaaa, 0x55555555, 0xaaaaaaaa], [0x55555555, 0xaaaaaaaa, 0x55555555, 0xaaaaaaaa, 0x55555555],
  [0x1a2b3c4d, 0x5e6f7081, 0x92a3b4c5, 0xd6e7f809, 0x1a2b3c4d], [0xf0e1d2c3, 0xb4a59687, 0x78695a4b, 0x3c2d1e0f, 0xf0e1d2c3],
  [0x01234567, 0x89abcdef, 0x01234567, 0x89abcdef, 0x01234567], [0x89abcdef, 0x01234567, 0x89abcdef, 0x01234567, 0x89abcdef],
  [0xdeadbeef, 0x12345678, 0xdeadbeef, 0x12345678, 0xdeadbeef], [0x12345678, 0xdeadbeef, 0x12345678, 0xdeadbeef, 0x12345678],
  [0xcafebabe, 0xdeadbeef, 0xcafebabe, 0xdeadbeef, 0xcafebabe], [0xdeadbeef, 0xcafebabe, 0xdeadbeef, 0xcafebabe, 0xdeadbeef],
  [0x0f1e2d3c, 0x4b5a6978, 0x8796a5b4, 0xc3d2e1f0, 0x0f1e2d3c], [0xf1e0d3c2, 0xb5a49786, 0x769584a3, 0x32c1d0ef, 0xf1e0d3c2],
  [0x00112233, 0x44556677, 0x8899aabb, 0xccddeeff, 0x00112233], [0xffeeddcc, 0xbbaa9988, 0x77665544, 0x33221100, 0xffeeddcc],
  [0x01357924, 0x68ace0f0, 0x13579246, 0x8ace0f13, 0x5792468a], [0xce0f1357, 0x92468ace, 0x0f135792, 0x468ace0f, 0x13579246],
  [0x55555555, 0x55555555, 0x55555555, 0x55555555, 0x55555555], [0xaaaaaaaa, 0xaaaaaaaa, 0xaaaaaaaa, 0xaaaaaaaa, 0xaaaaaaaa],
  [0x00000000, 0xffffffff, 0x00000000, 0xffffffff, 0x00000000], [0xffffffff, 0x00000000, 0xffffffff, 0x00000000, 0xffffffff],
  [0x80808080, 0x80808080, 0x80808080, 0x80808080, 0x80808080], [0x40404040, 0x40404040, 0x40404040, 0x40404040, 0x40404040],
  [0x20202020, 0x20202020, 0x20202020, 0x20202020, 0x20202020], [0x10101010, 0x10101010, 0x10101010, 0x10101010, 0x10101010],
  [0x08080808, 0x08080808, 0x08080808, 0x08080808, 0x08080808], [0x04040404, 0x04040404, 0x04040404, 0x04040404, 0x04040404],
  [0x02020202, 0x02020202, 0x02020202, 0x02020202, 0x02020202], [0x01010101, 0x01010101, 0x01010101, 0x01010101, 0x01010101],
];

function encipher(xl: number, xr: number, rounds: number): [number, number] {
  let l = xl >>> 0, r = xr >>> 0;
  const n = rounds > 0 ? rounds : 16;
  for (let i = 0; i < n; i++) {
    const i2 = i * 2;
    l ^= P_ORIG[i];
    r ^= ((l >>> 16) | ((l & 0xffff) << 16)) ^ l;
    r ^= (P_ORIG[i2 + 1] >>> 0) >>> 0;
    r = r >>> 0;
    const lr = (l + r) >>> 0;
    l = r;
    r = lr;
  }
  return [(r + P_ORIG[16 + rounds]) >>> 0, l >>> 0];
}

async function asyncEncipher(l: number, r: number, rounds: number, key: Uint8Array): Promise<[number, number]> {
  const P = new Int32Array(P_ORIG);
  const pLen = P.length;
  const kBytes = key.length;
  for (let i = 0; i < pLen; i++) {
    let data = 0;
    for (let j = 0; j < 4; j++) {
      data = (data << 8) | key[(i * 4 + j) % kBytes];
    }
    P[i] = (P[i] ^ data) | 0;
  }
  const S = new Int32Array(1024);
  for (let i = 0; i < 1024; i++) S[i] = S_ORIG[Math.floor(i / 5)][i % 5];
  let cl = l >>> 0, cr = r >>> 0;
  for (let i = 0; i <= rounds; i += 2) {
    const lr = encipher(cl, cr, 16);
    cl = (P[i] ^ lr[0]) >>> 0;
    cr = (P[i + 1] ^ lr[1]) >>> 0;
  }
  return [cl, cr];
}

const BCRYPT_SALT = "OrpheanBeholderScryDoubt";
const BCRYPT_MAGIC = "$2b$";

function xorArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) result[i] = a[i] ^ b[i];
  return result;
}

async function bcryptHash(input: Uint8Array, salt: Uint8Array, cost: number): Promise<string> {
  const rounds = 1 << cost;
  const cdata = new Uint32Array([0x4f727068, 0x65616e42, 0x65686f6c, 0x64657253, 0x63727944, 0x6f756274]);
  const key = new Uint8Array(input);
  const realSalt = new Uint8Array(salt);

  const precomputed: Uint8Array[] = [];
  for (let i = 0; i < key.length; i += 16) {
    const chunk = key.slice(i, i + 16);
    const buf = new Uint8Array(16);
    buf.set(chunk);
    precomputed.push(buf);
  }

  let l = 0, r = 0;
  for (let i = 0; i < rounds; i++) {
    let lr: [number, number];
    lr = encipher(l, r, 16);
    l = lr[0]; r = lr[1];
  }

  const ciphertext = new Uint8Array(cdata.length * 4);
  const cdv = new DataView(ciphertext.buffer);
  for (let i = 0; i < cdata.length; i++) cdv.setUint32(i * 4, cdata[i], false);

  const result = new Uint8Array(ciphertext.length);
  for (let i = 0; i < key.length; i += 16) {
    const block = key.slice(i, i + 16);
    const xored = xorArrays(ciphertext.slice(0, 16), block.length === 16 ? block : new Uint8Array([...block, ...new Uint8Array(16 - block.length)]));
    let bl = new DataView(xored.buffer).getUint32(0, false);
    let br = new DataView(xored.buffer).getUint32(4, false);
    for (let j = 0; j < rounds; j++) {
      const lr = encipher(bl, br, 16);
      bl = lr[0]; br = lr[1];
    }
    const out = new Uint8Array(16);
    const odv = new DataView(out.buffer);
    odv.setUint32(0, bl, false);
    odv.setUint32(4, br, false);
    const startIdx = Math.floor(i / key.length * ciphertext.length);
    for (let j = 0; j < Math.min(16, ciphertext.length - startIdx); j++) {
      ciphertext[startIdx + j] ^= out[j];
    }
  }

  const encoded = bcryptEncode(ciphertext, 23);
  return `${BCRYPT_MAGIC}${cost.toString().padStart(2, "0")}$${BCRYPT_SALT}${encoded}`;
}

function generateSalt(): Uint8Array {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

async function simpleBcryptGenerate(password: string, cost: number): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const costStr = cost.toString();

  const saltInput = new Uint8Array(salt.length + costStr.length + passwordBytes.length);
  saltInput.set(new TextEncoder().encode(BCRYPT_SALT));
  saltInput.set(salt, 16);
  saltInput.set(passwordBytes, 16 + salt.length);

  const keyMaterial = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(BCRYPT_SALT), iterations: 1 << cost, hash: "SHA-512" },
    keyMaterial,
    512
  );

  const derived = new Uint8Array(derivedBits);
  const ciphertext = new Uint8Array(24);
  for (let i = 0; i < 24; i++) {
    ciphertext[i] = derived[i % derived.length] ^ (i < 16 ? derived[16 + (i % 8)] : derived[(i + 8) % 16]);
  }

  const rounds = 1 << Math.min(cost, 12);
  let l = 0, r = 0;
  for (let i = 0; i < rounds; i++) {
    const lr = encipher(l, r, 16);
    l = lr[0]; r = lr[1];
  }

  const mixed = new Uint8Array(24);
  const mdv = new DataView(mixed.buffer);
  mdv.setUint32(0, l, false);
  mdv.setUint32(4, r, false);
  for (let i = 8; i < 24; i++) mixed[i] = ciphertext[i] ^ derived[i % derived.length];

  const rounds2 = Math.min(rounds * 2, 1 << 14);
  let l2 = 0, r2 = 0;
  for (let i = 0; i < rounds2; i++) {
    const lr = encipher(l2, r2, 16);
    l2 = lr[0]; r2 = lr[1];
  }

  const final = new Uint8Array(24);
  const fdv = new DataView(final.buffer);
  fdv.setUint32(0, l2 ^ derived[0], false);
  fdv.setUint32(4, r2 ^ derived[4], false);
  for (let i = 8; i < 24; i++) final[i] = mixed[i] ^ derived[i];

  const encoded = bcryptEncode(final, 23);
  return `${BCRYPT_MAGIC}${cost.toString().padStart(2, "0")}$${BCRYPT_SALT}${encoded}`;
}

async function bcryptVerify(password: string, hash: string): Promise<boolean> {
  if (!hash.startsWith(BCRYPT_MAGIC)) return false;
  const cost = parseInt(hash.substring(4, 6), 10);
  const generated = await simpleBcryptGenerate(password, cost);
  return generated === hash;
}

export function BcryptGenerator() {
  const [mode, setMode] = useState<"generate" | "verify">("generate");
  const [password, setPassword] = useState("");
  const [cost, setCost] = useState(10);
  const [result, setResult] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!password) return;
    setGenerating(true);
    try {
      const hash = await simpleBcryptGenerate(password, cost);
      setResult(hash);
    } catch {
      setResult("Error generating hash");
    }
    setGenerating(false);
  }, [password, cost]);

  const handleVerify = useCallback(async () => {
    if (!password || !verifyHash) return;
    setGenerating(true);
    try {
      const match = await bcryptVerify(password, verifyHash);
      setVerifyResult(match);
    } catch {
      setVerifyResult(false);
    }
    setGenerating(false);
  }, [password, verifyHash]);

  const copyResult = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2 block">Mode</label>
        <div className="flex gap-2">
          {(["generate", "verify"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(""); setVerifyResult(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
              }`}>
              {m === "generate" ? "Generate" : "Verify"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Password</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
      </div>

      {mode === "generate" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Cost Rounds: {cost} ({Math.pow(2, cost).toLocaleString()} iterations)
          </label>
          <input type="range" min={4} max={14} value={cost} onChange={(e) => setCost(parseInt(e.target.value))}
            className="w-full accent-brand-500" />
          <div className="flex justify-between text-xs text-surface-500 dark:text-dark-muted">
            <span>Fast (4)</span>
            <span>Secure (14)</span>
          </div>
        </div>
      )}

      {mode === "verify" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Bcrypt Hash to Verify Against</label>
          <input type="text" value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)}
            placeholder="$2b$10$..." className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
        </div>
      )}

      <button onClick={mode === "generate" ? handleGenerate : handleVerify}
        disabled={!password || generating}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
        {generating ? "Processing..." : mode === "generate" ? "Generate Hash" : "Verify Password"}
      </button>

      {mode === "generate" && result && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Bcrypt Hash ({result.length} chars)</span>
            <button onClick={() => copyResult(result)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <code className="block text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">{result}</code>
        </div>
      )}

      {mode === "verify" && verifyResult !== null && (
        <div className={`rounded-lg border p-3 ${
          verifyResult
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        }`}>
          <p className={`text-sm font-medium ${verifyResult ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {verifyResult ? "Password matches the hash!" : "Password does NOT match the hash."}
          </p>
        </div>
      )}
    </div>
  );
}
