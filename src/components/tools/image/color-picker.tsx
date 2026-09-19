"use client";

import { useState, useMemo, useCallback } from "react";

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface HSV { h: number; s: number; v: number }

function hexToRgb(hex: string): RGB | null {
  const h = hex.replace("#", "").trim();
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/))) {
    return { r: parseInt(m[1]! + m[1]!, 16), g: parseInt(m[2]! + m[2]!, 16), b: parseInt(m[3]! + m[3]!, 16) };
  }
  if ((m = h.match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/))) {
    return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
  }
  return null;
}

function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((c) => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360) % 360, s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = s / 100, ln = l / 100;
  let r: number, g: number, b: number;
  if (sn === 0) {
    r = g = b = ln;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function clampRgb(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function ColorPicker() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const syncFromHex = useCallback((newHex: string) => {
    setHex(newHex);
    const parsed = hexToRgb(newHex);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed));
      setError("");
    } else if (newHex.length >= 4) {
      setError("Invalid HEX color");
    }
  }, []);

  const syncFromRgb = useCallback((newRgb: RGB) => {
    const clamped: RGB = { r: clampRgb(newRgb.r), g: clampRgb(newRgb.g), b: clampRgb(newRgb.b) };
    setRgb(clamped);
    const newHex = rgbToHex(clamped);
    setHex(newHex);
    setHsl(rgbToHsl(clamped));
    setError("");
  }, []);

  const syncFromHsl = useCallback((newHsl: HSL) => {
    const normalized: HSL = {
      h: ((newHsl.h % 360) + 360) % 360,
      s: Math.min(100, Math.max(0, Math.round(newHsl.s))),
      l: Math.min(100, Math.max(0, Math.round(newHsl.l))),
    };
    setHsl(normalized);
    const newRgb = hslToRgb(normalized);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb));
    setError("");
  }, []);

  const hsv = useMemo(() => rgbToHsv(rgb), [rgb]);

  const palettes = useMemo(() => {
    const complementary = rgbToHex(hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
    const analogous = [-30, 30].map((d) => rgbToHex(hslToRgb({ h: (hsl.h + d + 360) % 360, s: hsl.s, l: hsl.l })));
    const triadic = [120, 240].map((d) => rgbToHex(hslToRgb({ h: (hsl.h + d) % 360, s: hsl.s, l: hsl.l })));
    return { complementary, analogous, triadic };
  }, [hsl]);

  const copy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const hexStr = rgbToHex(rgb);
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hsvStr = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <input type="color" value={hexStr} onChange={(e) => syncFromHex(e.target.value)} aria-label="Pick color" className="h-12 w-20 rounded-md border border-surface-200 dark:border-dark-border cursor-pointer" />
        <div className="flex-1 min-w-[180px]">
          <div className="h-12 rounded-md border border-surface-200 dark:border-dark-border" style={{ backgroundColor: hexStr }} aria-hidden="true" />
          <p className="mt-1 text-xs font-mono text-surface-500 dark:text-dark-muted">{hexStr} · {rgbStr} · {hslStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">HEX</label>
          <input value={hex} onChange={(e) => syncFromHex(e.target.value)} aria-label="HEX input" placeholder="#000000" className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">RGB</label>
          <div className="flex gap-1">
            <input type="number" min={0} max={255} value={rgb.r} onChange={(e) => syncFromRgb({ ...rgb, r: parseInt(e.target.value || "0", 10) })} aria-label="Red" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="number" min={0} max={255} value={rgb.g} onChange={(e) => syncFromRgb({ ...rgb, g: parseInt(e.target.value || "0", 10) })} aria-label="Green" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="number" min={0} max={255} value={rgb.b} onChange={(e) => syncFromRgb({ ...rgb, b: parseInt(e.target.value || "0", 10) })} aria-label="Blue" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">HSL</label>
          <div className="flex gap-1">
            <input type="number" min={0} max={360} value={hsl.h} onChange={(e) => syncFromHsl({ ...hsl, h: parseInt(e.target.value || "0", 10) })} aria-label="Hue" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="number" min={0} max={100} value={hsl.s} onChange={(e) => syncFromHsl({ ...hsl, s: parseInt(e.target.value || "0", 10) })} aria-label="Saturation" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <input type="number" min={0} max={100} value={hsl.l} onChange={(e) => syncFromHsl({ ...hsl, l: parseInt(e.target.value || "0", 10) })} aria-label="Lightness" className="w-full rounded-md border border-surface-200 bg-white px-2 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      </div>

      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      <div data-testid="tool-output" className="space-y-2 rounded-md border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text">Conversions</p>
        <div className="grid gap-2">
          {[
            { label: "HEX", value: hexStr },
            { label: "RGB", value: rgbStr },
            { label: "HSL", value: hslStr },
            { label: "HSV", value: hsvStr },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded bg-white px-3 py-2 dark:bg-dark-bg border border-surface-200 dark:border-dark-border">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted w-12">{item.label}</span>
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all">{item.value}</code>
              <button onClick={() => copy(item.value, item.label)} aria-label={`Copy ${item.label}`} className="ml-2 text-xs text-brand-500 hover:text-brand-600 min-w-[3rem] text-right">{copied === item.label ? "Copied!" : "Copy"}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Complementary</p>
          <div className="flex gap-2">
            <button onClick={() => syncFromHex(hexStr)} aria-label="Base color" className="h-8 w-8 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: hexStr }} title={hexStr} />
            <button onClick={() => syncFromHex(palettes.complementary)} aria-label="Complementary color" className="h-8 w-8 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: palettes.complementary }} title={palettes.complementary} />
          </div>
          <div className="mt-2 flex gap-1">
            <code className="text-[11px] font-mono text-surface-600 dark:text-dark-muted">{hexStr}</code>
            <span className="text-[11px] text-surface-400">→</span>
            <code className="text-[11px] font-mono text-surface-600 dark:text-dark-muted">{palettes.complementary}</code>
            <button onClick={() => copy(palettes.complementary, "comp")} aria-label="Copy complementary" className="ml-auto text-[11px] text-brand-500 hover:text-brand-600">{copied === "comp" ? "Copied!" : "Copy"}</button>
          </div>
        </div>
        <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Analogous</p>
          <div className="flex gap-2">
            {palettes.analogous.map((c) => (
              <button key={c} onClick={() => syncFromHex(c)} aria-label={`Analogous ${c}`} className="h-8 w-8 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} title={c} />
            ))}
            <button aria-label="Base analogous" className="h-8 w-8 rounded border-2 border-brand-500" style={{ backgroundColor: hexStr }} title={hexStr} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {palettes.analogous.map((c) => (
              <code key={c} className="text-[11px] font-mono text-surface-600 dark:text-dark-muted">{c}</code>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Triadic</p>
          <div className="flex gap-2">
            <button onClick={() => syncFromHex(hexStr)} aria-label="Base triadic" className="h-8 w-8 rounded border-2 border-brand-500" style={{ backgroundColor: hexStr }} title={hexStr} />
            {palettes.triadic.map((c) => (
              <button key={c} onClick={() => syncFromHex(c)} aria-label={`Triadic ${c}`} className="h-8 w-8 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[hexStr, ...palettes.triadic].map((c) => (
              <code key={c} className="text-[11px] font-mono text-surface-600 dark:text-dark-muted">{c}</code>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-surface-400 dark:text-dark-muted text-center">Browser-native color picker — no dependencies. Conversions use standard HSL/HSV formulas.</p>
    </div>
  );
}
