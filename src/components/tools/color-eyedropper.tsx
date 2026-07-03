"use client";

import { useState, useMemo, useCallback } from "react";

interface RGB { r: number; g: number; b: number }
const namedColors: Record<string, string> = { aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32" };

function hexToRgb(hex: string): RGB | null {
  const h = hex.replace("#", ""); let m;
  if ((m = h.match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i))) return { r: parseInt(m[1]! + m[1], 16), g: parseInt(m[2]! + m[2], 16), b: parseInt(m[3]! + m[3], 16) };
  if ((m = h.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i))) return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
  return null;
}
function rgbToHex({ r, g, b }: RGB) { return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join(""); }
function rgbToHsl({ r, g, b }: RGB) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); switch (mx) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }
function rgbToHsv({ r, g, b }: RGB) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0; const v = mx, d = mx - mn, s = mx === 0 ? 0 : d / mx; if (mx !== mn) { switch (mx) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } } return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }; }
function rgbToCmyk({ r, g, b }: RGB) { const mr = r / 255, mg = g / 255, mb = b / 255, k = 1 - Math.max(mr, mg, mb); if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }; return { c: Math.round(((1 - mr - k) / (1 - k)) * 100), m: Math.round(((1 - mg - k) / (1 - k)) * 100), y: Math.round(((1 - mb - k) / (1 - k)) * 100), k: Math.round(k * 100) }; }
function hexToHsl(hex: string) { const rgb = hexToRgb(hex); return rgb ? rgbToHsl(rgb) : null; }
function hslToHex(hsl: { h: number; s: number; l: number }) { let { h, s, l } = hsl; h /= 360; s /= 100; l /= 100; const hue2 = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return rgbToHex({ r: Math.round(hue2(p, q, h + 1 / 3) * 255), g: Math.round(hue2(p, q, h) * 255), b: Math.round(hue2(p, q, h - 1 / 3) * 255) }); }

