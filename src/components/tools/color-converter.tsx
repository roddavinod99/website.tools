"use client";

import { useState, useMemo, useCallback } from "react";

interface RGB { r: number; g: number; b: number; a?: number }
interface HSL { h: number; s: number; l: number; a?: number }
interface HSV { h: number; s: number; v: number; a?: number }
interface CMYK { c: number; m: number; y: number; k: number }

const namedColors: Record<string, string> = {
  aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4",
  azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000",
  blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a",
  burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e",
  coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c",
  cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000",
  darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f",
  darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff",
  dimgray: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0",
  forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff",
  gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f",
  honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082",
  ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080",
  lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90",
  lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa",
  lightslategray: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00",
  limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000",
  mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370db",
  mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa",
  mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080",
  oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500",
  orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98",
  paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9",
  peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080",
  rebeccapurple: "#663399", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1",
  saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57",
  seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb",
  slateblue: "#6a5acd", slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f",
  steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347",
  turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff",
  whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32",
};

function hexToRgb(hex: string): RGB | null {
  const h = hex.replace("#", "");
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i))) {
    return { r: parseInt(m[1]! + m[1], 16), g: parseInt(m[2]! + m[2], 16), b: parseInt(m[3]! + m[3], 16) };
  }
  if ((m = h.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i))) {
    return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
  }
  if ((m = h.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i))) {
    return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16), a: Math.round((parseInt(m[4]!, 16) / 255) * 100) / 100 };
  }
  return null;
}

function rgbToHex({ r, g, b, a }: RGB): string {
  const hex = "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
  if (a !== undefined && a < 1) { return hex + Math.round(a * 255).toString(16).padStart(2, "0"); }
  return hex;
}

function rgbToHsl({ r, g, b, a }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a };
}

function rgbToHsv({ r, g, b, a }: RGB): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const v = max; const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100), a };
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const mr = r / 255, mg = g / 255, mb = b / 255;
  const k = 1 - Math.max(mr, mg, mb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return { c: Math.round(((1 - mr - k) / (1 - k)) * 100), m: Math.round(((1 - mg - k) / (1 - k)) * 100), y: Math.round(((1 - mb - k) / (1 - k)) * 100), k: Math.round(k * 100) };
}

function parseColor(input: string): RGB | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith("#")) return hexToRgb(s);
  if (s.toLowerCase() in namedColors) return hexToRgb(namedColors[s.toLowerCase()]!);
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i))) {
    return { r: Math.min(255, +m[1]!), g: Math.min(255, +m[2]!), b: Math.min(255, +m[3]!), a: m[4] !== undefined ? +m[4] : undefined };
  }
  if ((m = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)$/i))) {
    return hslToRgb({ h: +m[1]!, s: +m[2]!, l: +m[3]!, a: m[4] !== undefined ? +m[4] : undefined });
  }
  return null;
}

function hslToRgb(hsl: HSL): RGB {
  let { h, s, l } = hsl; const { a } = hsl;
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
}

