"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { sanitize } from "@/lib/sanitize";

interface OptimizeOptions {
  removeXmlDecl: boolean;
  removeComments: boolean;
  removeEmptyElements: boolean;
  removeUnusedDefs: boolean;
  collapseGroups: boolean;
  mergePaths: boolean;
  convertShapes: boolean;
  precision: number;
  minify: boolean;
  removeMetadata: boolean;
  applyTransforms: boolean;
  convertColors: boolean;
  minifyStyles: boolean;
}

const ATTRS_TO_REMOVE = [
  "xmlns:xmlns",
  "xmlns:svg",
  "xml:space",
  "version",
  "enable-background",
  "sodipodi:docname",
  "inkscape:version",
  "inkscape:export-filename",
  "inkscape:export-xdpi",
  "inkscape:export-ydpi",
  "figma:",
  "sketch:",
  "data-name",
  "data-*",
];

function optimizeSVG(input: string, opts: OptimizeOptions): string {
  let svg = input;

  if (opts.removeXmlDecl) {
    svg = svg.replace(/<\?xml[^>]*\?>/gi, "");
    svg = svg.replace(/<!DOCTYPE[^>]*>/gi, "");
  }

  if (opts.removeComments) {
    svg = svg.replace(/<!--[\s\S]*?-->/g, "");
  }

  if (opts.removeMetadata) {
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    svg = svg.replace(/<sodipodi:namedview[^>]*\/?>/gi, "");
    svg = svg.replace(/<cc:Work[\s\S]*?<\/cc:Work>/gi, "");
    svg = svg.replace(/<dc:[a-z]+[\s\S]*?<\/dc:[a-z]+>/gi, "");
    svg = svg.replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, "");
    svg = svg.replace(/ inkscape:[\w-]+="[^"]*"/gi, "");
    svg = svg.replace(/ sodipodi:[\w-]+="[^"]*"/gi, "");
    svg = svg.replace(/ figma:[\w-]+="[^"]*"/gi, "");
    svg = svg.replace(/ sketch:[\w-]+="[^"]*"/gi, "");
  }

  if (opts.removeEmptyElements) {
    svg = svg.replace(/<[a-z]+\b[^>]*>\s*<\/[a-z]+>/gi, (match) => {
      return match.match(/<(g|svg|defs|a|switch|mask|clipPath)[\s>]/i) ? match : "";
    });
    let prev = "";
    while (prev !== svg) {
      prev = svg;
      svg = svg.replace(/<g[^>]*>\s*<\/g>/gi, "");
      svg = svg.replace(/<defs[^>]*>\s*<\/defs>/gi, "");
    }
  }

  if (opts.removeUnusedDefs) {
    const defined = new Set<string>();
    const used = new Set<string>();
    const defRegex = /<[a-z]+[^>]*\bid="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = defRegex.exec(svg)) !== null) {
      defined.add(match[1]);
    }
    const urlRegex = /url\(#([^"]+)\)/g;
    while ((match = urlRegex.exec(svg)) !== null) {
      used.add(match[1]);
    }
    const hrefRegex = /href="#([^"]+)"/g;
    while ((match = hrefRegex.exec(svg)) !== null) {
      used.add(match[1]);
    }
    for (const id of defined) {
      if (!used.has(id)) {
        const idRegex = new RegExp(
          `<[^>]+\\bid="${id}"[^>]*>\\s*<\\/[^>]+>|<[^>]+\\bid="${id}"[^>]*\\/?>`,
          "gi"
        );
        svg = svg.replace(idRegex, "");
      }
    }
  }

  if (opts.collapseGroups) {
    let prev = "";
    while (prev !== svg) {
      prev = svg;
      svg = svg.replace(
        /<g[^>]*>\s*<g([^>]*)>([\s\S]*?)<\/g>\s*<\/g>/gi,
        (_, attrs, inner) => `<g${attrs}>${inner}</g>`
      );
      svg = svg.replace(
        /<g[^>]*>\s*<([a-z]+)([^>]*)>([\s\S]*?)<\/\1>\s*<\/g>/gi,
        (_, tag, attrs, inner) => `<${tag}${attrs}>${inner}</${tag}>`
      );
    }
    svg = svg.replace(/<g>\s*<\/g>/gi, "");
  }

  if (opts.mergePaths) {
    svg = svg.replace(
      /<path[^>]*\/>\s*<path([^>]*)>/gi,
      (_, attrs) => `<path${attrs}>`
    );
  }

  if (opts.convertShapes) {
    svg = svg
      .replace(/<rect\b[^>]*\/?>/gi, (m) => m.replace(/^<rect/, "<path"))
      .replace(/<circle\b[^>]*\/?>/gi, (m) => m.replace(/^<circle/, "<path"))
      .replace(/<ellipse\b[^>]*\/?>/gi, (m) => m.replace(/^<ellipse/, "<path"))
      .replace(/<line\b[^>]*\/?>/gi, (m) => m.replace(/^<line/, "<path"))
      .replace(/<polyline\b[^>]*\/?>/gi, (m) => m.replace(/^<polyline/, "<path"))
      .replace(/<polygon\b[^>]*\/?>/gi, (m) => m.replace(/^<polygon/, "<path"));
  }

  if (opts.convertColors) {
    svg = svg.replace(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g, "#$1$2$3");
    svg = svg.replace(/#([0-9a-fA-F]{6})\b/g, (m) => m.toLowerCase());
  }

  svg = svg.replace(
    /([\d.]+)/g,
    (num) => parseFloat(num).toFixed(opts.precision).replace(/\.?0+$/, "")
  );

  if (opts.applyTransforms) {
    svg = svg.replace(/ transform="[^"]*"/gi, "");
  }

  ATTRS_TO_REMOVE.forEach((attr) => {
    if (attr.endsWith("*")) {
      const prefix = attr.slice(0, -1);
      const regex = new RegExp(` ${prefix}[\\w-]*="[^"]*"`, "gi");
      svg = svg.replace(regex, "");
    } else {
      const regex = new RegExp(` ${attr}="[^"]*"`, "gi");
      svg = svg.replace(regex, "");
    }
  });

  if (opts.minifyStyles) {
    svg = svg.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
      const minified = css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim();
      return `<style>${minified}</style>`;
    });
  }

  if (opts.minify) {
    svg = svg
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .replace(/\s*([{;},:])\s*/g, "$1")
      .replace(/"\s+/g, "\" ")
      .replace(/\s+"/g, "\"");
  }

  svg = svg.trim();
  return svg;
}

