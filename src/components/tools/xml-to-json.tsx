"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type AttrHandling = "ignore" | "prefix" | "group";
type TextHandling = "text-key" | "direct";
type ArrayMode = "auto" | "force-single" | "force-all";
type NamespaceMode = "strip" | "prefix" | "include";
type FormatPreset = "standard" | "compact" | "verbose" | "minimal";

interface ParseOpts {
  attrHandling: AttrHandling;
  textHandling: TextHandling;
  arrayMode: ArrayMode;
  forceArrayElements: string[];
  detectNumbers: boolean;
  detectBooleans: boolean;
  flatten: boolean;
  preserveComments: boolean;
  namespaceMode: NamespaceMode;
  preserveOrder: boolean;
  preserveCdata: boolean;
}

function parseXmlNode(node: Element, opts: ParseOpts, comments: string[]): unknown {
  const result: Record<string, unknown> = {};
  const attrs = Array.from(node.attributes);

  if (opts.attrHandling === "ignore") {
  } else if (opts.attrHandling === "prefix") {
    for (const attr of attrs) {
      let val: unknown = attr.value;
      if (opts.detectNumbers && /^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
      else if (opts.detectBooleans && val === "true") val = true;
      else if (opts.detectBooleans && val === "false") val = false;
      result[`@${attr.name}`] = val;
    }
  } else {
    const group: Record<string, unknown> = {};
    for (const attr of attrs) {
      let val: unknown = attr.value;
      if (opts.detectNumbers && /^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
      else if (opts.detectBooleans && val === "true") val = true;
      else if (opts.detectBooleans && val === "false") val = false;
      group[attr.name] = val;
    }
    if (Object.keys(group).length > 0) result["$"] = group;
  }

  const childNodes = Array.from(node.childNodes);
  const textNodes = childNodes.filter((n) => n.nodeType === Node.TEXT_NODE);
  const cdataNodes = childNodes.filter((n) => n.nodeType === Node.CDATA_SECTION_NODE);
  const elementNodes = childNodes.filter((n) => n.nodeType === Node.ELEMENT_NODE);
  const commentNodes = childNodes.filter((n) => n.nodeType === Node.COMMENT_NODE);
  const textContent = textNodes.map((n) => (n.textContent || "").trim()).join("").trim();
  const cdataContent = cdataNodes.map((n) => (n.textContent || "").trim()).join("").trim();
  const allText = textContent + cdataContent;

  if (opts.preserveComments && commentNodes.length > 0) {
    result["#comment"] = comments;
  }

  if (opts.preserveCdata && cdataContent) {
    result["#cdata"] = cdataContent;
  }

  if (elementNodes.length === 0 && allText) {
    let val: unknown = allText;
    if (!opts.preserveCdata && opts.detectNumbers && /^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
    else if (!opts.preserveCdata && opts.detectBooleans && val === "true") val = true;
    else if (!opts.preserveCdata && opts.detectBooleans && val === "false") val = false;
    if (opts.textHandling === "text-key") {
      result["#text"] = val;
    } else {
      return val;
    }
  } else if (elementNodes.length > 0) {
    const grouped: Record<string, unknown[]> = {};
    for (const el of elementNodes) {
      const name = opts.namespaceMode === "strip" ? el.nodeName.replace(/^[\w-]+:/, "") : opts.namespaceMode === "prefix" ? el.nodeName.replace(":", "_") : el.nodeName;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(parseXmlNode(el as Element, opts, comments));
    }
    for (const [name, items] of Object.entries(grouped)) {
      const doForce = opts.arrayMode === "force-all" || (opts.arrayMode === "force-single" && items.length === 1) || opts.forceArrayElements.includes(name);
      const shouldBeArray = opts.arrayMode === "auto" ? items.length > 1 : doForce;
      if (opts.flatten && items.length === 1 && Object.keys(items[0] as Record<string, unknown>).length === 0) {
        result[name] = {};
      } else {
        result[name] = shouldBeArray ? items : items[0];
      }
    }
    if (allText && !opts.preserveCdata) {
      let val: unknown = allText;
      if (opts.detectNumbers && /^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
      else if (opts.detectBooleans && val === "true") val = true;
      else if (opts.detectBooleans && val === "false") val = false;
      if (opts.textHandling === "text-key") {
        result["#text"] = val;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function XmlToJson() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [attrHandling, setAttrHandling] = useState<AttrHandling>("prefix");
  const [textHandling, setTextHandling] = useState<TextHandling>("text-key");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("auto");
  const [forceArrayInput, setForceArrayInput] = useState("");
  const [detectNumbers, setDetectNumbers] = useState(true);
  const [detectBooleans, setDetectBooleans] = useState(true);
  const [flatten, setFlatten] = useState(false);
  const [preserveComments, setPreserveComments] = useState(false);
  const [namespaceMode, setNamespaceMode] = useState<NamespaceMode>("strip");
  const [preserveOrder, setPreserveOrder] = useState(false);
  const [preserveCdata, setPreserveCdata] = useState(false);
  const [formatPreset, setFormatPreset] = useState<FormatPreset>("standard");
  const [customIndent, setCustomIndent] = useState(2);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleFormatPresetChange = (preset: FormatPreset) => {
    setFormatPreset(preset);
    switch (preset) {
      case "standard": setCustomIndent(2); break;
      case "compact": setCustomIndent(0); break;
      case "verbose": setCustomIndent(4); break;
      case "minimal": setCustomIndent(0); break;
    }
  };

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/xml");
      const parseErrors = doc.querySelectorAll("parsererror");
      if (parseErrors.length > 0) throw new Error("Invalid XML at line " + (parseErrors[0]?.textContent?.match(/line\s+(\d+)/)?.[1] || "unknown") + ": " + (parseErrors[0]?.textContent || ""));
      const comments: string[] = [];
      if (preserveComments) {
        const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT, null);
        let node;
        while (node = walker.nextNode()) comments.push(node.textContent || "");
      }
      const result = parseXmlNode(doc.documentElement, {
        attrHandling, textHandling, arrayMode,
        forceArrayElements: forceArrayInput.split(",").map((s) => s.trim()).filter(Boolean),
        detectNumbers, detectBooleans, flatten, preserveComments, namespaceMode, preserveOrder, preserveCdata,
      }, comments);
      setOutput(JSON.stringify(result, null, customIndent || undefined));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, attrHandling, textHandling, arrayMode, forceArrayInput, detectNumbers, detectBooleans, flatten, preserveComments, namespaceMode, preserveOrder, preserveCdata, customIndent]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">XML Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<root><item>value</item></root>" rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Preset:</label>
          <select value={formatPreset} onChange={(e) => handleFormatPresetChange(e.target.value as FormatPreset)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="standard">Standard (2-space)</option>
            <option value="compact">Compact (minified)</option>
            <option value="verbose">Verbose (4-space)</option>
            <option value="minimal">Minimal (flat)</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Attributes:</label>
          <select value={attrHandling} onChange={(e) => setAttrHandling(e.target.value as AttrHandling)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="prefix">Prefix with @</option>
            <option value="group">Group under $</option>
            <option value="ignore">Ignore</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Text:</label>
          <select value={textHandling} onChange={(e) => setTextHandling(e.target.value as TextHandling)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="text-key">#text key</option>
            <option value="direct">Direct property</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Namespaces:</label>
          <select value={namespaceMode} onChange={(e) => setNamespaceMode(e.target.value as NamespaceMode)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="strip">Strip</option>
            <option value="prefix">Prefix with _</option>
            <option value="include">Include as-is</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Arrays:</label>
          <select value={arrayMode} onChange={(e) => setArrayMode(e.target.value as ArrayMode)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="auto">Auto-detect</option>
            <option value="force-single">Force single items</option>
            <option value="force-all">Force all arrays</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Force array elements:</label>
          <input value={forceArrayInput} onChange={(e) => setForceArrayInput(e.target.value)} placeholder="item,entry" className="w-28 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={detectNumbers} onChange={(e) => setDetectNumbers(e.target.checked)} className="rounded border-surface-300" /> Detect numbers
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={detectBooleans} onChange={(e) => setDetectBooleans(e.target.checked)} className="rounded border-surface-300" /> Detect booleans
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} className="rounded border-surface-300" /> Flatten empty elements
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={preserveComments} onChange={(e) => setPreserveComments(e.target.checked)} className="rounded border-surface-300" /> Preserve comments
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={preserveCdata} onChange={(e) => setPreserveCdata(e.target.checked)} className="rounded border-surface-300" /> Preserve CDATA sections
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={preserveOrder} onChange={(e) => setPreserveOrder(e.target.checked)} className="rounded border-surface-300" /> Preserve element order
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors" aria-label="Copy JSON">Copy JSON</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download JSON">Download JSON</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