function relativeLuminance({ r, g, b }: RGB): number {
  const [rl, gl, bl] = [r, g, b].map((c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(c1: RGB, c2: RGB): number {
  const l1 = relativeLuminance(c1), l2 = relativeLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function generatePalette(base: RGB): { label: string; hex: string }[] {
  const palette: { label: string; hex: string }[] = [];
  const { r, g, b } = base;
  for (let i = 0; i <= 5; i++) { const f = 0.2 + i * 0.15; palette.push({ label: `Tint ${i + 1}`, hex: rgbToHex({ r: Math.min(255, Math.round(r + (255 - r) * (1 - f))), g: Math.min(255, Math.round(g + (255 - g) * (1 - f))), b: Math.min(255, Math.round(b + (255 - b) * (1 - f))) }) }); }
  for (let i = 0; i <= 4; i++) { const f = 0.2 + i * 0.15; palette.push({ label: `Shade ${i + 1}`, hex: rgbToHex({ r: Math.round(r * (1 - f)), g: Math.round(g * (1 - f)), b: Math.round(b * (1 - f)) }) }); }
  return palette;
}

function generateAnalogous(rgb: RGB): string[] {
  const hsl = rgbToHsl(rgb);
  return [-30, -15, 0, 15, 30].map((a) => { const h = ((hsl.h + a) % 360 + 360) % 360; return rgbToHex(hslToRgb({ h, s: hsl.s, l: hsl.l })); });
}

function generateComplementary(rgb: RGB): [string, string] {
  const hsl = rgbToHsl(rgb); const comp = (hsl.h + 180) % 360;
  return [rgbToHex(rgb), rgbToHex(hslToRgb({ h: comp, s: hsl.s, l: hsl.l }))];
}

function generateTriadic(rgb: RGB): string[] {
  const hsl = rgbToHsl(rgb);
  return [0, 120, 240].map((a) => { const h = (hsl.h + a) % 360; return rgbToHex(hslToRgb({ h, s: hsl.s, l: hsl.l })); });
}

function generateTetradic(rgb: RGB): string[] {
  const hsl = rgbToHsl(rgb);
  return [0, 90, 180, 270].map((a) => { const h = (hsl.h + a) % 360; return rgbToHex(hslToRgb({ h, s: hsl.s, l: hsl.l })); });
}

function generateMonochromatic(rgb: RGB): string[] {
  const hsl = rgbToHsl(rgb);
  return [10, 25, 50, 75, 100].map((s) => rgbToHex(hslToRgb({ h: hsl.h, s: Math.round(s), l: hsl.l })));
}

const presets = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#000000", "#FFFFFF", "#808080", "#FFA500", "#800080", "#008000",
  "#000080", "#800000", "#008080", "#C0C0C0", "#FFC0CB", "#A52A2A",
];

export function ColorConverter() {
  const [input, setInput] = useState("#2B5748");
  const [opacity, setOpacity] = useState(1);
  const [fgInput, setFgInput] = useState("#000000");
  const [bgInput, setBgInput] = useState("#FFFFFF");
  const [copied, setCopied] = useState("");

  const rgb = useMemo(() => { const base = parseColor(input); if (!base) return null; return { ...base, a: opacity }; }, [input, opacity]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb) : null, [rgb]);
  const hsv = useMemo(() => rgb ? rgbToHsv(rgb) : null, [rgb]);
  const cmyk = useMemo(() => rgb ? rgbToCmyk(rgb) : null, [rgb]);
  const hex = useMemo(() => rgb ? rgbToHex(rgb) : "", [rgb]);
  const hexShort = useMemo(() => { if (!rgb) return ""; const { r, g, b } = rgb; if (r % 17 === 0 && g % 17 === 0 && b % 17 === 0) return "#" + [r, g, b].map((c) => (c / 17).toString(16)).join(""); return ""; }, [rgb]);
  const cssName = useMemo(() => { if (!rgb) return ""; const hexUpper = hex.toUpperCase(); for (const [name, code] of Object.entries(namedColors)) { if (code.toUpperCase() === hexUpper) return name; } return ""; }, [hex, rgb]);

  const palette = useMemo(() => rgb ? generatePalette(rgb) : [], [rgb]);
  const analogous = useMemo(() => rgb ? generateAnalogous(rgb) : [], [rgb]);
  const complementary = useMemo(() => rgb ? generateComplementary(rgb) : [], [rgb]);
  const triadic = useMemo(() => rgb ? generateTriadic(rgb) : [], [rgb]);
  const tetradic = useMemo(() => rgb ? generateTetradic(rgb) : [], [rgb]);
  const monochromatic = useMemo(() => rgb ? generateMonochromatic(rgb) : [], [rgb]);

  const fgRgb = useMemo(() => parseColor(fgInput), [fgInput]);
  const bgRgb = useMemo(() => parseColor(bgInput), [bgInput]);
  const contrast = useMemo(() => { if (!fgRgb || !bgRgb) return null; return contrastRatio(fgRgb, bgRgb); }, [fgRgb, bgRgb]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const items: { label: string; value: string; key: string }[] = [
    { label: "HEX (6-digit)", value: hex, key: "hex6" },
    { label: "HEX (3-digit)", value: hexShort || "\u2014", key: "hex3" },
    { label: "HEX (8-digit alpha)", value: rgb && opacity < 1 ? hex.replace(/^.{7}/, (m) => m.slice(0, 6) + Math.round(opacity * 255).toString(16).padStart(2, "0")) : hex, key: "hex8" },
    { label: "RGB", value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "", key: "rgb" },
    { label: "RGBA", value: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})` : "", key: "rgba" },
    { label: "HSL", value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "", key: "hsl" },
    { label: "HSLA", value: hsl ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${opacity.toFixed(2)})` : "", key: "hsla" },
    { label: "HSV / HSB", value: hsv ? `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` : "", key: "hsv" },
    { label: "CMYK", value: cmyk ? `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` : "", key: "cmyk" },
    { label: "CSS Name", value: cssName || "\u2014", key: "cssname" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input type="color" value={hex || "#000000"} onChange={(e) => setInput(e.target.value)} className="h-12 w-20 rounded-lg border border-surface-200 dark:border-dark-border cursor-pointer" aria-label="Color picker" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Color Input</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="#000000, rgb(r,g,b), hsl(h,s,l), crimson..." className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Opacity / Alpha: {opacity.toFixed(2)}</label>
        <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full accent-brand-500" />
      </div>

      {!rgb && <p className="text-sm text-red-500">Invalid color format. Try HEX, RGB, HSL, or a named color.</p>}

      {rgb && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <span className="text-sm text-surface-500 dark:text-dark-muted w-32 shrink-0">{item.label}</span>
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all">{item.value}</code>
              <button onClick={() => handleCopy(item.value, item.key)} disabled={!item.value || item.value === "\u2014"} className="ml-2 text-xs text-brand-500 hover:text-brand-600 disabled:text-surface-300 dark:disabled:text-dark-muted transition-colors min-w-[3rem] text-right" aria-label={`Copy ${item.label}`}>{copied === item.key ? "Copied!" : "Copy"}</button>
            </div>
          ))}
        </div>
      )}

      {rgb && (
        <>
          <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Color Palette</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Shades and Tints</p>
                <div className="flex gap-1">{palette.slice(0, 6).map((c, i) => <button key={`t${i}`} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c.hex }} onClick={() => setInput(c.hex)} title={c.hex} />)}</div>
                <div className="flex gap-1 mt-1">{palette.slice(6).map((c, i) => <button key={`s${i}`} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c.hex }} onClick={() => setInput(c.hex)} title={c.hex} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Analogous</p>
                <div className="flex gap-1">{analogous.map((c, i) => <button key={i} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Complementary</p>
                <div className="flex gap-1">{complementary.map((c, i) => <button key={i} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Triadic</p>
                <div className="flex gap-1">{triadic.map((c, i) => <button key={i} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Tetradic</p>
                <div className="flex gap-1">{tetradic.map((c, i) => <button key={i} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Monochromatic</p>
                <div className="flex gap-1">{monochromatic.map((c, i) => <button key={i} className="h-6 w-6 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Presets</p>
                <div className="flex flex-wrap gap-1">{presets.map((c, i) => <button key={i} className="h-5 w-5 rounded border border-surface-200 dark:border-dark-border cursor-pointer" style={{ backgroundColor: c }} onClick={() => setInput(c)} title={c} />)}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">WCAG Contrast Ratio Checker</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Foreground</label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={parseColor(fgInput) ? rgbToHex(parseColor(fgInput)!) : "#000000"} onChange={(e) => setFgInput(e.target.value)} className="h-7 w-7 rounded border border-surface-200 cursor-pointer" />
                  <input type="text" value={fgInput} onChange={(e) => setFgInput(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Background</label>
                <div className="flex gap-1 items-center">
                  <input type="color" value={parseColor(bgInput) ? rgbToHex(parseColor(bgInput)!) : "#ffffff"} onChange={(e) => setBgInput(e.target.value)} className="h-7 w-7 rounded border border-surface-200 cursor-pointer" />
                  <input type="text" value={bgInput} onChange={(e) => setBgInput(e.target.value)} className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                </div>
              </div>
            </div>
            {contrast !== null && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-mono text-surface-700 dark:text-dark-text">Ratio: {contrast.toFixed(2)}:1</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${contrast >= 7 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : contrast >= 4.5 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : contrast >= 3 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
                  {contrast >= 7 ? "AAA Pass" : contrast >= 4.5 ? "AA Normal Pass" : contrast >= 3 ? "AA Large Pass" : "Fail"}
                </span>
                <span className="text-xs text-surface-400 dark:text-dark-muted">
                  {contrast >= 7 ? "AAA (7:1)" : contrast >= 4.5 ? "AA Normal (4.5:1)" : contrast >= 3 ? "AA Large (3:1)" : "Below WCAG AA"}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
