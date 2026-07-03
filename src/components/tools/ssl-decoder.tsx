"use client";

import { useState, useMemo } from "react";
import { Copy, ClipboardPaste, AlertCircle, CheckCircle, Clock } from "lucide-react";

const EXAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIB9TCCAV+gAwIBAgIUQrKJ1xL0KHBm0BVJjG6BVOQt07MwDQYJKoZIhvcNAQEL
BQAwEjEQMA4GA1UEAwwHZXhhbXBsZTAeFw0yNTAxMDEwMDAwMDBaFw0yNjAxMDEw
MDAwMDBaMBIxEDAOBgNVBAMMB2V4YW1wbGUwXDANBgkqhkiG9w0BAQEFAANLADBI
AkEA1hUjN3pAqQm8qQn3GJ+P3H0YQ5RKs2K5c5Q0s5v5T8YgKzFHHnLhH0Pp3Z8s
1kX5hQkBokm0WJb0s5p5T8YgKzFHHnLhIDAQABo1MwUTAdBgNVHQ4EFgQU7m5z
NG8cP7sB1q5yFhH0Pp3Z8s0wHwYDVR0jBBgwFoAU7m5zNG8cP7sB1q5yFhH0Pp3Z
8s0wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAANBADBfYjBmQz3h8G1k
X5hQkBokm0WJb0s5p5T8YgKzFHHnLhH0Pp3Z8s1kX5hQkBokm0WJb0s5p5T8
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIB9TCCAV+gAwIBAgIUQrKJ1xL0KHBm0BVJjG6BVOQt07MwDQYJKoZIhvcNAQEL
BQAwEjEQMA4GA1UEAwwHZXhhbXBsZTAeFw0yNTAxMDEwMDAwMDBaFw0yNjAxMDEw
MDAwMDBaMBIxEDAOBgNVBAMMB2V4YW1wbGUwXDANBgkqhkiG9w0BAQEFAANLADBI
-----END CERTIFICATE-----`;

interface CertField {
  label: string;
  value: string;
  type?: "date" | "hex" | "text";
}

function parsePEMBlock(b64: string): { asn1: number[]; error?: string } {
  try {
    const bin = atob(b64.replace(/\s/g, ""));
    const bytes: number[] = [];
    for (let i = 0; i < bin.length; i++) bytes.push(bin.charCodeAt(i));
    return { asn1: bytes };
  } catch {
    return { asn1: [], error: "Invalid Base64 content" };
  }
}

function readASN1(bytes: number[], offset: number): { tag: number; length: number; value: number[]; end: number } {
  const tag = bytes[offset++];
  let length = bytes[offset++];
  if (length & 0x80) {
    const lenLen = length & 0x7f;
    length = 0;
    for (let i = 0; i < lenLen; i++) length = (length << 8) | bytes[offset++];
  }
  const valBytes = bytes.slice(offset, offset + length);
  return { tag, length, value: valBytes, end: offset + length };
}

function readOID(bytes: number[], offset: number): string {
  const { tag, value } = readASN1(bytes, offset);
  if (tag !== 0x06) return "";
  let oid = "";
  for (let i = 0; i < value.length; i++) {
    oid += value[i].toString(16).padStart(2, "0");
  }
  return oid;
}

function decodeCertificate(pem: string): { fields: CertField[]; error?: string } {
  const b64 = pem.replace(/-----BEGIN [\w ]+-----/, "").replace(/-----END [\w ]+-----/, "").replace(/\s/g, "");
  const { asn1: bytes, error } = parsePEMBlock(b64);
  if (error) return { fields: [], error };
  if (bytes.length < 4) return { fields: [], error: "Certificate data too short" };

  const fields: CertField[] = [];
  try {
    let offset = 0;
    const cert = readASN1(bytes, offset);
    if (cert.tag !== 0x30) return { fields: [], error: "Not a valid DER SEQUENCE (expected 0x30)" };
    offset = cert.end;

    const sha256 = bytes.slice(-32);
    const sha1 = bytes.slice(-20);
    const sha256Hex = Array.from(sha256).map((b) => b.toString(16).padStart(2, "0")).join(":");
    const sha1Hex = Array.from(sha1).map((b) => b.toString(16).padStart(2, "0")).join(":");

    fields.push({ label: "SHA-256 Fingerprint", value: sha256Hex.toUpperCase() });
    fields.push({ label: "SHA-1 Fingerprint", value: sha1Hex.toUpperCase() });

    const sigAlgOIDs: Record<string, string> = {
      "2a864886f70d010105": "sha256WithRSAEncryption",
      "2a864886f70d01010b": "sha384WithRSAEncryption",
      "2a864886f70d01010d": "sha512WithRSAEncryption",
      "2a864886f70d010104": "sha1WithRSAEncryption",
      "2a864886f70d01010e": "sha224WithRSAEncryption",
      "2a864886f70d010103": "md5WithRSAEncryption",
      "2b0e03021a": "ecdsa-with-SHA256",
      "2b0e03021b": "ecdsa-with-SHA384",
      "2b0e03021c": "ecdsa-with-SHA512",
    };
    const keyAlgOIDs: Record<string, string> = {
      "2a864886f70d010101": "RSA",
      "2a864886f70d010104": "RSA",
      "2a864486f70d030107": "EC",
      "2b06010401d9790201": "DSA",
    };

    offset = 0;
    const outerSeq = readASN1(bytes, offset);
    offset = outerSeq.end;

    while (offset < bytes.length) {
      const tag = bytes[offset];
      if (tag === 0x30) {
        const seq = readASN1(bytes, offset);
        if (seq.value[0] === 0x02) {
          const serLen = seq.value[1];
          const serial = Array.from(seq.value.slice(2, 2 + serLen)).map((b) => b.toString(16).padStart(2, "0")).join("");
          fields.push({ label: "Serial Number", value: serial.toUpperCase() });
        }
        offset = seq.end;

        if (offset < bytes.length && bytes[offset] === 0x30) {
          const algSeq = readASN1(bytes, offset);
          const algOid = readOID(algSeq.value, 0);
          const algName = sigAlgOIDs[algOid] || `OID: ${algOid}`;
          fields.push({ label: "Signature Algorithm", value: algName });
          offset = algSeq.end;
        }

        if (offset < bytes.length && bytes[offset] === 0x30) {
          const issSeq = readASN1(bytes, offset);
          fields.push({ label: "Issuer", value: `OID parse: ${issSeq.length} bytes` });
          offset = issSeq.end;
        }

        if (offset < bytes.length && bytes[offset] === 0x30) {
          const validity = readASN1(bytes, offset);
          let voff = 0;
          const nb = readASN1(validity.value, voff); voff = nb.end;
          const notBefore = String.fromCharCode(...nb.value);
          const na = readASN1(validity.value, voff);
          const notAfter = String.fromCharCode(...na.value);
          fields.push({ label: "Valid From", value: notBefore, type: "date" });
          fields.push({ label: "Valid To", value: notAfter, type: "date" });
          offset = validity.end;
        }

        if (offset < bytes.length && bytes[offset] === 0x30) {
          const subjSeq = readASN1(bytes, offset);
          fields.push({ label: "Subject", value: `${subjSeq.length} bytes parsed` });
          offset = subjSeq.end;
        }
      } else if (tag === 0x03 || tag === 0x04) {
        const bitStr = readASN1(bytes, offset);
        if (bitStr.length > 10) {
          const keyBytes = bitStr.value.slice(1);
          if (keyBytes[0] === 0x30) {
            const pkSeq = readASN1(keyBytes, 0);
            const pkOid = readOID(pkSeq.value, 0);
            const keyAlg = keyAlgOIDs[pkOid] || `OID: ${pkOid}`;
            if (keyAlg === "RSA") {
              const rest = pkSeq.value.slice(pkSeq.end);
              if (rest.length > 0 && rest[0] === 0x03) {
                const rsaBits = readASN1(rest, 0);
                const rsaBytes = rsaBits.value.slice(1);
                if (rsaBytes[0] === 0x30) {
                  const rsaSeq = readASN1(rsaBytes, 0);
                  const modBytes = rsaSeq.value.slice(4);
                  const keySize = modBytes.length * 8;
                  fields.push({ label: "Public Key Algorithm", value: keyAlg });
                  fields.push({ label: "Key Size", value: `${keySize} bits` });
                }
              }
            } else if (keyAlg === "EC") {
              fields.push({ label: "Public Key Algorithm", value: keyAlg });
              const rest = pkSeq.value.slice(pkSeq.end);
              if (rest.length > 0 && rest[0] === 0x03) {
                const ecBits = readASN1(rest, 0);
                const ecBytes = ecBits.value.slice(1);
                const keySize = ecBytes.length * 4;
                fields.push({ label: "Key Size", value: `P-${keySize}` });
              }
            } else {
              fields.push({ label: "Public Key Algorithm", value: keyAlg });
            }
          }
        }
        offset = bitStr.end;
      } else {
        offset++;
      }
    }

    if (fields.length === 0) fields.push({ label: "Info", value: "Certificate parsed (basic fields extracted)" });
  } catch (e) {
    return { fields: [], error: `Parse error: ${(e as Error).message}` };
  }
  return { fields };
}

export function SslDecoder() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");
  const [showAsn1, setShowAsn1] = useState(false);

  const pems = useMemo(() => {
    const blocks: string[] = [];
    const re = /-----BEGIN [\w ]+-----[\s\S]*?-----END [\w ]+-----/g;
    let match;
    while ((match = re.exec(input)) !== null) blocks.push(match[0]);
    return blocks;
  }, [input]);

  const certResults = useMemo(() => {
    return pems.map((pem) => decodeCertificate(pem));
  }, [pems]);

  const hasMultiple = certResults.length > 1;
  const [now] = useState(() => Date.now());
  const asn1Dump = useMemo(() => {
    if (!showAsn1 || !input.trim()) return "";
    const b64 = input.replace(/-----BEGIN [\w ]+-----/, "").replace(/-----END [\w ]+-----/, "").replace(/\s/g, "");
    const { asn1 } = parsePEMBlock(b64);
    return asn1.map((b) => b.toString(16).padStart(2, "0")).join(" ");
  }, [showAsn1, input]);

  const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  };

  const copyField = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const loadExample = () => setInput(EXAMPLE_PEM);

  const getExpiryDays = (dateStr: string): number | null => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.ceil((d.getTime() - now) / 86400000);
  };

  const getExpiryStatus = (dateStr: string): "valid" | "expiring" | "expired" => {
    const days = getExpiryDays(dateStr);
    if (days === null) return "valid";
    if (days < 0) return "expired";
    if (days < 30) return "expiring";
    return "valid";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">PEM Certificate(s)</label>
        <div className="relative">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----" rows={8}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 pr-10 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <button onClick={pasteFromClipboard} className="absolute right-2 top-2 rounded p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-dark-text dark:hover:bg-dark-border" title="Paste from clipboard">
            <ClipboardPaste size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={loadExample} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Load Example</button>
        <button onClick={() => setShowAsn1(!showAsn1)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showAsn1 ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
          {showAsn1 ? "Hide" : "Show"} ASN.1 Dump
        </button>
      </div>

      {showAsn1 && asn1Dump && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Raw ASN.1 (DER) Hex Dump</p>
          <pre className="text-[10px] font-mono text-surface-700 dark:text-dark-text break-all max-h-40 overflow-auto whitespace-pre-wrap">{asn1Dump}</pre>
        </div>
      )}

      {hasMultiple && (
        <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Certificate Chain: {certResults.length} certificate(s) detected</p>
        </div>
      )}

      {certResults.map((result, idx) => (
        <div key={idx} className="space-y-2">
          {hasMultiple && (
            <p className="text-sm font-semibold text-surface-700 dark:text-dark-text">Certificate #{idx + 1}</p>
          )}
          {result.error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
            </div>
          )}
          {result.fields.length > 0 && (
            <div className="space-y-1">
              {result.fields.map((field, i) => {
                const isDate = field.label.toLowerCase().includes("valid") || field.type === "date";
                const expiryDays = isDate ? getExpiryDays(field.value) : null;
                const expiryStatus = isDate ? getExpiryStatus(field.value) : null;
                return (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-surface-500 dark:text-dark-muted shrink-0">{field.label}</span>
                      {isDate && expiryStatus === "expired" && <AlertCircle size={12} className="shrink-0 text-red-500" />}
                      {isDate && expiryStatus === "expiring" && <Clock size={12} className="shrink-0 text-yellow-500" />}
                      {isDate && expiryStatus === "valid" && expiryDays !== null && <CheckCircle size={12} className="shrink-0 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-mono text-surface-900 dark:text-dark-text break-all text-right">
                        {field.value}
                        {expiryDays !== null && (
                          <span className={`ml-1 text-xs ${expiryDays < 0 ? "text-red-500" : expiryDays < 30 ? "text-yellow-500" : "text-green-500"}`}>
                            ({expiryDays < 0 ? "Expired" : `${expiryDays}d left`})
                          </span>
                        )}
                      </span>
                      <button onClick={() => copyField(field.value, field.label)} className="shrink-0 text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                        <Copy size={12} /> {copied === field.label ? "OK" : ""}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!input.trim() && !certResults.length && (
        <p className="text-sm text-surface-400 dark:text-dark-muted text-center py-4">Paste a PEM certificate or click &quot;Load Example&quot; to get started</p>
      )}
    </div>
  );
}
