"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";

type DataCategory = "people" | "companies" | "finance" | "internet" | "ids" | "dates" | "text" | "numbers";
type ExportFormat = "json" | "csv" | "tsv" | "text" | "html-table" | "sql";
type Locale = "en-US" | "en-GB" | "de-DE" | "fr-FR" | "es-ES" | "ja-JP";

interface FieldDef {
  id: string; label: string; category: DataCategory; enabled: boolean; generate: (seed?: number) => string;
}

const NAMES_EN = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Christopher","Karen"];
const NAMES_DE = ["Hans","Anna","Karl","Maria","Peter","Ursula","Thomas","Sabine","Wolfgang","Ingrid"];
const NAMES_FR = ["Jean","Marie","Pierre","Jeanne","Michel","Catherine","Philippe","Françoise","Nicolas","Anne"];
const NAMES_ES = ["José","María","Antonio","Carmen","Manuel","Isabel","Francisco","Dolores","Jesús","Ana"];
const NAMES_JP = ["Haruto","Sakura","Souta","Yui","Yuuki","Aoi","Ren","Hina","Hiroto","Rin"];
const SURNAMES_EN = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Martinez","Hernandez","Clark","Lewis","Walker","Hall","Allen","Young","King","Wright","Hill","Scott"];
const SURNAMES_DE = ["Schmidt","Müller","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Schäfer","Koch"];
const SURNAMES_FR = ["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau"];
const SURNAMES_ES = ["García","Rodríguez","Martínez","López","González","Hernández","Pérez","Sánchez","Ramírez","Cruz"];
const SURNAMES_JP = ["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato"];
const DOMAINS = ["gmail.com","outlook.com","yahoo.com","proton.me","example.com","mail.com","icloud.com"];
const CITIES_EN = ["New York","Los Angeles","Chicago","Houston","Phoenix","Seattle","Boston","Denver","Miami","Portland"];
const STREETS = ["Main St","Oak Ave","Elm Rd","Park Blvd","Broadway","Lake Dr","Hill St","Maple Ln","Cedar Ct","River Rd"];
const BS_WORDS = ["next-generation","synergistic","enterprise","cross-platform","scalable","innovative","disruptive","strategic","robust","dynamic"];
const CATCHPHRASES = ["Enhanced","Advanced","Integrated","Optimized","Universal","Streamlined","Automated","Intelligent","Seamless","Proactive"];
const DEPARTMENTS = ["Engineering","Marketing","Sales","HR","Finance","Legal","Operations","Design","Support","R&D"];
const COMPANY_SUFFIXES = ["Inc","Corp","LLC","Ltd","Group","Partners","Solutions","Technologies","Ventures","Industries"];
const CURRENCIES = ["USD","EUR","GBP","JPY","CHF","CAD","AUD","CNY","INR","BRL"];
const CC_PREFIXES = ["4","5","3","6","2"];

function nameSet(locale: Locale): [string[], string[]] {
  switch (locale) {
    case "de-DE": return [NAMES_DE, SURNAMES_DE];
    case "fr-FR": return [NAMES_FR, SURNAMES_FR];
    case "es-ES": return [NAMES_ES, SURNAMES_ES];
    case "ja-JP": return [NAMES_JP, SURNAMES_JP];
    default: return [NAMES_EN, SURNAMES_EN];
  }
}

type SeededRandom = { next: () => number; };

function makeSeed(s: number): SeededRandom {
  let seed = s;
  return { next: () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; } };
}

function randInt(min: number, max: number, r: SeededRandom): number {
  return Math.floor(r.next() * (max - min + 1)) + min;
}

function applyPrefixSuffix(val: string, prefix: string, suffix: string): string {
  return prefix + val + suffix;
}

function generateField(f: FieldDef, seed: number, prefix: string, suffix: string, numMin: number, numMax: number): string {
  let val = f.generate(seed);
  if ((f.category === "text" || f.id === "slug") && (prefix || suffix)) {
    val = applyPrefixSuffix(val, prefix, suffix);
  }
  if (f.category === "numbers") {
    if (f.id === "integer") {
      const r = makeSeed(seed);
      val = String(randInt(numMin, numMax, r));
    } else if (f.id === "float") {
      const r = makeSeed(seed);
      val = (numMin + r.next() * (numMax - numMin)).toFixed(4);
    } else if (f.id === "percentage") {
      const r = makeSeed(seed);
      val = (r.next() * (numMax - numMin) + numMin).toFixed(2) + "%";
    } else if (f.id === "price") {
      const r = makeSeed(seed);
      val = "$" + (r.next() * (numMax - numMin) + numMin).toFixed(2);
    }
  }
  return val;
}

