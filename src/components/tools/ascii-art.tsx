"use client";

import { useState, useRef, useMemo } from "react";
import { sanitize } from "@/lib/sanitize";

type FigletFont = "standard" | "big" | "small" | "doom" | "thick" | "bubble" | "block" | "digital" | "script" | "shadow" | "slant" | "speed" | "banner" | "doh" | "isometric1" | "isometric2" | "isometric3" | "dots" | "avatar" | "pagga" | "smscript";

type FontCategory = "standard" | "block" | "decorative" | "script" | "small";

type LayoutMode = "default" | "full" | "fitted" | "smushing";

const FONT_CATEGORIES: { label: string; id: FontCategory; fonts: FigletFont[] }[] = [
  { label: "Standard", id: "standard", fonts: ["standard", "thick", "shadow", "slant"] },
  { label: "Block", id: "block", fonts: ["block", "banner", "avatar", "pagga"] },
  { label: "Decorative", id: "decorative", fonts: ["big", "doom", "bubble", "digital", "doh", "isometric1", "isometric2", "isometric3", "dots"] },
  { label: "Script", id: "script", fonts: ["script", "smscript"] },
  { label: "Small", id: "small", fonts: ["speed", "small"] },
];

const FONT_MAP: Record<string, Record<string, string[]>> = {
  standard: {
    A: ["  #  ", " # # ", "#   #", "#####", "#   #"],
    B: ["#### ", "#   #", "#### ", "#   #", "#### "],
    C: [" ####", "#    ", "#    ", "#    ", " ####"],
    D: ["#### ", "#   #", "#   #", "#   #", "#### "],
    E: ["#####", "#    ", "#####", "#    ", "#####"],
    F: ["#####", "#    ", "#####", "#    ", "#    "],
    G: [" ####", "#    ", "#  ##", "#   #", " ####"],
    H: ["#   #", "#   #", "#####", "#   #", "#   #"],
    I: ["#####", "  #  ", "  #  ", "  #  ", "#####"],
    J: ["#####", "  #  ", "  #  ", "# #  ", " ##  "],
    K: ["#   #", "#  # ", "###  ", "#  # ", "#   #"],
    L: ["#    ", "#    ", "#    ", "#    ", "#####"],
    M: ["#   #", "## ##", "# # #", "#   #", "#   #"],
    N: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
    O: [" ### ", "#   #", "#   #", "#   #", " ### "],
    P: ["#### ", "#   #", "#### ", "#    ", "#    "],
    Q: [" ### ", "#   #", "#   #", "#  ##", " ### "],
    R: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
    S: [" ####", "#    ", " ### ", "    #", "#### "],
    T: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
    U: ["#   #", "#   #", "#   #", "#   #", " ### "],
    V: ["#   #", "#   #", "#   #", " # # ", "  #  "],
    W: ["#   #", "#   #", "# # #", "## ##", "#   #"],
    X: ["#   #", " # # ", "  #  ", " # # ", "#   #"],
    Y: ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
    Z: ["#####", "   # ", "  #  ", " #   ", "#####"],
    "0": [" ### ", "#   #", "#   #", "#   #", " ### "],
    "1": ["  #  ", " ##  ", "  #  ", "  #  ", "#####"],
    "2": [" ### ", "#   #", "   # ", "  #  ", "#####"],
    "3": [" ### ", "#   #", "  ## ", "#   #", " ### "],
    "4": ["#   #", "#   #", "#####", "    #", "    #"],
    "5": ["#####", "#    ", "#### ", "    #", "#### "],
    "6": [" ####", "#    ", "#### ", "#   #", " ### "],
    "7": ["#####", "    #", "   # ", "  #  ", " #   "],
    "8": [" ### ", "#   #", " ### ", "#   #", " ### "],
    "9": [" ### ", "#   #", " ####", "    #", " ### "],
    "?": [" ### ", "#   #", "  ## ", "     ", "  #  "],
    "!": ["  #  ", "  #  ", "  #  ", "     ", "  #  "],
    ".": ["    ", "    ", "    ", "    ", "  # "],
    ",": ["    ", "    ", "    ", "  # ", " #  "],
    " ": ["     ", "     ", "     ", "     ", "     "],
  },
};

