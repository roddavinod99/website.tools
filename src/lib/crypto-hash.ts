/**
 * Native JavaScript implementations of hash/HMAC algorithms not exposed by the
 * Web Crypto API (MD5, SHA-224, RIPEMD-160, SHA-3/Keccak, and their HMACs).
 *
 * Web Crypto (crypto.subtle) covers SHA-1, SHA-256, SHA-384 and SHA-512, so
 * those are handled natively by the browser. This module fills the remaining
 * gaps without introducing external dependencies.
 */

const encode = new TextEncoder();

function bytesToHex(buf: Uint8Array): string {
  let out = "";
  for (let i = 0; i < buf.length; i++) out += buf[i].toString(16).padStart(2, "0");
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

export function md5Hex(data: string): string {
  return bytesToHex(md5Bytes(encode.encode(data)));
}

export function md5BytesHex(data: Uint8Array): string {
  return bytesToHex(md5Bytes(data));
}

export function md5Bytes(message: Uint8Array): Uint8Array {
  const msgLen = message.length;
  const bitLenLo = msgLen * 8;
  const bitLenHi = Math.floor(msgLen / 0x20000000) >>> 0;
  const rem = (msgLen + 1) % 64;
  const padLen = rem <= 56 ? 56 - rem : 120 - rem;
  const total = msgLen + 1 + padLen + 8;
  const padded = new Uint8Array(total);
  padded.set(message);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(total - 8, bitLenLo, true);
  view.setUint32(total - 4, bitLenHi, true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  const add32 = (x: number, y: number) => (x + y) & 0xffffffff;
  const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => {
    a = add32(add32(a, q), add32(x, t));
    return add32(rotl(a, s), b);
  };
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t);

  for (let i = 0; i < total; i += 64) {
    const M: number[] = [];
    const dv = new DataView(padded.buffer, i, 64);
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(j * 4, true);

    let a = a0, b = b0, c = c0, d = d0;

    a = ff(a, b, c, d, M[0], 7, -680876936);   d = ff(d, a, b, c, M[1], 12, -389564586);
    c = ff(c, d, a, b, M[2], 17, 606105819);   b = ff(b, c, d, a, M[3], 22, -1044525330);
    a = ff(a, b, c, d, M[4], 7, -176418897);   d = ff(d, a, b, c, M[5], 12, 1200080426);
    c = ff(c, d, a, b, M[6], 17, -1473231341); b = ff(b, c, d, a, M[7], 22, -45705983);
    a = ff(a, b, c, d, M[8], 7, 1770035416);   d = ff(d, a, b, c, M[9], 12, -1958414417);
    c = ff(c, d, a, b, M[10], 17, -42063);     b = ff(b, c, d, a, M[11], 22, -1990404162);
    a = ff(a, b, c, d, M[12], 7, 1804603682);  d = ff(d, a, b, c, M[13], 12, -40341101);
    c = ff(c, d, a, b, M[14], 17, -1502002290); b = ff(b, c, d, a, M[15], 22, 1236535329);

    a = gg(a, b, c, d, M[1], 5, -165796510);   d = gg(d, a, b, c, M[6], 9, -1069501632);
    c = gg(c, d, a, b, M[11], 14, 643717713);  b = gg(b, c, d, a, M[0], 20, -373897302);
    a = gg(a, b, c, d, M[5], 5, -701558691);   d = gg(d, a, b, c, M[10], 9, 38016083);
    c = gg(c, d, a, b, M[15], 14, -660478335); b = gg(b, c, d, a, M[4], 20, -405537848);
    a = gg(a, b, c, d, M[9], 5, 568446438);    d = gg(d, a, b, c, M[14], 9, -1019803690);
    c = gg(c, d, a, b, M[3], 14, -187363961);  b = gg(b, c, d, a, M[8], 20, 1163531501);
    a = gg(a, b, c, d, M[13], 5, -1444681467); d = gg(d, a, b, c, M[2], 9, -51403784);
    c = gg(c, d, a, b, M[7], 14, 1735328473);  b = gg(b, c, d, a, M[12], 20, -1926607734);

    a = hh(a, b, c, d, M[5], 4, -378558);      d = hh(d, a, b, c, M[8], 11, -2022574463);
    c = hh(c, d, a, b, M[11], 16, 1839030562); b = hh(b, c, d, a, M[14], 23, -35309556);
    a = hh(a, b, c, d, M[1], 4, -1530992060);  d = hh(d, a, b, c, M[4], 11, 1272893353);
    c = hh(c, d, a, b, M[7], 16, -155497632);  b = hh(b, c, d, a, M[10], 23, -1094730640);
    a = hh(a, b, c, d, M[13], 4, 681279174);   d = hh(d, a, b, c, M[0], 11, -358537222);
    c = hh(c, d, a, b, M[3], 16, -722521979);  b = hh(b, c, d, a, M[6], 23, 76029189);
    a = hh(a, b, c, d, M[9], 4, -640364487);   d = hh(d, a, b, c, M[12], 11, -421815835);
    c = hh(c, d, a, b, M[15], 16, 530742520);  b = hh(b, c, d, a, M[2], 23, -995338651);

    a = ii(a, b, c, d, M[0], 6, -198630844);   d = ii(d, a, b, c, M[7], 10, 1126891415);
    c = ii(c, d, a, b, M[14], 15, -1416354905); b = ii(b, c, d, a, M[5], 21, -57434055);
    a = ii(a, b, c, d, M[12], 6, 1700485571);  d = ii(d, a, b, c, M[3], 10, -1894986606);
    c = ii(c, d, a, b, M[10], 15, -1051523);   b = ii(b, c, d, a, M[1], 21, -2054922799);
    a = ii(a, b, c, d, M[8], 6, 1873313359);   d = ii(d, a, b, c, M[15], 10, -30611744);
    c = ii(c, d, a, b, M[6], 15, -1560198380); b = ii(b, c, d, a, M[13], 21, 1309151649);
    a = ii(a, b, c, d, M[4], 6, -145523070);   d = ii(d, a, b, c, M[11], 10, -1120210379);
    c = ii(c, d, a, b, M[2], 15, 718787259);   b = ii(b, c, d, a, M[9], 21, -343485551);

    a0 = add32(a0, a); b0 = add32(b0, b); c0 = add32(c0, c); d0 = add32(d0, d);
  }

  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true);
  odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true);
  odv.setUint32(12, d0, true);
  return out;
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256Core(message: Uint8Array, iv: number[]): Uint8Array {
  const msgLen = message.length;
  const bitLenHi = Math.floor(msgLen / 0x20000000) >>> 0;
  const bitLenLo = msgLen * 8;
  const rem = (msgLen + 1) % 64;
  const padLen = rem <= 56 ? 56 - rem : 120 - rem;
  const total = msgLen + 1 + padLen + 8;
  const padded = new Uint8Array(total);
  padded.set(message);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(total - 8, bitLenHi, false);
  view.setUint32(total - 4, bitLenLo, false);

  const h = iv.map((v) => v >>> 0);

  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < total; i += 64) {
    const w = new Array<number>(64).fill(0);
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    let a = h[0], b = h[1], c = h[2], d = h[3];
    let e = h[4], f = h[5], g = h[6], hh = h[7];

    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA256_K[j] + w[j]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;

      hh = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setUint32(i * 4, h[i], false);
  return out;
}

