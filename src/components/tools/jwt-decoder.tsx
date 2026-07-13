"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Copy, ClipboardPaste, AlertCircle, CheckCircle, Clock, Shield, ShieldAlert, ShieldCheck, Download } from "lucide-react";

function base64UrlDecode(str: string): string {
  try {
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    s = s.padEnd(s.length + (4 - (s.length % 4)) % 4, "=");
    return decodeURIComponent(escape(atob(s)));
  } catch { return ""; }
}

function decodeToken(token: string): { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string; rawHeader: string; rawPayload: string } | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const rawHeader = base64UrlDecode(parts[0]);
    const rawPayload = base64UrlDecode(parts[1]);
    if (!rawHeader || !rawPayload) return null;
    return { header: JSON.parse(rawHeader), payload: JSON.parse(rawPayload), signature: parts[2], rawHeader, rawPayload };
  } catch { return null; }
}

function formatDate(ts: number): string {
  try { return new Date(ts * 1000).toLocaleString(); } catch { return "Invalid"; }
}

function getExpiryStatus(payload: Record<string, unknown>): { status: "valid" | "expired" | "no-exp"; expiresAt: number | null; label: string } {
  const exp = payload.exp;
  if (typeof exp !== "number") return { status: "no-exp", expiresAt: null, label: "No expiration" };
  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return { status: "expired", expiresAt: exp, label: `Expired ${formatDate(exp)}` };
  const diff = exp - now;
  if (diff < 3600) return { status: "valid", expiresAt: exp, label: `Expires in ${Math.floor(diff / 60)}m ${diff % 60}s` };
  if (diff < 86400) return { status: "valid", expiresAt: exp, label: `Expires in ${Math.floor(diff / 3600)}h` };
  return { status: "valid", expiresAt: exp, label: `Expires in ${Math.floor(diff / 86400)}d` };
}

function getAlgoSecurity(alg: string): { level: "strong" | "weak" | "none"; color: string } {
  const u = alg.toUpperCase();
  if (u === "NONE" || u === "NONCE") return { level: "none", color: "text-red-600 dark:text-red-400" };
  if (/^(HS|RS|ES|PS)/.test(u)) {
    const bits = parseInt(u.replace(/[A-Z]/g, ""), 10);
    if (isNaN(bits) || bits >= 384) return { level: "strong", color: "text-green-600 dark:text-green-400" };
    if (bits >= 256) return { level: "strong", color: "text-green-600 dark:text-green-400" };
    return { level: "weak", color: "text-yellow-600 dark:text-yellow-400" };
  }
  if (/^ED/i.test(u) || /^ES256K/i.test(u)) return { level: "strong", color: "text-green-600 dark:text-green-400" };
  return { level: "weak", color: "text-yellow-600 dark:text-yellow-400" };
}

const standardClaims = new Set(["iss", "sub", "aud", "exp", "nbf", "iat", "jti", "azp", "scope", "client_id", "acr", "amr"]);

const claimDescriptions: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
  azp: "Authorized Party",
  scope: "Scope",
  client_id: "Client ID",
  acr: "Auth Context Reference",
  amr: "Auth Methods Reference",
};

