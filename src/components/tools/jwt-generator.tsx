"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Copy, Eye, EyeOff, Save, Plus, Trash2 } from "lucide-react";

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(alg: string, secret: string, data: string): Promise<string> {
  const hashMap: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
  const hash = hashMap[alg];
  if (!hash) return "";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(Array.from(new Uint8Array(sig)).map((b) => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface SavedToken {
  label: string;
  token: string;
  ts: number;
}

const algOptions = [
  { id: "none", label: "None (unsigned)" },
  { id: "HS256", label: "HS256" },
  { id: "HS384", label: "HS384" },
  { id: "HS512", label: "HS512" },
];

const expPresets = [
  { label: "15 min", value: 900 },
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86400 },
  { label: "7 days", value: 604800 },
  { label: "Custom", value: -1 },
];

export function JwtGenerator() {
  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState("my-secret");
  const [showSecret, setShowSecret] = useState(false);
  const [customHeaderFields, setCustomHeaderFields] = useState<{ key: string; value: string }[]>([]);
  const [claims, setClaims] = useState<Record<string, string>>({
    iss: "https://myapp.com", sub: "user_123456", aud: "api.myapp.com",
    exp: "", nbf: "", iat: "", jti: "",
  });
  const [customClaims, setCustomClaims] = useState<{ key: string; value: string }[]>([]);
  const [expPreset, setExpPreset] = useState(3600);
  const [customExp, setCustomExp] = useState("");
  const [kid, setKid] = useState("");
  const [token, setToken] = useState("");
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSave, setShowSave] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildHeader = useCallback(() => {
    const h: Record<string, string> = { alg: algorithm, typ: "JWT" };
    if (kid) h.kid = kid;
    for (const f of customHeaderFields) {
      if (f.key.trim()) h[f.key.trim()] = f.value;
    }
    return h;
  }, [algorithm, kid, customHeaderFields]);

  const buildPayload = useCallback(() => {
    const p: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(claims)) {
      if (v.trim()) {
        const num = Number(v);
        p[k] = !isNaN(num) && v.trim() !== "" ? num : v;
      }
    }
    const expVal = expPreset === -1 ? parseInt(customExp, 10) : expPreset;
    if (expVal && expVal > 0) p.exp = Math.floor(Date.now() / 1000) + expVal;
    for (const c of customClaims) {
      if (c.key.trim()) {
        const num = Number(c.value);
        p[c.key.trim()] = c.value && !isNaN(num) ? num : c.value;
      }
    }
    return p;
  }, [claims, customClaims, expPreset, customExp]);

  const generate = useCallback(async () => {
    try {
      const header = buildHeader();
      const payload = buildPayload();
      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));
      const data = `${headerB64}.${payloadB64}`;
      if (algorithm === "none") {
        setToken(`${data}.`);
      } else {
        const sig = await hmacSign(algorithm, secret, data);
        setToken(`${data}.${sig}`);
      }
    } catch { setToken(""); }
  }, [algorithm, secret, buildHeader, buildPayload]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  const copyToken = async () => {
    if (token) { await navigator.clipboard.writeText(token); }
  };

  const saveToken = () => {
    if (!token || !saveLabel.trim()) return;
    setSavedTokens((prev) => [{ label: saveLabel.trim(), token, ts: Date.now() }, ...prev].slice(0, 20));
    setSaveLabel("");
    setShowSave(false);
  };

  const deleteSaved = (idx: number) => {
    setSavedTokens((prev) => prev.filter((_, i) => i !== idx));
  };

  const payloadSize = useMemo(() => {
    if (!token) return 0;
    return new TextEncoder().encode(token).length;
  }, [token]);

  const claimCount = useMemo(() => {
    return Object.entries(claims).filter(([, v]) => v.trim()).length + customClaims.filter((c) => c.key.trim()).length;
  }, [claims, customClaims]);

  const renderTokenPreview = () => {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return <span className="font-mono text-sm break-all text-surface-900 dark:text-dark-text">{token}</span>;
    return (
      <span className="font-mono text-sm break-all leading-relaxed">
        <span className="text-red-600 dark:text-red-400">{parts[0]}</span>
        <span className="text-surface-400">.</span>
        <span className="text-blue-600 dark:text-blue-400">{parts[1]}</span>
        <span className="text-surface-400">.</span>
        <span className="text-green-600 dark:text-green-400">{parts[2] || ""}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Algorithm</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {algOptions.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Key ID (kid)</label>
          <input type="text" value={kid} onChange={(e) => setKid(e.target.value)} placeholder="optional"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Secret Key</label>
          <div className="relative">
            <input type={showSecret ? "text" : "password"} value={secret} onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-dark-text">
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text">Standard Claims</p>
          <span className="text-xs text-surface-500 dark:text-dark-muted">Claims: {claimCount} | Size: {payloadSize} B</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(claims).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs text-surface-500 dark:text-dark-muted mb-0.5">{key}</label>
              <input type="text" value={val} onChange={(e) => setClaims((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Expiration</label>
        <div className="flex flex-wrap gap-2">
          {expPresets.map((p) => (
            <button key={p.value} onClick={() => setExpPreset(p.value)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${expPreset === p.value ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"}`}>
              {p.label}
            </button>
          ))}
          {expPreset === -1 && (
            <input type="number" value={customExp} onChange={(e) => setCustomExp(e.target.value)} placeholder="Custom seconds"
              className="w-28 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text">Custom Header Fields</p>
          <button onClick={() => setCustomHeaderFields((prev) => [...prev, { key: "", value: "" }])} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
        {customHeaderFields.map((f, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input type="text" value={f.key} onChange={(e) => { const n = [...customHeaderFields]; n[i] = { ...n[i], key: e.target.value }; setCustomHeaderFields(n); }} placeholder="Key"
              className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="text" value={f.value} onChange={(e) => { const n = [...customHeaderFields]; n[i] = { ...n[i], value: e.target.value }; setCustomHeaderFields(n); }} placeholder="Value"
              className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <button onClick={() => setCustomHeaderFields((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text">Custom Claims</p>
          <button onClick={() => setCustomClaims((prev) => [...prev, { key: "", value: "" }])} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
        {customClaims.map((c, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input type="text" value={c.key} onChange={(e) => { const n = [...customClaims]; n[i] = { ...n[i], key: e.target.value }; setCustomClaims(n); }} placeholder="Claim"
              className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="text" value={c.value} onChange={(e) => { const n = [...customClaims]; n[i] = { ...n[i], value: e.target.value }; setCustomClaims(n); }} placeholder="Value"
              className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <button onClick={() => setCustomClaims((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {token && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Generated Token</span>
            <div className="flex gap-1">
              <button onClick={copyToken} className="rounded px-2 py-1 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center gap-1">
                <Copy size={12} /> Copy
              </button>
              <button onClick={() => setShowSave(!showSave)} className="rounded px-2 py-1 text-xs font-medium border border-surface-200 text-surface-700 hover:bg-surface-100 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors flex items-center gap-1">
                <Save size={12} /> Save
              </button>
            </div>
          </div>
          {showSave && (
            <div className="flex gap-2 mb-2">
              <input type="text" value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)} placeholder="Token label..."
                className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
              <button onClick={saveToken} disabled={!saveLabel.trim()} className="rounded bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">Save</button>
            </div>
          )}
          <div className="bg-white dark:bg-dark-bg rounded p-2 border border-surface-200 dark:border-dark-border overflow-auto max-h-24">
            {renderTokenPreview()}
          </div>
        </div>
      )}

      {savedTokens.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Saved Tokens</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {savedTokens.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-surface-200 bg-white px-3 py-1.5 dark:border-dark-border dark:bg-dark-surface">
                <span className="text-xs font-medium text-surface-700 dark:text-dark-text shrink-0">{s.label}</span>
                <code className="flex-1 text-[10px] font-mono text-surface-500 dark:text-dark-muted truncate">{s.token.slice(0, 40)}...</code>
                <button onClick={() => setToken(s.token)} className="text-xs text-brand-500 hover:text-brand-600">Load</button>
                <button onClick={() => deleteSaved(i)} className="text-xs text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