const ALL_FIELDS: FieldDef[] = [
  { id: "name", label: "Full Name", category: "people", enabled: true, generate: (s) => { const r = makeSeed(s || Date.now()); const [ns, ss] = nameSet("en-US"); return `${ns[Math.floor(r.next() * ns.length)]} ${ss[Math.floor(r.next() * ss.length)]}`; } },
  { id: "email", label: "Email", category: "people", enabled: true, generate: (s) => { const r = makeSeed(s || Date.now()); const [ns, ss] = nameSet("en-US"); return `${ns[Math.floor(r.next() * ns.length)].toLowerCase()}.${ss[Math.floor(r.next() * ss.length)].toLowerCase()}@${DOMAINS[Math.floor(r.next() * DOMAINS.length)]}`; } },
  { id: "phone", label: "Phone", category: "people", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); const n = () => Math.floor(r.next() * 900 + 100); return `(${n()}) ${n()}-${Math.floor(r.next() * 9000 + 1000)}`; } },
  { id: "address", label: "Address", category: "people", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `${Math.floor(r.next() * 9900 + 100)} ${STREETS[Math.floor(r.next() * STREETS.length)]}, ${CITIES_EN[Math.floor(r.next() * CITIES_EN.length)]}`; } },
  { id: "dob", label: "Date of Birth", category: "people", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); const d = new Date(Date.now() - Math.floor(r.next() * 80 * 365 * 86400000) - 18 * 365 * 86400000); return d.toISOString().slice(0, 10); } },
  { id: "company", label: "Company Name", category: "companies", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `${CATCHPHRASES[Math.floor(r.next() * CATCHPHRASES.length)]} ${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]} ${COMPANY_SUFFIXES[Math.floor(r.next() * COMPANY_SUFFIXES.length)]}`; } },
  { id: "catchphrase", label: "Catchphrase", category: "companies", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `${CATCHPHRASES[Math.floor(r.next() * CATCHPHRASES.length)]} ${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]} ${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}`; } },
  { id: "department", label: "Department", category: "companies", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return DEPARTMENTS[Math.floor(r.next() * DEPARTMENTS.length)]; } },
  { id: "creditCard", label: "Credit Card", category: "finance", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); const prefix = CC_PREFIXES[Math.floor(r.next() * CC_PREFIXES.length)]; let cc = prefix; for (let i = 0; i < 15; i++) cc += Math.floor(r.next() * 10).toString(); return cc; } },
  { id: "iban", label: "IBAN", category: "finance", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); let iban = "DE"; for (let i = 0; i < 20; i++) iban += Math.floor(r.next() * 10).toString(); return iban; } },
  { id: "amount", label: "Amount", category: "finance", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return (r.next() * 99999.99).toFixed(2); } },
  { id: "currency", label: "Currency", category: "finance", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return CURRENCIES[Math.floor(r.next() * CURRENCIES.length)]; } },
  { id: "ip", label: "IP Address", category: "internet", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `${Math.floor(r.next() * 256)}.${Math.floor(r.next() * 256)}.${Math.floor(r.next() * 256)}.${Math.floor(r.next() * 256)}`; } },
  { id: "url", label: "URL", category: "internet", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `https://www.${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}.com/${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}`; } },
  { id: "userAgent", label: "User Agent", category: "internet", enabled: false, generate: () => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" },
  { id: "hashtag", label: "Hashtag", category: "internet", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `#${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}${CATCHPHRASES[Math.floor(r.next() * CATCHPHRASES.length)]}`; } },
  { id: "uuid", label: "UUIDv4", category: "ids", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); const h = () => Math.floor(r.next() * 16).toString(16); return `${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}-${h()}${h()}${h()}${h()}-4${h()}${h()}${h()}-${(8 + Math.floor(r.next() * 4)).toString(16)}${h()}${h()}${h()}-${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}${h()}`; } },
  { id: "nanoid", label: "NanoID", category: "ids", enabled: false, generate: () => { const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"; let id = ""; const b = new Uint32Array(21); crypto.getRandomValues(b); for (let i = 0; i < 21; i++) id += a[b[i] % a.length]; return id; } },
  { id: "serial", label: "Serial No", category: "ids", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `SN-${Math.floor(r.next() * 900000 + 100000)}`; } },
  { id: "pastDate", label: "Past Date", category: "dates", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return new Date(Date.now() - Math.floor(r.next() * 365 * 86400000 * 10)).toISOString().slice(0, 10); } },
  { id: "futureDate", label: "Future Date", category: "dates", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return new Date(Date.now() + Math.floor(r.next() * 365 * 86400000 * 5)).toISOString().slice(0, 10); } },
  { id: "timestamp", label: "Timestamp", category: "dates", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return new Date(Date.now() - Math.floor(r.next() * 365 * 86400000 * 10)).toISOString(); } },
  { id: "sentence", label: "Sentence", category: "text", enabled: false, generate: () => { const ws = ["lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod","tempor"]; return ws.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ") + "."; } },
  { id: "paragraph", label: "Paragraph", category: "text", enabled: false, generate: () => { return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."; } },
  { id: "slug", label: "Slug", category: "text", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return `${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}-${BS_WORDS[Math.floor(r.next() * BS_WORDS.length)]}-${Math.floor(r.next() * 1000)}`; } },
  { id: "integer", label: "Integer", category: "numbers", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return String(Math.floor(r.next() * 100000)); } },
  { id: "float", label: "Float", category: "numbers", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return (r.next() * 1000).toFixed(4); } },
  { id: "percentage", label: "Percentage", category: "numbers", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return (r.next() * 100).toFixed(2) + "%"; } },
  { id: "price", label: "Price", category: "numbers", enabled: false, generate: (s) => { const r = makeSeed(s || Date.now()); return "$" + (r.next() * 9999.99).toFixed(2); } },
];