export function sha224Hex(data: string): string {
  const iv = [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4,
  ];
  return bytesToHex(sha256Core(encode.encode(data), iv).slice(0, 28));
}

export function sha256Hex(data: string): string {
  const iv = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  return bytesToHex(sha256Core(encode.encode(data), iv));
}

const RIPEMD160_RL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
];
const RIPEMD160_RR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
];
const RIPEMD160_SL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
];
const RIPEMD160_SR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
];
const RIPEMD160_KL = [
  0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e,
];
const RIPEMD160_KR = [
  0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000,
];

export function ripemd160Hex(data: string | Uint8Array): string {
  const message = typeof data === "string" ? encode.encode(data) : data;
  const msgLen = message.length;
  const bitLenLo = msgLen * 8;
  const bitLenHi = Math.floor(msgLen / 0x20000000) >>> 0;
  const rem = (msgLen + 1) % 64;
  const padLen = rem <= 56 ? 56 - rem : 120 - rem;
  const total = msgLen + 1 + padLen + 8;
  const padded = new Uint8Array(total);
  padded.set(message);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(total - 8, bitLenLo, true);
  view.setUint32(total - 4, bitLenHi, true);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;

  for (let i = 0; i < total; i += 64) {
    const M: number[] = [];
    const dv = new DataView(padded.buffer, i, 64);
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(j * 4, true);

    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;

    for (let j = 0; j < 80; j++) {
      const round = Math.floor(j / 16);

      const fL = (b: number, c: number, d: number, r: number): number => {
        if (r === 0) return b ^ c ^ d;
        if (r === 1) return (b & c) | (~b & d);
        if (r === 2) return (b | ~c) ^ d;
        if (r === 3) return (b & d) | (c & ~d);
        return b ^ (c | ~d);
      };
      const fR = (b: number, c: number, d: number, r: number): number => {
        if (r === 0) return b ^ (c | ~d);
        if (r === 1) return (b & d) | (c & ~d);
        if (r === 2) return (b | ~c) ^ d;
        if (r === 3) return (b & c) | (~b & d);
        return b ^ c ^ d;
      };

      const tL = (rotl((al + fL(bl, cl, dl, round) + M[RIPEMD160_RL[j]] + RIPEMD160_KL[round]) >>> 0, RIPEMD160_SL[j]) + el) >>> 0;
      al = el; el = dl; dl = rotl(cl, 10) >>> 0; cl = bl; bl = tL;

      const tR = (rotl((ar + fR(br, cr, dr, round) + M[RIPEMD160_RR[j]] + RIPEMD160_KR[round]) >>> 0, RIPEMD160_SR[j]) + er) >>> 0;
      ar = er; er = dr; dr = rotl(cr, 10) >>> 0; cr = br; br = tR;
    }

    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }

  const out = new Uint8Array(20);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0, true);
  odv.setUint32(4, h1, true);
  odv.setUint32(8, h2, true);
  odv.setUint32(12, h3, true);
  odv.setUint32(16, h4, true);
  return bytesToHex(out);
}