const STYLE_VARIANTS: Record<string, { width: number; height: number; chars: string }> = {
  standard: { width: 5, height: 5, chars: "#" },
  big: { width: 7, height: 7, chars: "#" },
  small: { width: 4, height: 3, chars: "#" },
  doom: { width: 6, height: 6, chars: "@" },
  thick: { width: 7, height: 7, chars: "@" },
  bubble: { width: 5, height: 5, chars: "O" },
  block: { width: 5, height: 5, chars: "#" },
  digital: { width: 3, height: 5, chars: "#" },
  script: { width: 6, height: 5, chars: "*" },
  shadow: { width: 5, height: 5, chars: "#" },
  slant: { width: 6, height: 5, chars: "#" },
  speed: { width: 4, height: 4, chars: "#" },
  banner: { width: 5, height: 5, chars: "#" },
  doh: { width: 6, height: 6, chars: "O" },
  isometric1: { width: 7, height: 5, chars: "#" },
  isometric2: { width: 7, height: 5, chars: "@" },
  isometric3: { width: 7, height: 5, chars: "X" },
  dots: { width: 3, height: 5, chars: "." },
  avatar: { width: 5, height: 5, chars: "#" },
  pagga: { width: 5, height: 5, chars: "#" },
  smscript: { width: 4, height: 4, chars: "o" },
};

const BIG_FONT: Record<string, string[]> = {
  A: ["   ##   ", "  #  #  ", " #    # ", "#      #", "########", "#      #", "#      #"],
  B: ["####### ", "#      #", "#      #", "####### ", "#      #", "#      #", "####### "],
  C: [" ###### ", "#      #", "#       ", "#       ", "#       ", "#      #", " ###### "],
  D: ["####### ", "#      #", "#      #", "#      #", "#      #", "#      #", "####### "],
  E: ["########", "#       ", "#       ", "####### ", "#       ", "#       ", "########"],
  F: ["########", "#       ", "#       ", "####### ", "#       ", "#       ", "#       "],
  G: [" ###### ", "#      #", "#       ", "#   ####", "#      #", "#      #", " ###### "],
  H: ["#      #", "#      #", "#      #", "########", "#      #", "#      #", "#      #"],
  I: ["########", "   ##   ", "   ##   ", "   ##   ", "   ##   ", "   ##   ", "########"],
  J: ["########", "    #   ", "    #   ", "    #   ", "    #   ", "#   #   ", " ###    "],
  K: ["#      #", "#     # ", "#    #  ", "####    ", "#    #  ", "#     # ", "#      #"],
  L: ["#       ", "#       ", "#       ", "#       ", "#       ", "#       ", "########"],
  M: ["#      #", "##    ##", "##    ##", "# #  # #", "#  ##  #", "#      #", "#      #"],
  N: ["#      #", "##     #", "##     #", "# #    #", "#  #   #", "#   #  #", "#    ## #"],
  O: ["  ####  ", " #    # ", "#      #", "#      #", "#      #", " #    # ", "  ####  "],
  P: ["####### ", "#      #", "#      #", "####### ", "#       ", "#       ", "#       "],
  Q: ["  ####  ", " #    # ", "#      #", "#      #", "#   #  #", " #  # # ", "  ### # "],
  R: ["####### ", "#      #", "#     # ", "#####   ", "#    #  ", "#     # ", "#      #"],
  S: [" ###### ", "#      #", "#       ", " #####  ", "      # ", "#      #", " ###### "],
  T: ["########", "   ##   ", "   ##   ", "   ##   ", "   ##   ", "   ##   ", "   ##   "],
  U: ["#      #", "#      #", "#      #", "#      #", "#      #", "#      #", " ###### "],
  V: ["#      #", "#      #", "#      #", "#      #", " #    # ", "  #  #  ", "   ##   "],
  W: ["#      #", "#      #", "#  ##  #", "# #  # #", "##    ##", "##    ##", "#      #"],
  X: ["#      #", " #    # ", "  #  #  ", "   ##   ", "  #  #  ", " #    # ", "#      #"],
  Y: ["#      #", " #    # ", "  #  #  ", "   ##   ", "   ##   ", "   ##   ", "   ##   "],
  Z: ["########", "      # ", "     #  ", "    #   ", "   #    ", "  #     ", "########"],
};

