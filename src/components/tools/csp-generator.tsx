"use client";

import { useState, useMemo } from "react";
import { Copy, Plus, Trash2, Download, AlertTriangle, Shield } from "lucide-react";

interface Source {
  value: string;
  id: string;
}

interface Directive {
  id: string;
  label: string;
  enabled: boolean;
  sources: Source[];
}

const sourceOptions = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'", "'report-sample'", "https:", "http:", "data:", "blob:", "filesystem:"];
const allDirectives = [
  "default-src", "script-src", "style-src", "img-src", "connect-src",
  "font-src", "object-src", "media-src", "frame-src", "frame-ancestors",
  "form-action", "base-uri", "worker-src", "manifest-src", "report-uri",
];

const presets: Record<string, { label: string; dirs: Record<string, string[]> }> = {
  strict: {
    label: "Strict CSP",
    dirs: { "default-src": ["'self'"], "script-src": ["'self'", "'strict-dynamic'"], "object-src": ["'none'"], "base-uri": ["'self'"], "report-uri": ["/csp-report"] },
  },
  wordpress: {
    label: "WordPress",
    dirs: { "default-src": ["'self'"], "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"], "style-src": ["'self'", "'unsafe-inline'", "https:"], "img-src": ["'self'", "data:", "https:"], "frame-src": ["'self'", "https:"], "object-src": ["'none'"] },
  },
  react: {
    label: "React/SPA",
    dirs: { "default-src": ["'self'"], "script-src": ["'self'", "'unsafe-inline'"], "style-src": ["'self'", "'unsafe-inline'"], "img-src": ["'self'", "data:", "https:"], "connect-src": ["'self'", "https:"], "font-src": ["'self'", "https:"], "object-src": ["'none'"] },
  },
  api: {
    label: "API Only",
    dirs: { "default-src": ["'none'"], "script-src": ["'none'"], "connect-src": ["'self'"], "img-src": ["'none'"], "style-src": ["'none'"], "font-src": ["'none'"], "object-src": ["'none'"] },
  },
};

function makeDirectives(presetDirs: Record<string, string[]>): Directive[] {
  return allDirectives.map((id) => ({
    id, label: id,
    enabled: !!presetDirs[id],
    sources: (presetDirs[id] || []).map((v) => ({ value: v, id: `${id}-${v}-${Math.random().toString(36).slice(2, 6)}` })),
  }));
}

