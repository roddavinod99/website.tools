export interface CryptoResult {
  data: string;
  iv: string;
  salt: string;
}

export function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

export interface DecryptParams {
  data: string;
  iv: string;
  salt: string;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAESGCM(plaintext: string, password: string): Promise<CryptoResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

export async function decryptAESGCM(params: DecryptParams, password: string): Promise<string> {
  const encryptedData = Uint8Array.from(atob(params.data), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(params.iv), (c) => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(params.salt), (c) => c.charCodeAt(0));

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Decryption failed. Invalid key or corrupted data.");
  }
}

export function formatEncryptedResult(result: CryptoResult): string {
  return JSON.stringify(result);
}

export function parseEncryptedResult(input: string): DecryptParams | null {
  try {
    const parsed = JSON.parse(input);
    if (parsed.data && parsed.iv && parsed.salt) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function legacyFormatToWebCrypto(legacyBase64: string): DecryptParams | null {
  try {
    const decoded = atob(legacyBase64);
    if (!decoded.startsWith("Salted__")) {
      return null;
    }
    const salt = Uint8Array.from(decoded.slice(8, 16), (c) => c.charCodeAt(0));
    const data = Uint8Array.from(decoded.slice(16), (c) => c.charCodeAt(0));
    return {
      data: btoa(String.fromCharCode(...data)),
      iv: "",
      salt: btoa(String.fromCharCode(...salt)),
    };
  } catch {
    return null;
  }
}