const SMALL_FONT: Record<string, string[]> = {
  A: [" # ", "# #", "###"],
  B: ["## ", "# #", "## "],
  C: [" ##", "#  ", " ##"],
  D: ["## ", "# #", "## "],
  E: ["###", "## ", "###"],
  F: ["###", "## ", "#  "],
  G: [" ##", "# #", " ##"],
  H: ["# #", "###", "# #"],
  I: [" # ", " # ", " # "],
  J: ["  #", "  #", "## "],
  K: ["# #", "## ", "# #"],
  L: ["#  ", "#  ", "###"],
  M: ["# #", "###", "# #"],
  N: ["# #", "###", "# #"],
  O: [" # ", "# #", " # "],
  P: ["## ", "# #", "#  "],
  Q: [" # ", "# #", " ##"],
  R: ["## ", "# #", "# #"],
  S: [" ##", " # ", "## "],
  T: ["###", " # ", " # "],
  U: ["# #", "# #", "###"],
  V: ["# #", "# #", " # "],
  W: ["# #", "###", "# #"],
  X: ["# #", " # ", "# #"],
  Y: ["# #", " # ", " # "],
  Z: ["###", " # ", "###"],
};

const DOOM_FONT: Record<string, string[]> = {
  A: ["  @@  ", " @  @ ", "@    @", "@    @", "@@@@@@", "@    @", "@    @"],
  B: ["@@@@@ ", "@    @", "@    @", "@@@@@ ", "@    @", "@    @", "@@@@@ "],
  C: [" @@@@ ", "@    @", "@     ", "@     ", "@     ", "@    @", " @@@@ "],
  D: ["@@@@@ ", "@    @", "@    @", "@    @", "@    @", "@    @", "@@@@@ "],
  E: ["@@@@@@", "@     ", "@     ", "@@@@@ ", "@     ", "@     ", "@@@@@@"],
  F: ["@@@@@@", "@     ", "@     ", "@@@@@ ", "@     ", "@     ", "@     "],
  G: [" @@@@ ", "@    @", "@     ", "@  @@@", "@    @", "@    @", " @@@@ "],
  H: ["@    @", "@    @", "@    @", "@@@@@@", "@    @", "@    @", "@    @"],
  I: ["@@@@@@", "  @@  ", "  @@  ", "  @@  ", "  @@  ", "  @@  ", "@@@@@@"],
  J: ["@@@@@@", "   @  ", "   @  ", "   @  ", "   @  ", "@  @  ", " @@   "],
  K: ["@    @", "@   @ ", "@  @  ", "@@@   ", "@  @  ", "@   @ ", "@    @"],
  L: ["@     ", "@     ", "@     ", "@     ", "@     ", "@     ", "@@@@@@"],
  M: ["@    @", "@@  @@", "@@  @@", "@ @@ @", "@    @", "@    @", "@    @"],
  N: ["@    @", "@@   @", "@@   @", "@ @  @", "@  @ @", "@   @@", "@    @"],
  O: [" @@@@ ", "@    @", "@    @", "@    @", "@    @", "@    @", " @@@@ "],
  P: ["@@@@@ ", "@    @", "@    @", "@@@@@ ", "@     ", "@     ", "@     "],
  Q: [" @@@@ ", "@    @", "@    @", "@    @", "@  @ @", "@   @@", " @@@@ "],
  R: ["@@@@@ ", "@    @", "@    @", "@@@@@ ", "@   @ ", "@    @", "@    @"],
  S: [" @@@@ ", "@    @", "@     ", " @@@  ", "    @ ", "@    @", " @@@@ "],
  T: ["@@@@@@", "  @@  ", "  @@  ", "  @@  ", "  @@  ", "  @@  ", "  @@  "],
  U: ["@    @", "@    @", "@    @", "@    @", "@    @", "@    @", " @@@@ "],
  V: ["@    @", "@    @", "@    @", "@    @", " @  @ ", "  @@  ", "  @@  "],
  W: ["@    @", "@    @", "@  @@ @", "@ @  @", "@@    @", "@@    @", "@    @"],
  X: ["@    @", " @  @ ", "  @@  ", "  @@  ", "  @@  ", " @  @ ", "@    @"],
  Y: ["@    @", " @  @ ", "  @@  ", "  @@  ", "  @@  ", "  @@  ", "  @@  "],
  Z: ["@@@@@@", "    @ ", "   @  ", "  @   ", " @    ", "@     ", "@@@@@@"],
};