const CATEGORY_LABELS: Record<DataCategory, string> = {
  people: "People", companies: "Companies", finance: "Finance", internet: "Internet",
  ids: "IDs", dates: "Dates", text: "Text", numbers: "Numbers",
};

export function RandomData() {
  const [category, setCategory] = useState<DataCategory>("people");
  const [seedInput, setSeedInput] = useState("");
  const [locale, setLocale] = useState<Locale>("en-US");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [output, setOutput] = useState("");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>(Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f.enabled])));
  const [copied, setCopied] = useState(false);
  const [textPrefix, setTextPrefix] = useState("");
  const [textSuffix, setTextSuffix] = useState("");
  const [numMin, setNumMin] = useState(0);
  const [numMax, setNumMax] = useState(100000);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFields = useMemo(() => ALL_FIELDS.filter((f) => f.category === category && checked[f.id]), [category, checked]);

  const generate = useCallback(() => {
    const fields = activeFields;
    if (fields.length === 0) { setOutput(""); return; }
    const useSeed = seedInput ? parseInt(seedInput, 10) || Date.now() : Date.now();
    const rows = Array.from({ length: count }, (_, i) => {
      const row: Record<string, string> = {};
      for (const f of fields) {
        row[f.id] = generateField(f, useSeed + i * 1000, textPrefix, textSuffix, numMin, numMax);
      }
      return row;
    });
    let result = "";
    const headers = fields.map((f) => f.label);
    switch (format) {
      case "json":
        result = JSON.stringify(rows, null, 2);
        break;
      case "csv": {
        const sep = ",";
        const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
        result = includeHeader ? headers.join(sep) + "\n" : "";
        result += rows.map((r) => fields.map((f) => esc(r[f.id])).join(sep)).join("\n");
        break;
      }
      case "tsv": {
        const esc = (v: string) => v.replace(/\t/g, " ");
        result = includeHeader ? headers.join("\t") + "\n" : "";
        result += rows.map((r) => fields.map((f) => esc(r[f.id])).join("\t")).join("\n");
        break;
      }
      case "html-table": {
        result = "<table>\n<thead>\n<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>\n</thead>\n<tbody>\n";
        result += rows.map((r) => "<tr>" + fields.map((f) => `<td>${r[f.id]}</td>`).join("") + "</tr>").join("\n");
        result += "\n</tbody>\n</table>";
        break;
      }
      case "sql": {
        const tableName = category;
        result = rows.map((r) => {
          const cols = fields.map((f) => f.label).join(", ");
          const vals = fields.map((f) => `'${r[f.id].replace(/'/g, "''")}'`).join(", ");
          return `INSERT INTO ${tableName} (${cols}) VALUES (${vals});`;
        }).join("\n");
        break;
      }
      default: {
        result = rows.map((r, i) => `Record ${i + 1}:\n` + fields.map((f) => `  ${f.label}: ${r[f.id]}`).join("\n")).join("\n\n");
      }
    }
    setOutput(result);
  }, [activeFields, count, format, includeHeader, category, seedInput, textPrefix, textSuffix, numMin, numMax]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { generate(); }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  const copy = async () => { if (output) { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  const exportFile = () => {
    const extMap: Record<ExportFormat, string> = { "json": "json", "csv": "csv", "tsv": "tsv", "html-table": "html", "sql": "sql", "text": "txt" };
    const mimeMap: Record<string, string> = { "json": "application/json", "csv": "text/csv", "tsv": "text/tab-separated-values", "html": "text/html", "sql": "text/plain", "txt": "text/plain" };
    const ext = extMap[format];
    const blob = new Blob([output], { type: mimeMap[ext] || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `random-data.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const preview = useMemo(() => {
    if (!output) return null;
    const lines = output.split("\n").slice(0, format === "json" ? 10 : 6);
    return lines.join("\n");
  }, [output, format]);

  const stats = useMemo(() => {
    if (!output) return null;
    const size = new Blob([output]).size;
    return { total: count, size, sizeStr: size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB` };
  }, [output, count]);

  const toggleCategory = (cat: DataCategory) => setCategory(cat);

  const toggleField = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as DataCategory[]).map((cat) => (
          <button key={cat} onClick={() => toggleCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-brand-500 text-white"
                : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            }`}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeFields.map((f) => (
          <label key={f.id}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
              checked[f.id]
                ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            }`}>
            <input type="checkbox" checked={checked[f.id]} onChange={() => toggleField(f.id)} className="sr-only" />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Count</label>
          <input type="number" min={1} max={10000} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="text">Text</option>
            <option value="html-table">HTML Table</option>
            <option value="sql">SQL INSERT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Locale</label>
          <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="en-US">en-US</option>
            <option value="en-GB">en-GB</option>
            <option value="de-DE">de-DE</option>
            <option value="fr-FR">fr-FR</option>
            <option value="es-ES">es-ES</option>
            <option value="ja-JP">ja-JP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Seed</label>
          <input type="text" value={seedInput} onChange={(e) => setSeedInput(e.target.value)} placeholder="Optional seed"
            className="w-28 rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        {(format === "csv" || format === "tsv") && (
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
              <input type="checkbox" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} className="accent-brand-500" />
              Header row
            </label>
          </div>
        )}
      </div>

      {(category === "text") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Prefix</label>
            <input type="text" value={textPrefix} onChange={(e) => setTextPrefix(e.target.value)} placeholder="e.g. start_"
              className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Suffix</label>
            <input type="text" value={textSuffix} onChange={(e) => setTextSuffix(e.target.value)} placeholder="e.g. _end"
              className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      )}

      {(category === "numbers") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Min Value</label>
            <input type="number" value={numMin} onChange={(e) => setNumMin(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Max Value</label>
            <input type="number" value={numMax} onChange={(e) => setNumMax(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        {output && (
          <>
            <button onClick={copy} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={exportFile} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Export</button>
          </>
        )}
      </div>

      {stats && (
        <div className="flex gap-4 text-xs text-surface-500 dark:text-dark-muted">
          <span>Items: <strong>{stats.total}</strong></span>
          <span>Est. size: <strong>{stats.sizeStr}</strong></span>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {preview !== output ? "Preview (first 5 items)" : "Output"}
          </label>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre">
            {preview}{preview !== output ? "\n..." : ""}
          </pre>
        </div>
      )}
    </div>
  );
}
