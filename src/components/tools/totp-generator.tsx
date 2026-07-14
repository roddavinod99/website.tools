"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Copy, Plus, Trash2, RefreshCw, QrCode, Download } from "lucide-react";
import QRCode from "qrcode";

function base32ToBytes(base32: string): Uint8Array {
  const cleaned = base32.replace(/[^A-Za-z2-7]/g, "").toUpperCase();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits: number[] = [];
  for (const ch of cleaned) {
    const idx = alphabet.indexOf(ch);
    if (idx >= 0) {
      for (let b = 4; b >= 0; b--) bits.push((idx >> b) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

function isValidBase32(s: string): boolean {
  return /^[A-Z2-7]+=*$/i.test(s.replace(/\s/g, "").toUpperCase());
}

function generateRandomSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 32; i++) secret += chars[Math.floor(Math.random() * chars.length)];
  return secret;
}

function counterToBytes(counter: number): ArrayBuffer {
  const buf = new ArrayBuffer(8);
  const view = new Uint8Array(buf);
  for (let i = 7; i >= 0; i--) {
    view[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  return buf;
}

async function generateHOTP(secret: string, counter: number, algorithm: string, digits: number): Promise<string> {
  const keyBytes = base32ToBytes(secret);
  if (keyBytes.length === 0) return "000000";
  const counterBuf = counterToBytes(counter);
  const key = await crypto.subtle.importKey("raw", new Uint8Array(keyBytes), { name: "HMAC", hash: algorithm as AlgorithmIdentifier }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new Uint8Array(counterBuf));
  const hmac = new Uint8Array(sig);
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (code % Math.pow(10, digits)).toString().padStart(digits, "0");
}

async function generateSteamCode(secret: string, counter: number, algorithm: string): Promise<string> {
  const steamChars = "23456789BCDFGHJKMNPQRTVWXY";
  const counterBuf = counterToBytes(counter);
  const key = await crypto.subtle.importKey("raw", new Uint8Array(base32ToBytes(secret)), { name: "HMAC", hash: algorithm as AlgorithmIdentifier }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new Uint8Array(counterBuf));
  const hmac = new Uint8Array(sig);
  const offset = hmac[hmac.length - 1] & 0xf;
  let fullCode = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  let code = "";
  for (let i = 0; i < 5; i++) { code += steamChars[fullCode % steamChars.length]; fullCode = Math.floor(fullCode / steamChars.length); }
  return code;
}

interface Account {
  id: string;
  label: string;
  secret: string;
  algorithm: string;
  digits: number;
  step: number;
  steam: boolean;
}

interface CodeHistory {
  accountId: string;
  code: string;
  time: string;
}

export function TotpGenerator() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "default", label: "Default", secret: "JBSWY3DPEHPK3PXP", algorithm: "SHA-1", digits: 6, step: 30, steam: false },
  ]);
  const [activeId, setActiveId] = useState("default");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<CodeHistory[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(() => { const s = 30; const n = Math.floor(Date.now() / 1000); return s - (n % s); });
  const [progressPct, setProgressPct] = useState(() => { const s = 30; const n = Math.floor(Date.now() / 1000); const r = s - (n % s); return (r / s) * 100; });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeAccount = useMemo(() => accounts.find((a) => a.id === activeId) || accounts[0], [accounts, activeId]);

  const updateCode = useCallback(async () => {
    const newCodes: Record<string, string> = {};
    const now = Math.floor(Date.now() / 1000);
    for (const acc of accounts) {
      const counter = Math.floor(now / acc.step);
      let code: string;
      if (acc.steam) {
        code = await generateSteamCode(acc.secret, counter, acc.algorithm);
      } else {
        code = await generateHOTP(acc.secret, counter, acc.algorithm, acc.digits);
      }
      newCodes[acc.id] = code;
    }
    setCodes((prev) => {
      for (const accId of Object.keys(newCodes)) {
        if (prev[accId] && prev[accId] !== newCodes[accId]) {
          setHistory((h) => [{ accountId: accId, code: prev[accId], time: new Date().toLocaleTimeString() }, ...h].slice(0, 20));
        }
      }
      return newCodes;
    });
    const step = activeAccount?.step || 30;
    const rem = step - (now % step);
    setTimeRemaining(rem);
    setProgressPct((rem / step) * 100);
  }, [accounts, activeAccount]);

  useEffect(() => {
    timerRef.current = setInterval(updateCode, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [updateCode]);

  useEffect(() => {
    const a = activeAccount;
    if (showQR && a) {
      const enc = encodeURIComponent(a.label);
      const uri = `otpauth://totp/${enc}?secret=${a.secret}&algorithm=${a.algorithm}&digits=${a.digits}&period=${a.step}${a.steam ? "&issuer=Steam" : ""}`;
      QRCode.toDataURL(uri, { width: 200, margin: 2, color: { dark: "#1e293b", light: "#ffffff" } }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
    }
  }, [showQR, activeAccount]);

  const addAccount = () => {
    const newAcc: Account = {
      id: crypto.randomUUID(), label: `Account ${accounts.length + 1}`,
      secret: generateRandomSecret(), algorithm: "SHA-1", digits: 6, step: 30, steam: false,
    };
    setAccounts((prev) => [...prev, newAcc]);
    setActiveId(newAcc.id);
  };

  const removeAccount = (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (activeId === id) setActiveId(accounts.find((a) => a.id !== id)?.id || "");
  };

  const updateAccount = (id: string, field: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...field } : a));
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const exportConfig = () => {
    const a = activeAccount;
    if (!a) return;
    const config = {
      label: a.label,
      secret: a.secret,
      algorithm: a.algorithm,
      digits: a.digits,
      period: a.step,
      steam: a.steam,
      type: "totp",
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `${a.label.replace(/\s+/g, "-").toLowerCase()}-totp-config.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const otpauthUri = useMemo(() => {
    const a = activeAccount;
    if (!a) return "";
    const enc = encodeURIComponent(a.label);
    return `otpauth://totp/${enc}?secret=${a.secret}&algorithm=${a.algorithm}&digits=${a.digits}&period=${a.step}${a.steam ? "&issuer=Steam" : ""}`;
  }, [activeAccount]);

  const currentCode = codes[activeId] || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {accounts.map((acc) => (
          <button key={acc.id} onClick={() => setActiveId(acc.id)}
            className={`flex items-center gap-1 shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors ${acc.id === activeId ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"}`}>
            {acc.label}
            {accounts.length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); removeAccount(acc.id); }} className="ml-1 opacity-60 hover:opacity-100"><Trash2 size={12} /></span>
            )}
          </button>
        ))}
        <button onClick={addAccount} className="shrink-0 rounded px-2 py-1.5 text-xs font-medium text-brand-500 hover:bg-surface-100 dark:hover:bg-dark-border transition-colors flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Secret Key (Base32)</label>
          <input type="text" value={activeAccount?.secret || ""}
            onChange={(e) => updateAccount(activeId, { secret: e.target.value.toUpperCase() })}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-dark-surface dark:text-dark-text ${isValidBase32(activeAccount?.secret || "") ? "border-surface-200 dark:border-dark-border" : "border-red-300 dark:border-red-700"}`} />
          {!isValidBase32(activeAccount?.secret || "") && activeAccount?.secret && (
            <p className="mt-0.5 text-xs text-red-500">Invalid Base32 format</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Algorithm</label>
          <select value={activeAccount?.algorithm || "SHA-1"}
            onChange={(e) => updateAccount(activeId, { algorithm: e.target.value })}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Digits</label>
          <div className="flex gap-1">
            {[6, 8].map((d) => (
              <button key={d} onClick={() => updateAccount(activeId, { digits: d })}
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${(activeAccount?.digits || 6) === d ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Time Step</label>
          <div className="flex gap-1">
            {[15, 30, 60].concat(activeAccount?.step && ![15, 30, 60].includes(activeAccount.step) ? [activeAccount.step] : []).filter((v, i, a) => a.indexOf(v) === i).map((s) => (
              <button key={s} onClick={() => updateAccount(activeId, { step: s })}
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${(activeAccount?.step || 30) === s ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"}`}>
                {s}s
              </button>
            ))}
            <input type="number" value={activeAccount?.step || 30} onChange={(e) => updateAccount(activeId, { step: Math.max(1, parseInt(e.target.value) || 30) })}
              className="w-14 rounded border border-surface-200 bg-white px-1 py-1 text-xs text-surface-900 text-center focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text mb-1">
            <input type="checkbox" checked={activeAccount?.steam || false}
              onChange={(e) => updateAccount(activeId, { steam: e.target.checked })}
              className="accent-brand-500" />
            Steam TOTP Mode
          </label>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="text-5xl font-bold font-mono text-surface-900 dark:text-dark-text tracking-[0.2em] select-all">
          {currentCode || "------"}
        </div>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span className="flex items-center gap-1"><RefreshCw size={12} /> Refreshes in {timeRemaining}s</span>
          {activeAccount?.steam && <span className="text-yellow-500">Steam Mode</span>}
        </div>
        <div className="mt-2 mx-auto max-w-xs bg-surface-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => copyCode(currentCode)} disabled={!currentCode}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center gap-2">
          <Copy size={14} /> {copied === currentCode ? "Copied!" : "Copy Code"}
        </button>
        <button onClick={() => { updateAccount(activeId, { secret: generateRandomSecret() }); }}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors flex items-center gap-2">
          <RefreshCw size={14} /> New Secret
        </button>
        <button onClick={() => setShowQR(!showQR)}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors flex items-center gap-2">
          <QrCode size={14} /> {showQR ? "Hide QR" : "Show QR"}
        </button>
        <button onClick={exportConfig}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors flex items-center gap-2">
          <Download size={14} /> Export JSON
        </button>
      </div>

      {showQR && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Scan with authenticator app</p>
          <div className="flex flex-col items-center gap-3">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="TOTP QR Code" className="rounded-lg border border-surface-200 dark:border-dark-border" />
            ) : (
              <div className="w-[200px] h-[200px] rounded-lg bg-surface-200 dark:bg-dark-border flex items-center justify-center text-xs text-surface-400">Generating QR...</div>
            )}
            <div className="w-full">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">otpauth:// URI</p>
              <div className="flex gap-2">
                <code className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 break-all dark:border-dark-border dark:bg-dark-bg dark:text-dark-text select-all">{otpauthUri}</code>
                <button onClick={() => copyCode(otpauthUri)} className="text-xs text-brand-500 hover:text-brand-600 shrink-0"><Copy size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Code History</p>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {history.filter((h) => h.accountId === activeId).slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-surface-500 dark:text-dark-muted">
                <span className="font-mono">{h.code}</span>
                <span className="text-[10px]">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