function renderFigletish(
  text: string,
  font: FigletFont,
  widthMax: number,
  letterSpacing: number,
  charSet: string,
  layout: LayoutMode,
): string {
  const style = STYLE_VARIANTS[font] || STYLE_VARIANTS.standard;
  let fontData = FONT_MAP.standard;
  if (font === "big") fontData = BIG_FONT;
  else if (font === "small") fontData = SMALL_FONT;
  else if (font === "doom") fontData = DOOM_FONT;
  const h = style.height;
  const lines: string[] = Array(h).fill("");
  const ch = charSet || style.chars;
  let spacing = letterSpacing;
  if (layout === "fitted") spacing = 0;
  else if (layout === "smushing") spacing = -1;
  else if (layout === "full") spacing = Math.max(2, letterSpacing);
  for (const rawChar of text.toUpperCase()) {
    const art = fontData[rawChar] || fontData["?"] || Array(h).fill("     ");
    for (let row = 0; row < h; row++) {
      const artRow = art[row] || "";
      let replaced = artRow.replace(/[#@OX\*\.o]/g, (m) => {
        if (m === " ") return " ";
        return ch.length > 0 ? ch[0] : m;
      });
      if (layout === "smushing") {
        replaced = replaced.replace(/./g, (c) => c === " " ? "" : c);
      }
      if (widthMax > 0 && replaced.length > widthMax) {
        replaced = replaced.slice(0, widthMax);
      }
      const gap = spacing > 0 ? " ".repeat(spacing) : (spacing < 0 ? "" : " ");
      lines[row] += replaced + gap;
    }
  }
  return lines.join("\n");
}

const ANSI_COLORS: Record<string, string> = {
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m",
  magenta: "\x1b[35m", cyan: "\x1b[36m", white: "\x1b[37m", reset: "\x1b[0m",
};

const HTML_COLORS: Record<string, string> = {
  red: "#ef4444", green: "#22c55e", yellow: "#eab308", blue: "#3b82f6",
  magenta: "#d946ef", cyan: "#06b6d4", white: "#ffffff",
};