export function CspGenerator() {
  const [directives, setDirectives] = useState<Directive[]>(() => makeDirectives({ "default-src": ["'self'"] }));
  const [customDirs, setCustomDirs] = useState<{ id: string; sources: Source[] }[]>([]);
  const [reportUri, setReportUri] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [nonce, setNonce] = useState("");
  const [asMeta, setAsMeta] = useState(false);

  const allDirs = useMemo(() => [
    ...directives,
    ...customDirs.map((d) => ({ id: d.id, label: d.id, enabled: true, sources: d.sources })),
  ], [directives, customDirs]);

  const policy = useMemo(() => {
    const parts = allDirs.filter((d) => d.enabled && d.sources.length > 0).map((d) => {
      const srcs = d.sources.map((s) => {
        let val = s.value;
        if (d.id === "script-src" && nonce) val = `'nonce-${nonce}'`;
        return val;
      }).join(" ");
      return `${d.id} ${srcs}`;
    });
    if (reportUri) parts.push(`report-uri ${reportUri}`);
    if (reportTo) parts.push(`report-to ${reportTo}`);
    return parts.join("; ");
  }, [allDirs, reportUri, reportTo, nonce]);

  const effectiveness = useMemo(() => {
    let score = 5;
    if (policy.includes("'strict-dynamic'")) score += 3;
    if (policy.includes("'unsafe-inline'")) score -= 3;
    if (policy.includes("'unsafe-eval'")) score -= 2;
    if (policy.includes("'none'")) score += 2;
    if (nonce) score += 2;
    if (reportUri) score += 1;
    if (policy.includes("base-uri")) score += 1;
    if (policy.includes("object-src")) score += 1;
    if (policy.includes("frame-ancestors")) score += 1;
    const dirCount = allDirs.filter((d) => d.enabled).length;
    const srcCount = allDirs.reduce((s, d) => s + d.sources.length, 0);
    return { score: Math.max(1, Math.min(10, score)), dirCount, srcCount, rating: score >= 8 ? "High" : score >= 5 ? "Medium" : "Low" };
  }, [policy, allDirs, nonce, reportUri]);

  const hasInlineWarnings = useMemo(() => {
    const scriptDir = allDirs.find((d) => d.id === "script-src");
    const styleDir = allDirs.find((d) => d.id === "style-src");
    return {
      scriptUnsafe: scriptDir?.sources.some((s) => s.value === "'unsafe-inline'"),
      styleUnsafe: styleDir?.sources.some((s) => s.value === "'unsafe-inline'"),
    };
  }, [allDirs]);

  const toggle = (id: string) => {
    setDirectives((prev) => prev.map((d) => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };

  const addSource = (dirId: string, value: string) => {
    setDirectives((prev) => prev.map((d) => d.id === dirId ? { ...d, sources: [...d.sources, { value, id: crypto.randomUUID() }] } : d));
  };

  const removeSource = (dirId: string, srcId: string) => {
    setDirectives((prev) => prev.map((d) => d.id === dirId ? { ...d, sources: d.sources.filter((s) => s.id !== srcId) } : d));
  };

  const updateSource = (dirId: string, srcId: string, value: string) => {
    setDirectives((prev) => prev.map((d) => d.id === dirId ? { ...d, sources: d.sources.map((s) => s.id === srcId ? { ...s, value } : s) } : d));
  };

  const addCustomDir = () => {
    setCustomDirs((prev) => [...prev, { id: "", sources: [] }]);
  };

  const updateCustomDir = (idx: number, id: string) => {
    setCustomDirs((prev) => prev.map((d, i) => i === idx ? { ...d, id } : d));
  };

  const removeCustomDir = (idx: number) => {
    setCustomDirs((prev) => prev.filter((_, i) => i !== idx));
  };

  const applyPreset = (name: string) => {
    const p = presets[name];
    if (!p) return;
    setDirectives(makeDirectives(p.dirs));
    setCustomDirs([]);
    setNonce("");
  };

  const generateNonce = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    setNonce(Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(""));
  };

  const finalPolicy = useMemo(() => {
    if (asMeta) return `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
    return policy;
  }, [policy, asMeta]);

  const copyPolicy = async () => {
    if (policy) await navigator.clipboard.writeText(finalPolicy);
  };

  const download = (format: "txt" | "json") => {
    const content = format === "json" ? JSON.stringify({ "content-security-policy": policy, directives: allDirs }, null, 2) : finalPolicy;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `csp-policy.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([key, p]) => (
          <button key={key} onClick={() => applyPreset(key)}
            className="rounded px-3 py-1.5 text-xs font-medium bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-dark-muted">
        <span>Directives: {effectiveness.dirCount}</span>
        <span>Sources: {effectiveness.srcCount}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${effectiveness.rating === "High" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : effectiveness.rating === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          <Shield size={10} /> {effectiveness.rating} ({effectiveness.score}/10)
        </span>
      </div>

      {hasInlineWarnings.scriptUnsafe && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-500" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">script-src contains &apos;unsafe-inline&apos; — consider using a nonce or hash instead.</p>
        </div>
      )}
      {hasInlineWarnings.styleUnsafe && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-500" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">style-src contains &apos;unsafe-inline&apos; — consider using a nonce or hash instead.</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Nonce:</label>
        <input type="text" value={nonce} onChange={(e) => setNonce(e.target.value)} placeholder="auto-generated"
          className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        <button onClick={generateNonce} className="rounded bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        {nonce && <span className="text-[10px] text-green-600 dark:text-green-400">Applied to script-src</span>}
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {directives.map((d) => (
          <div key={d.id} className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
            <input type="checkbox" checked={d.enabled} onChange={() => toggle(d.id)}
              className="rounded border-surface-300 text-brand-500 focus:ring-brand-400 dark:border-dark-muted" />
            <span className="text-xs font-medium text-surface-700 dark:text-dark-text w-28 shrink-0">{d.label}</span>
            <div className="flex-1 flex flex-wrap gap-1">
              {d.sources.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-0.5 rounded bg-white dark:bg-dark-bg border border-surface-200 dark:border-dark-border px-1.5 py-0.5 text-[10px] font-mono text-surface-700 dark:text-dark-text">
                  <input type="text" value={s.value} onChange={(e) => updateSource(d.id, s.id, e.target.value)}
                    className="w-16 bg-transparent outline-none text-[10px] font-mono" />
                  <button onClick={() => removeSource(d.id, s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                </span>
              ))}
              <select onChange={(e) => { if (e.target.value) { addSource(d.id, e.target.value); e.target.value = ""; } }}
                className="text-[10px] rounded border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="">+ source</option>
                {sourceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      {customDirs.map((d, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-3 py-2 dark:border-brand-700 dark:bg-brand-900/10">
          <input type="text" value={d.id} onChange={(e) => updateCustomDir(i, e.target.value)} placeholder="custom-directive"
            className="w-28 rounded border border-brand-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <div className="flex-1 flex flex-wrap gap-1">
            {d.sources.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-0.5 rounded bg-white dark:bg-dark-bg border border-surface-200 dark:border-dark-border px-1.5 py-0.5 text-[10px] font-mono">
                <input type="text" value={s.value} onChange={(e) => setCustomDirs((prev) => prev.map((cd, ci) => ci === i ? { ...cd, sources: cd.sources.map((cs) => cs.id === s.id ? { ...cs, value: e.target.value } : cs) } : cd))}
                  className="w-16 bg-transparent outline-none text-[10px] font-mono" />
                <button onClick={() => setCustomDirs((prev) => prev.map((cd, ci) => ci === i ? { ...cd, sources: cd.sources.filter((cs) => cs.id !== s.id) } : cd))} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
              </span>
            ))}
            <select onChange={(e) => { if (e.target.value) { setCustomDirs((prev) => prev.map((cd, ci) => ci === i ? { ...cd, sources: [...cd.sources, { value: e.target.value, id: crypto.randomUUID() }] } : cd)); e.target.value = ""; } }}
              className="text-[10px] rounded border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="">+ source</option>
              {sourceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <button onClick={() => removeCustomDir(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
        </div>
      ))}

      <button onClick={addCustomDir} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
        <Plus size={12} /> Add Custom Directive
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-0.5">report-uri</label>
          <input type="text" value={reportUri} onChange={(e) => setReportUri(e.target.value)} placeholder="/csp-report"
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-0.5">report-to</label>
          <input type="text" value={reportTo} onChange={(e) => setReportTo(e.target.value)} placeholder="endpoint-name"
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
        <input type="checkbox" checked={asMeta} onChange={(e) => setAsMeta(e.target.checked)} className="accent-brand-500" />
        Output as &lt;meta&gt; tag
      </label>

      {policy && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Generated Policy</span>
            <div className="flex gap-1">
              <button onClick={copyPolicy} className="rounded px-2 py-1 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center gap-1"><Copy size={12} /> Copy</button>
              <button onClick={() => download("txt")} className="rounded px-2 py-1 text-xs font-medium border border-surface-200 text-surface-700 hover:bg-surface-100 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors flex items-center gap-1"><Download size={12} /> .txt</button>
              <button onClick={() => download("json")} className="rounded px-2 py-1 text-xs font-medium border border-surface-200 text-surface-700 hover:bg-surface-100 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border transition-colors flex items-center gap-1"><Download size={12} /> .json</button>
            </div>
          </div>
          <pre className="bg-white dark:bg-dark-bg rounded p-2 text-xs font-mono text-surface-900 dark:text-dark-text border border-surface-200 dark:border-dark-border overflow-auto max-h-32 select-all break-all whitespace-pre-wrap">{finalPolicy}</pre>
        </div>
      )}
    </div>
  );
}