const KECCAK_RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
const KECCAK_ROT = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];
const KECCAK_MASK = (1n << 64n) - 1n;

function keccakF1600(state: bigint[]): void {
  const rot = (x: bigint, n: number) => {
    if (n === 0) return x;
    return ((x << BigInt(n)) | (x >> BigInt(64 - n))) & KECCAK_MASK;
  };
  for (let round = 0; round < 24; round++) {
    const C = new Array<bigint>(5).fill(0n);
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    const D = new Array<bigint>(5).fill(0n);
    for (let x = 0; x < 5; x++) {
      D[x] = C[(x + 4) % 5] ^ rot(C[(x + 1) % 5], 1);
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + 5 * y] = state[x + 5 * y] ^ D[x];
      }
    }

    const B = new Array<bigint>(25).fill(0n);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        B[y + 5 * ((2 * x + 3 * y) % 5)] = rot(state[x + 5 * y], KECCAK_ROT[x][y]);
      }
    }

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        state[x + 5 * y] = B[x + 5 * y] ^ ((~B[(x + 1) % 5 + 5 * y]) & B[(x + 2) % 5 + 5 * y]);
      }
    }

    state[0] = state[0] ^ KECCAK_RC[round];
  }
}

function keccak(data: Uint8Array, rateBytes: number, outputBytes: number, domain: number): Uint8Array {
  const laneCount = 25;
  const state = new Array<bigint>(laneCount).fill(0n);
  const lanes = rateBytes / 8;
  const paddedLen = Math.ceil((data.length + 1) / rateBytes) * rateBytes;
  const padded = new Uint8Array(paddedLen + rateBytes);
  padded.set(data);
  padded[data.length] = domain;
  padded[paddedLen - 1] |= 0x80;

  for (let offset = 0; offset < paddedLen; offset += rateBytes) {
    const dv = new DataView(padded.buffer, offset, rateBytes);
    for (let l = 0; l < lanes; l++) {
      state[l] = state[l] ^ dv.getBigUint64(l * 8, true);
    }
    keccakF1600(state);
  }

  const out = new Uint8Array(outputBytes);
  const odv = new DataView(out.buffer);
  let written = 0;
  while (written < outputBytes) {
    for (let l = 0; l < lanes && written < outputBytes; l++) {
      const word = state[l];
      for (let byteIdx = 0; byteIdx < 8 && written < outputBytes; byteIdx++) {
        odv.setUint8(written, Number((word >> BigInt(byteIdx * 8)) & 0xffn));
        written++;
      }
    }
    if (written < outputBytes) keccakF1600(state);
  }
  return out;
}