export function JWTDecoder() {
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [sigResult, setSigResult] = useState<"match" | "mismatch" | "unverified" | null>(null);
  const [countdown, setCountdown] = useState("");
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [copiedSection, setCopiedSection] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tokens = useMemo(() => {
    return input.trim().split(/\s+/).filter((t) => t.includes("."));
  }, [input]);

  const currentToken = useMemo(() => tokens[selectedTokenIdx] || "", [tokens, selectedTokenIdx]);

  const decodedResult = useMemo(() => {
    if (!currentToken) return null;
    return decodeToken(currentToken);
  }, [currentToken]);

  const decoded = decodedResult;
  const error = decoded ? "" : currentToken ? "Invalid JWT format. Expected 3 dot-separated Base64URL parts." : "";

  useEffect(() => {
    if (!decoded?.payload?.exp) return;
    timerRef.current = setInterval(() => {
      const exp = decoded.payload.exp as number;
      const now = Math.floor(Date.now() / 1000);
      const diff = exp - now;
      if (diff <= 0) setCountdown("Expired");
      else if (diff < 3600) setCountdown(`${Math.floor(diff / 60)}m ${diff % 60}s`);
      else if (diff < 86400) setCountdown(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
      else setCountdown(`${Math.floor(diff / 86400)}d`);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [decoded?.payload?.exp]);

  const verifySig = useCallback(async () => {
    if (!decoded || !secret) return;
    const parts = currentToken.split(".");
    const data = `${parts[0]}.${parts[1]}`;
    const algo = (decoded.header.alg as string) || "HS256";
    try {
      const encoder = new TextEncoder();
      const hashMap: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
      const hash = hashMap[algo.toUpperCase()];
      if (!hash) { setSigResult("unverified"); return; }
      const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
      const expected = btoa(Array.from(new Uint8Array(sig)).map((b) => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      setSigResult(expected === parts[2] ? "match" : "mismatch");
    } catch { setSigResult("unverified"); }
  }, [decoded, secret, currentToken]);

  const copySection = async (section: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  };

  const downloadAsJson = () => {
    if (!decoded) return;
    const data = {
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jwt-decoded.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderColoredToken = useCallback(() => {
    if (!currentToken) return null;
    const parts = currentToken.split(".");
    if (parts.length !== 3) return <span className="font-mono text-xs break-all text-surface-900 dark:text-dark-text">{currentToken}</span>;
    return (
      <span className="font-mono text-xs break-all leading-relaxed">
        <span className="text-red-600 dark:text-red-400">{parts[0]}</span>
        <span className="text-surface-400 dark:text-dark-muted">.</span>
        <span className="text-blue-600 dark:text-blue-400">{parts[1]}</span>
        <span className="text-surface-400 dark:text-dark-muted">.</span>
        <span className="text-green-600 dark:text-green-400">{parts[2]}</span>
      </span>
    );
  }, [currentToken]);

  const expiryInfo = useMemo(() => decoded ? getExpiryStatus(decoded.payload) : null, [decoded]);
  const algoSecurity = useMemo(() => decoded?.header?.alg ? getAlgoSecurity(decoded.header.alg as string) : null, [decoded]);

  const tokenSize = useMemo(() => {
    if (!currentToken) return 0;
    return new TextEncoder().encode(currentToken).length;
  }, [currentToken]);

  const renderClaims = (payload: Record<string, unknown>) => {
    return Object.entries(payload).map(([key, value]) => {
      const isStandard = standardClaims.has(key);
      const desc = isStandard && claimDescriptions[key] ? claimDescriptions[key] : "";
      let displayVal: string;
      if (["exp", "nbf", "iat"].includes(key) && typeof value === "number") {
        displayVal = `${value} (${formatDate(value)})`;
      } else if (typeof value === "object") {
        displayVal = JSON.stringify(value);
      } else {
        displayVal = String(value);
      }
      return (
        <div key={key} className="flex items-start justify-between gap-2 rounded border border-surface-200 bg-white px-3 py-1.5 dark:border-dark-border dark:bg-dark-surface">
          <div className="min-w-0 shrink-0">
            <span className="text-xs font-medium text-surface-600 dark:text-dark-muted">
              {key}
              {isStandard && <span className="ml-1 text-[10px] text-brand-500">std</span>}
              {!isStandard && <span className="ml-1 text-[10px] text-yellow-500">custom</span>}
            </span>
            {desc && <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-0.5">{desc}</p>}
          </div>
          <span className="text-xs font-mono text-surface-900 dark:text-dark-text break-all text-right max-w-[60%]">{displayVal}</span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JWT Token(s)</label>
        <div className="relative">
          <textarea
            value={input} onChange={(e) => { setInput(e.target.value); setSelectedTokenIdx(0); setSigResult(null); }}
            placeholder="Paste one or more JWTs here..."
            rows={4}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 pr-10 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={pasteFromClipboard} className="absolute right-2 top-2 rounded p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-dark-text dark:hover:bg-dark-border" title="Paste from clipboard">
            <ClipboardPaste size={16} />
          </button>
        </div>
        {tokens.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tokens.map((_, i) => (
              <button key={i} onClick={() => { setSelectedTokenIdx(i); setSigResult(null); }}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${i === selectedTokenIdx ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border"}`}>
                Token {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {decoded && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Raw Token ({tokenSize} bytes)</span>
              <button onClick={() => copySection("raw", currentToken)} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <Copy size={12} /> {copiedSection === "raw" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-white dark:bg-dark-bg rounded p-2 border border-surface-200 dark:border-dark-border overflow-auto max-h-20">
              {renderColoredToken()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-dark-surface">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Header</span>
                <button onClick={() => copySection("header", JSON.stringify(decoded.header, null, 2))} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <Copy size={12} /> {copiedSection === "header" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="space-y-0.5 text-xs font-mono text-surface-700 dark:text-dark-muted">
                {Object.entries(decoded.header).map(([k, v]) => (
                  <div key={k}><span className="font-medium">{k}:</span> {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-white p-3 sm:col-span-2 dark:border-blue-800 dark:bg-dark-surface">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Payload / Claims</span>
                <button onClick={() => copySection("payload", JSON.stringify(decoded.payload, null, 2))} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  <Copy size={12} /> {copiedSection === "payload" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {renderClaims(decoded.payload)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-green-200 bg-white px-3 py-2 dark:border-green-800 dark:bg-dark-surface flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Signature</span>
                <button onClick={() => copySection("signature", decoded.signature)} className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1">
                  <Copy size={12} /> {copiedSection === "signature" ? "Copied!" : "Copy"}
                </button>
              </div>
              <code className="mt-1 block text-xs font-mono text-surface-900 dark:text-dark-text break-all select-all">{decoded.signature.slice(0, 48)}...</code>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {algoSecurity && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${algoSecurity.level === "strong" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : algoSecurity.level === "weak" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                  {algoSecurity.level === "strong" ? <ShieldCheck size={12} /> : algoSecurity.level === "weak" ? <Shield size={12} /> : <ShieldAlert size={12} />}
                  {(decoded.header.alg as string) || "N/A"}
                </span>
              )}
              {expiryInfo && expiryInfo.status !== "no-exp" && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${expiryInfo.status === "valid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                  <Clock size={12} />
                  {expiryInfo.status === "valid" ? (countdown || "Valid") : "Expired"}
                </span>
              )}
              <button onClick={downloadAsJson} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors flex items-center gap-1">
                <Download size={12} /> JSON
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
            <p className="text-xs font-medium text-surface-600 dark:text-dark-muted mb-2">Signature Verification</p>
            <div className="flex gap-2">
              <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter HMAC secret to verify..."
                className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
              <button onClick={verifySig} disabled={!secret} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">Verify</button>
            </div>
            {sigResult && (
              <p className={`mt-1 text-xs flex items-center gap-1 ${sigResult === "match" ? "text-green-600 dark:text-green-400" : sigResult === "mismatch" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                {sigResult === "match" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                {sigResult === "match" ? "Signature matches" : sigResult === "mismatch" ? "Signature does not match" : "Unsupported algorithm (RS/ES/PS use public key crypto)"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded border border-surface-200 bg-white px-3 py-2 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Algorithm</p>
              <p className="text-sm font-bold text-surface-900 dark:text-dark-text">{decoded.header.alg as string}</p>
            </div>
            <div className="rounded border border-surface-200 bg-white px-3 py-2 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Token Size</p>
              <p className="text-sm font-bold text-surface-900 dark:text-dark-text">{tokenSize} B</p>
            </div>
            <div className="rounded border border-surface-200 bg-white px-3 py-2 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Payload Size</p>
              <p className="text-sm font-bold text-surface-900 dark:text-dark-text">{new TextEncoder().encode(JSON.stringify(decoded.payload)).length} B</p>
            </div>
            <div className="rounded border border-surface-200 bg-white px-3 py-2 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Claims</p>
              <p className="text-sm font-bold text-surface-900 dark:text-dark-text">{Object.keys(decoded.payload).length}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