export function AsciiArt() {
  const [input, setInput] = useState("");
  const [font, setFont] = useState<FigletFont>("standard");
  const [widthAdj, setWidthAdj] = useState(1);
  const [widthMax, setWidthMax] = useState(0);
  const [charSet, setCharSet] = useState("#");
  const [color, setColor] = useState("none");
  const [bgStyle, setBgStyle] = useState<"transparent" | "filled">("transparent");
  const [reverseVideo, setReverseVideo] = useState(false);
  const [slogan, setSlogan] = useState("");
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [layout, setLayout] = useState<LayoutMode>("default");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const { output, lineCount, charCount } = useMemo(() => {
    if (!input.trim()) return { output: "", lineCount: 0, charCount: 0 };
    let art = renderFigletish(input, font, widthMax, letterSpacing, charSet, layout);
    if (widthAdj !== 1) {
      const lines = art.split("\n");
      art = lines.map((l) => {
        const factor = widthAdj;
        if (factor <= 0.5) return l;
        return l.split("").map((c) => c + " ".repeat(Math.round(factor - 1))).join("");
      }).join("\n");
    }
    const lines = art.split("\n").filter(Boolean);
    if (flipH) {
      const maxLen = Math.max(...lines.map((l) => l.length));
      for (let i = 0; i < lines.length; i++) lines[i] = lines[i].padEnd(maxLen, " ").split("").reverse().join("");
    }
    if (flipV) lines.reverse();
    if (slogan.trim()) {
      const sl = slogan.trim();
      const maxLen = Math.max(...lines.map((l) => l.length));
      const pad = Math.max(0, Math.floor((maxLen - sl.length) / 2));
      lines.push(" ".repeat(pad) + sl);
    }
    let result = lines.join("\n");
    if (color !== "none" && bgStyle === "filled") {
      const bgChar = charSet || "#";
      const w = Math.max(...lines.map((l) => l.length));
      result = lines.map((l) => l.padEnd(w, bgChar)).join("\n");
    }
    if (reverseVideo) {
      result = result.split("").map((c) => c === " " ? "#" : " ").join("");
    }
    return { output: result, lineCount: lines.length, charCount: result.length };
  }, [input, font, widthAdj, widthMax, charSet, color, bgStyle, reverseVideo, slogan, flipH, flipV, letterSpacing, layout]);

  const copy = async () => {
    if (!output) return;
    if (color !== "none" && color !== "ansi") {
      await navigator.clipboard.writeText(output);
    } else if (color === "ansi") {
      const colored = output.split("\n").map((l) => `${ANSI_COLORS[color] || ""}${l}${ANSI_COLORS.reset}`).join("\n");
      await navigator.clipboard.writeText(colored);
    } else {
      await navigator.clipboard.writeText(output);
    }
    setCopied(true);
    setHistory((prev) => [output.slice(0, 200), ...prev].slice(0, 20));
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ascii-art.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const coloredHtml = useMemo(() => {
    if (color === "none" || color === "ansi") return output;
    const c = HTML_COLORS[color] || "#ffffff";
    return output.split("\n").map((l) => `<span style="color:${c}">${l.replace(/</g, "&lt;")}</span>`).join("\n");
  }, [output, color]);

  const fontCategories = FONT_CATEGORIES;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Text</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to convert to ASCII art..."
          rows={2}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Font</label>
          <select value={font} onChange={(e) => setFont(e.target.value as FigletFont)}
            className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {fontCategories.map((cat) => (
              <optgroup key={cat.id} label={cat.label}>
                {cat.fonts.map((f) => (<option key={f} value={f}>{f}</option>))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Width Adj</label>
          <input type="range" min={0.5} max={3} step={0.25} value={widthAdj}
            onChange={(e) => setWidthAdj(parseFloat(e.target.value))}
            className="w-full accent-brand-500" />
          <span className="text-xs text-surface-500 dark:text-dark-muted">{widthAdj}x</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Max Width</label>
          <input type="number" min={0} max={500} value={widthMax}
            onChange={(e) => setWidthMax(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Char</label>
          <input type="text" value={charSet} onChange={(e) => setCharSet(e.target.value.slice(0, 1) || "#")}
            className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-center font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Color</label>
          <select value={color} onChange={(e) => setColor(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="none">None</option>
            <option value="ansi">ANSI</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="blue">Blue</option>
            <option value="magenta">Magenta</option>
            <option value="cyan">Cyan</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Letter Spacing</label>
          <input type="range" min={0} max={6} value={letterSpacing}
            onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
            className="w-full accent-brand-500" />
          <span className="text-xs text-surface-500 dark:text-dark-muted">{letterSpacing}</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Layout</label>
          <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutMode)}
            className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="default">Default</option>
            <option value="full">Full</option>
            <option value="fitted">Fitted</option>
            <option value="smushing">Smushing</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={reverseVideo} onChange={(e) => setReverseVideo(e.target.checked)} className="accent-brand-500" />
          Reverse video
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} className="accent-brand-500" />
          Flip H
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} className="accent-brand-500" />
          Flip V
        </label>
        <select value={bgStyle} onChange={(e) => setBgStyle(e.target.value as "transparent" | "filled")}
          className="rounded-lg border border-surface-200 bg-white p-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="transparent">Transparent</option>
          <option value="filled">Filled</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">Slogan/Subtitle</label>
        <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Optional subtitle line..."
          className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white opacity-80">Live</span>
        {output && (
          <>
            <button onClick={copy} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={download} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">.txt</button>
          </>
        )}
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">ASCII Art</label>
            <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
              <span><strong>{lineCount}</strong> lines</span>
              <span><strong>{charCount}</strong> chars</span>
            </div>
          </div>
          <div className="rounded-lg border border-surface-200 bg-black p-4 dark:border-dark-border overflow-auto max-h-96">
            {color !== "none" && color !== "ansi" ? (
              <pre ref={preRef} className="text-sm leading-tight font-mono whitespace-pre"
                style={{ color: HTML_COLORS[color], backgroundColor: bgStyle === "filled" ? "#000" : "transparent" }}
                dangerouslySetInnerHTML={{ __html: sanitize(coloredHtml) }} />
            ) : (
              <pre ref={preRef} className="text-sm leading-tight font-mono text-green-400 whitespace-pre"
                style={{ backgroundColor: bgStyle === "filled" ? "#000" : "transparent" }}>{output}</pre>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">History</p>
          <div className="max-h-20 overflow-y-auto space-y-1">
              {history.map((h, i) => (
              <div key={i}
                className="w-full text-left rounded border border-surface-100 bg-white px-2 py-1 text-xs text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text truncate">
                {h.split("\n")[0]?.slice(0, 60) || "(empty)"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