function relativeLum({ r, g, b }: RGB) { const [rl, gl, bl] = [r, g, b].map((c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl; }
function contrastRatio(c1: RGB, c2: RGB) { const l1 = relativeLum(c1), l2 = relativeLum(c2); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function rotateHue(hex: string, deg: number) { const hsl = hexToHsl(hex); if (!hsl) return hex; hsl.h = ((hsl.h + deg) % 360 + 360) % 360; return hslToHex(hsl); }

function genHarmonies(hex: string) {
  return {
    complementary: [hex, rotateHue(hex, 180)],
    analogous: [rotateHue(hex, -30), rotateHue(hex, -15), hex, rotateHue(hex, 15), rotateHue(hex, 30)],
    triadic: [hex, rotateHue(hex, 120), rotateHue(hex, 240)],
    tetradic: [hex, rotateHue(hex, 90), rotateHue(hex, 180), rotateHue(hex, 270)],
    splitComplementary: [hex, rotateHue(hex, 150), rotateHue(hex, 210)],
  };
}

function genShadesTints(hex: string) {
  const rgb = hexToRgb(hex); if (!rgb) return { shades: [], tints: [] };
  const tints = [5, 4, 3, 2, 1].map((i) => { const f = i / 5; return rgbToHex({ r: Math.round(rgb.r + (255 - rgb.r) * f), g: Math.round(rgb.g + (255 - rgb.g) * f), b: Math.round(rgb.b + (255 - rgb.b) * f) }); });
  const shades = [1, 2, 3, 4, 5].map((i) => { const f = i / 5; return rgbToHex({ r: Math.round(rgb.r * (1 - f)), g: Math.round(rgb.g * (1 - f)), b: Math.round(rgb.b * (1 - f)) }); });
  return { tints, shades };
}

const blindnessSim = (hex: string, type: string) => {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  const m: Record<string, number[][]> = {
    protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  };
  const mat = m[type]!;
  const nr = Math.round((rgb.r * mat[0]![0]! + rgb.g * mat[0]![1]! + rgb.b * mat[0]![2]!));
  const ng = Math.round((rgb.r * mat[1]![0]! + rgb.g * mat[1]![1]! + rgb.b * mat[1]![2]!));
  const nb = Math.round((rgb.r * mat[2]![0]! + rgb.g * mat[2]![1]! + rgb.b * mat[2]![2]!));
  return rgbToHex({ r: Math.min(255, Math.max(0, nr)), g: Math.min(255, Math.max(0, ng)), b: Math.min(255, Math.max(0, nb)) });
};

const STORAGE_KEY = "color-eyedropper-history";
const PALETTE_KEY = "color-eyedropper-palette";

export function ColorEyedropper() {
  const [hex, setHex] = useState("#6366f1");
  const [r, setR] = useState(99); const [g, setG] = useState(102); const [b, setB] = useState(241);
  const [contrastHex, setContrastHex] = useState("#000000");
  const [history, setHistory] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; } });
  const [palette, setPalette] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(PALETTE_KEY) ?? "[]"); } catch { return []; } });
  const [copied, setCopied] = useState("");
  const [gradientColor, setGradientColor] = useState("#ff0000");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb) : null, [rgb]);
  const hsv = useMemo(() => rgb ? rgbToHsv(rgb) : null, [rgb]);
  const cmyk = useMemo(() => rgb ? rgbToCmyk(rgb) : null, [rgb]);
  const cssName = useMemo(() => { const h = hex.toUpperCase(); for (const [n, c] of Object.entries(namedColors)) { if (c.toUpperCase() === h) return n; } return ""; }, [hex]);
  const harmonies = useMemo(() => genHarmonies(hex), [hex]);
  const { tints, shades } = useMemo(() => genShadesTints(hex), [hex]);
  const contrastRgb = useMemo(() => hexToRgb(contrastHex), [contrastHex]);
  const ratio = useMemo(() => { if (!rgb || !contrastRgb) return null; return contrastRatio(rgb, contrastRgb); }, [rgb, contrastRgb]);
  const gradientCss = useMemo(() => `background: linear-gradient(135deg, ${hex}, ${gradientColor});`, [hex, gradientColor]);

  const updateHex = useCallback((h: string) => {
    setHex(h); const c = hexToRgb(h); if (c) { setR(c.r); setG(c.g); setB(c.b); }
    setHistory((prev) => { const n = [h, ...prev.filter((x) => x !== h)].slice(0, 20); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch {} return n; });
  }, []);

  const handleRgbChange = () => { const h = rgbToHex({ r: Math.min(255, Math.max(0, r)), g: Math.min(255, Math.max(0, g)), b: Math.min(255, Math.max(0, b)) }); updateHex(h); };

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const saveToPalette = () => {
    setPalette((prev) => { const n = [hex, ...prev.filter((x) => x !== hex)].slice(0, 20); try { localStorage.setItem(PALETTE_KEY, JSON.stringify(n)); } catch {} return n; });
  };

  const exportPalette = (format: "css" | "json" | "tailwind") => {
    const all = [hex, ...harmonies.complementary, ...harmonies.analogous, ...harmonies.triadic, ...shades, ...tints].filter((v, i, a) => a.indexOf(v) === i);
    let text = "";
    if (format === "css") text = all.map((c, i) => `--color-${i}: ${c};`).join("\n");
    else if (format === "json") text = JSON.stringify(all, null, 2);
    else text = `colors: {\n${all.map((c, i) => `  'palette-${i}': '${c}',`).join("\n")}\n}`;
    handleCopy(text, "export");
  };

  const inputCls = "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-20 rounded-lg border border-surface-200 dark:border-dark-border shrink-0" style={{ backgroundColor: hex }} />
        <div className="flex-1"><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">HEX Color</label><input type="text" value={hex} onChange={(e) => updateHex(e.target.value)} className={inputCls} /></div>
        <input type="color" value={hex} onChange={(e) => updateHex(e.target.value)} className="h-10 w-10 rounded border border-surface-200 cursor-pointer dark:border-dark-border" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["r", "g", "b"] as const).map((ch, i) => (
          <div key={ch}><label className="block text-xs text-surface-500 dark:text-dark-muted uppercase">{ch} ({[r, g, b][i]})</label>
            <input type="range" min={0} max={255} value={[r, g, b][i]} onChange={(e) => { const vals = [r, g, b]; vals[i] = +e.target.value; setR(vals[0]!); setG(vals[1]!); setB(vals[2]!); handleRgbChange(); }} className="w-full accent-brand-500" /></div>
        ))}
      </div>

      {cssName && <p className="text-xs text-surface-400 dark:text-dark-muted">CSS Name: <span className="font-medium text-surface-600 dark:text-dark-text">{cssName}</span></p>}

      <div className="space-y-1.5">
        {[["HEX", hex], ["RGB", rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ""], ["HSL", hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ""], ["HSV", hsv ? `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` : ""], ["CMYK", cmyk ? `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` : ""]].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
            <span className="text-xs text-surface-500 w-12">{label}</span>
            <code className="flex-1 text-xs font-mono text-surface-900 dark:text-dark-text select-all">{value}</code>
            <button onClick={() => handleCopy(value, label)} className="text-xs text-brand-500 hover:text-brand-600 shrink-0 ml-2">{copied === label ? "Done" : "Copy"}</button>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Color Harmonies</p>
        {Object.entries(harmonies).map(([name, colors]) => (
          <div key={name} className="flex items-center gap-1 mb-1">
            <span className="text-xs text-surface-400 w-28 capitalize">{name.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
            {colors.map((c, i) => <button key={i} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} onClick={() => updateHex(c)} title={c} />)}
          </div>
        ))}
      </div>

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Shades & Tints</p>
        <div className="flex gap-1 mb-1">{tints.map((c, i) => <button key={`t${i}`} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} onClick={() => updateHex(c)} title={c} />)}</div>
        <div className="flex gap-1">{shades.map((c, i) => <button key={`s${i}`} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} onClick={() => updateHex(c)} title={c} />)}</div>
      </div>

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">WCAG Contrast Checker</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><p className="text-xs text-surface-400 mb-1">Color</p><div className="h-8 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: hex }} /></div>
          <div><p className="text-xs text-surface-400 mb-1">Contrast with</p><input type="text" value={contrastHex} onChange={(e) => setContrastHex(e.target.value)} className={inputCls} /></div>
        </div>
        {ratio && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-surface-700 dark:text-dark-text">{ratio.toFixed(2)}:1</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ratio >= 7 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : ratio >= 4.5 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>{ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail"}</span>
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Color Blindness Simulation</p>
        <div className="flex gap-2">{["protanopia", "deuteranopia", "tritanopia"].map((type) => (
          <div key={type} className="flex items-center gap-1"><div className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: blindnessSim(hex, type) }} /><span className="text-xs text-surface-400 capitalize">{type.replace("opia", "")}</span></div>
        ))}</div>
      </div>

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-2">Gradient Generator</p>
        <div className="flex items-center gap-2">
          <input type="color" value={hex} onChange={(e) => updateHex(e.target.value)} className="h-8 w-8 rounded border border-surface-200 cursor-pointer dark:border-dark-border" />
          <span className="text-xs text-surface-400">→</span>
          <input type="color" value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} className="h-8 w-8 rounded border border-surface-200 cursor-pointer dark:border-dark-border" />
        </div>
        <div className="mt-1 h-8 rounded border border-surface-200 dark:border-dark-border" style={{ background: `linear-gradient(135deg, ${hex}, ${gradientColor})` }} />
        <code className="mt-1 block text-xs font-mono text-surface-600 dark:text-dark-muted select-all">{gradientCss}</code>
        <button onClick={() => handleCopy(gradientCss, "gradient")} className="text-xs text-brand-500 hover:text-brand-600 mt-1">{copied === "gradient" ? "Copied!" : "Copy CSS"}</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={saveToPalette} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Save to Palette</button>
        <button onClick={() => exportPalette("css")} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Export CSS</button>
        <button onClick={() => exportPalette("json")} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Export JSON</button>
        <button onClick={() => exportPalette("tailwind")} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">Export Tailwind</button>
      </div>

      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-1">History</p>
          <div className="flex flex-wrap gap-1">{history.map((c, i) => <button key={i} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} onClick={() => updateHex(c)} title={c} />)}</div>
        </div>
      )}

      {palette.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Saved Palette</p>
          <div className="flex flex-wrap gap-1">{palette.map((c, i) => <button key={i} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border" style={{ backgroundColor: c }} onClick={() => updateHex(c)} title={c} />)}</div>
        </div>
      )}
    </div>
  );
}