function svgToJSX(svg: string): string {
  return svg
    .replace(/class=/g, "className=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/clip-path=/g, "clipPath=")
    .replace(/stop-color=/g, "stopColor=")
    .replace(/stop-opacity=/g, "stopOpacity=")
    .replace(/viewBox=/g, "viewBox=")
    .replace(/xmlns="[^"]*"/g, "")
    .replace(/<svg /g, '<svg {...props} ')
    .replace(/\s*\/>/g, " />");
}

function svgToDataURI(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const DEFAULT_OPTS: OptimizeOptions = {
  removeXmlDecl: true,
  removeComments: true,
  removeEmptyElements: true,
  removeUnusedDefs: true,
  collapseGroups: true,
  mergePaths: false,
  convertShapes: false,
  precision: 3,
  minify: true,
  removeMetadata: true,
  applyTransforms: false,
  convertColors: false,
  minifyStyles: false,
};

export function SvgOptimizer() {
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<OptimizeOptions>(DEFAULT_OPTS);
  const [showReadable, setShowReadable] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const optimized = optimizeSVG(input, opts);
      const inputBytes = new TextEncoder().encode(input).length;
      const outputBytes = new TextEncoder().encode(optimized).length;
      const savings = inputBytes - outputBytes;
      const percent = inputBytes > 0 ? Math.round((savings / inputBytes) * 100) : 0;
      return { output: optimized, inputBytes, outputBytes, savings, percent };
    } catch {
      return null;
    }
  }, [input, opts]);

  const error = useMemo(() => {
    if (input.trim() && !result) return "Failed to optimize SVG. Check the input syntax.";
    return "";
  }, [input, result]);

  const displayOutput = useMemo(() => {
    if (!result) return "";
    if (showReadable) {
      const indent = 2;
      let formatted = "";
      let depth = 0;
      for (const ch of result.output) {
        if (ch === "<") {
          formatted += "\n" + " ".repeat(depth * indent);
        } else if (ch === ">" && result.output[result.output.indexOf(ch) + 1] === "<") {
          formatted += ">\n";
        } else {
          formatted += ch;
        }
        if (ch === ">") {
          const tag = result.output.slice(
            Math.max(0, result.output.lastIndexOf("<", result.output.indexOf(ch))),
            result.output.indexOf(ch) + 1
          );
          if (tag.startsWith("</")) depth--;
          if (tag.startsWith("<") && !tag.startsWith("</") && !tag.endsWith("/>")) depth++;
        }
      }
      return formatted.trim();
    }
    return result.output;
  }, [result, showReadable]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string || "");
    };
    reader.readAsText(file);
  }, []);

  const handleCopyOutput = useCallback(async () => {
    if (result) await navigator.clipboard.writeText(result.output);
  }, [result]);

  const handleCopyJSX = useCallback(async () => {
    if (result) {
      const jsx = svgToJSX(result.output);
      await navigator.clipboard.writeText(jsx);
    }
  }, [result]);

  const handleCopyDataURI = useCallback(async () => {
    if (result) {
      const uri = svgToDataURI(result.output);
      await navigator.clipboard.writeText(uri);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "optimized.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const clear = useCallback(() => {
    setInput("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleOptionChange = useCallback(
    <K extends keyof OptimizeOptions>(key: K, value: OptimizeOptions[K]) => {
      setOpts((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const presets = [
    { label: "Web", opts: { ...DEFAULT_OPTS, minify: true, precision: 2 } },
    { label: "Readable", opts: { ...DEFAULT_OPTS, minify: false, precision: 3 } },
    { label: "Maximum", opts: { ...DEFAULT_OPTS, mergePaths: true, convertShapes: true, precision: 1, minify: true, applyTransforms: true, minifyStyles: true } },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your SVG code here..."
          rows={6}
          className="min-h-[120px] flex-1 rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePaste}
          className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Paste from Clipboard
        </button>
        <label className="cursor-pointer rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Upload .SVG File
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="hidden" />
        </label>
        <button
          onClick={clear}
          className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Clear
        </button>
      </div>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
          Optimization Options
        </summary>
        <div className="grid gap-3 border-t border-surface-200 p-3 sm:grid-cols-2 lg:grid-cols-3 dark:border-dark-border">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.removeXmlDecl}
                onChange={(e) => handleOptionChange("removeXmlDecl", e.target.checked)}
                className="accent-brand-500"
              />
              Remove XML Declaration / DOCTYPE
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.removeComments}
                onChange={(e) => handleOptionChange("removeComments", e.target.checked)}
                className="accent-brand-500"
              />
              Remove Comments
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.removeMetadata}
                onChange={(e) => handleOptionChange("removeMetadata", e.target.checked)}
                className="accent-brand-500"
              />
              Remove Metadata (viewBox, title, desc)
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.convertColors}
                onChange={(e) => handleOptionChange("convertColors", e.target.checked)}
                className="accent-brand-500"
              />
              Convert Colors (shorthand hex, lowercase)
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.removeEmptyElements}
                onChange={(e) => handleOptionChange("removeEmptyElements", e.target.checked)}
                className="accent-brand-500"
              />
              Remove Empty Elements
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.removeUnusedDefs}
                onChange={(e) => handleOptionChange("removeUnusedDefs", e.target.checked)}
                className="accent-brand-500"
              />
              Remove Unused Defs
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.collapseGroups}
                onChange={(e) => handleOptionChange("collapseGroups", e.target.checked)}
                className="accent-brand-500"
              />
              Collapse Groups
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.minifyStyles}
                onChange={(e) => handleOptionChange("minifyStyles", e.target.checked)}
                className="accent-brand-500"
              />
              Minify Styles
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.mergePaths}
                onChange={(e) => handleOptionChange("mergePaths", e.target.checked)}
                className="accent-brand-500"
              />
              Merge Paths
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.convertShapes}
                onChange={(e) => handleOptionChange("convertShapes", e.target.checked)}
                className="accent-brand-500"
              />
              Convert Shape to Path
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.applyTransforms}
                onChange={(e) => handleOptionChange("applyTransforms", e.target.checked)}
                className="accent-brand-500"
              />
              Remove Transforms
            </label>
            <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={opts.minify}
                onChange={(e) => handleOptionChange("minify", e.target.checked)}
                className="accent-brand-500"
              />
              Minify Output
            </label>
            <div>
              <label className="block text-xs text-surface-500 dark:text-dark-muted">
                Number Precision: {opts.precision}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={opts.precision}
                onChange={(e) => handleOptionChange("precision", parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        </div>
      </details>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
          Quick Presets
        </summary>
        <div className="flex flex-wrap gap-2 border-t border-surface-200 p-3 dark:border-dark-border">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setOpts(p.opts)}
              className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </details>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <span className="text-sm text-surface-600 dark:text-dark-muted">
              Original: <strong className="text-surface-900 dark:text-dark-text">{formatBytes(result.inputBytes)}</strong>
            </span>
            <span className="text-surface-300">→</span>
            <span className="text-sm text-surface-600 dark:text-dark-muted">
              Optimized: <strong className="text-surface-900 dark:text-dark-text">{formatBytes(result.outputBytes)}</strong>
            </span>
            <span className="text-sm text-surface-600 dark:text-dark-muted">
              Saved:{" "}
              <strong
                className={
                  result.percent > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-surface-500"
                }
              >
                {formatBytes(Math.abs(result.savings))} ({result.percent > 0 ? result.percent : 0}%)
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyOutput}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Copy Optimized
              </button>
              <button
                onClick={handleCopyJSX}
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                Copy as React Component
              </button>
              <button
                onClick={handleCopyDataURI}
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                Copy as Data URI
              </button>
              <button
                onClick={handleDownload}
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
              >
                Download SVG
              </button>
            </div>
            <label className="ml-auto flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text">
              <input
                type="checkbox"
                checked={showReadable}
                onChange={(e) => setShowReadable(e.target.checked)}
                className="accent-brand-500"
              />
              Readable Output
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Preview
              </label>
              <div
                dangerouslySetInnerHTML={{ __html: sanitize(result.output) }}
                className="flex items-center justify-center rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface"
                style={{ minHeight: 120, maxHeight: 240 }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-dark-muted">
                Optimized Output
              </label>
              <pre className="max-h-60 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                {displayOutput}
              </pre>
            </div>
          </div>
        </div>
      )}

      {!input.trim() && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 p-8 text-center dark:border-dark-border">
          <svg className="mb-2 h-10 w-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-sm text-surface-400 dark:text-dark-muted">
            Paste SVG code above or upload a .svg file to optimize
          </p>
        </div>
      )}
    </div>
  );
}