export function sha3Hex(data: string, bits: 224 | 256 | 384 | 512 = 512): string {
  const rateBytes = (1600 - bits * 2) / 8;
  return bytesToHex(keccak(encode.encode(data), rateBytes, bits / 8, 0x06));
}

function hmacCore(
  dataBytes: Uint8Array,
  keyBytes: Uint8Array,
  blockSize: number,
  hashFn: (b: Uint8Array) => Uint8Array
): Uint8Array {
  let key = keyBytes;
  if (key.length > blockSize) key = hashFn(key);
  const ipadKey = new Uint8Array(blockSize);
  const opadKey = new Uint8Array(blockSize);
  ipadKey.set(key);
  opadKey.set(key);
  for (let i = 0; i < blockSize; i++) {
    ipadKey[i] ^= 0x36;
    opadKey[i] ^= 0x5c;
  }
  return hashFn(concatBytes(opadKey, hashFn(concatBytes(ipadKey, dataBytes))));
}

export type HmacHashId = "MD5" | "SHA-1" | "SHA-224" | "SHA-256" | "SHA-384" | "SHA-512" | "RIPEMD-160" | "SHA3-512";

function hmac(id: HmacHashId, data: string, secret: string): string {
  const dataBytes = encode.encode(data);
  const keyBytes = encode.encode(secret);

  const hashFn = (b: Uint8Array): Uint8Array => {
    switch (id) {
      case "MD5": return md5Bytes(b);
      case "SHA-224": return sha256Core(b, [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4]).slice(0, 28);
      case "RIPEMD-160": return hexToBytes(ripemd160Hex(b));
      case "SHA3-512": return keccak(b, 72, 64, 0x06);
      default: throw new Error(`Unsupported HMAC id: ${id}`);
    }
  };

  const blockSize = id === "SHA3-512" ? 72 : 64;
  return bytesToHex(hmacCore(dataBytes, keyBytes, blockSize, hashFn));
}

async function hmacCoreWebCrypto(id: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", dataBytes: Uint8Array, keyBytes: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: id },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, dataBytes.buffer as ArrayBuffer);
  return bytesToHex(new Uint8Array(sig));
}

export async function hmacHex(id: HmacHashId, data: string, secret: string): Promise<string> {
  if (id === "SHA-1" || id === "SHA-256" || id === "SHA-384" || id === "SHA-512") {
    return hmacCoreWebCrypto(id, encode.encode(data), encode.encode(secret));
  }
  return hmac(id, data, secret);
}

export function formatHashHex(hex: string, fmt: "hex" | "base64" | "binary"): string {
  if (fmt === "hex") return hex;
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  if (fmt === "base64") return btoa(String.fromCharCode(...bytes));
  return bytes.map((b) => b.toString(2).padStart(8, "0")).join("");
}
