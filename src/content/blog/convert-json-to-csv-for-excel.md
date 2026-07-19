## Why Convert JSON to CSV?

JSON is great for APIs and nested data. CSV is great for spreadsheets, databases, and human review. Converting between them is one of the most common developer tasks — but doing it correctly (handling nested objects, arrays, special characters, encoding) is surprisingly tricky.

DevStackIO's JSON to CSV converter handles the edge cases so you don't have to.

## When You Need This Conversion

| Scenario | Why CSV? |
|----------|----------|
| **Export API data to Excel** | Stakeholders need pivot tables / charts |
| **Bulk import to database** | `COPY FROM` / `LOAD DATA INFILE` prefers CSV |
| **Data analysis in Python/R** | `pandas.read_csv()`, `data.table::fread()` |
| **Share with non-technical team** | Everyone opens CSV; few parse JSON |
| **ETL pipelines** | Intermediate format for transformation |
| **Legacy system integration** | Older tools only accept CSV |
| **Report generation** | Feed into BI tools (Tableau, Power BI, Looker) |

## The JSON → CSV Challenge: Structure Mismatch

JSON is hierarchical (nested objects, arrays). CSV is flat (rows × columns). There's no single "correct" mapping — it depends on your data and use case.

### Example Input
```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "address": {
      "city": "SF",
      "zip": "94102"
    },
    "tags": ["engineering", "senior"],
    "projects": [
      { "name": "API v2", "status": "done" },
      { "name": "Dashboard", "status": "active" }
    ]
  }
]
```

### Option 1: Flatten Top-Level Only (Default)
```csv
id,name,email,address.city,address.zip,tags,projects
1,Alice,alice@example.com,SF,94102,"[""engineering"",""senior""]","[{""name"":""API v2"",""status"":""done""},{""name"":""Dashboard"",""status"":""active""}]"
```
Arrays/objects become JSON strings. Simple, preserves all data, but nested content isn't queryable in Excel.

### Option 2: Flatten Nested Objects (Dot Notation)
```csv
id,name,email,address.city,address.zip,tags,projects
1,Alice,alice@example.com,SF,94102,"[""engineering"",""senior""]","[{""name"":""API v2"",""status"":""done""},{""name"":""Dashboard"",""status"":""active""}]"
```
Same as Option 1 but nested objects expand to columns. Good for shallow nesting.

### Option 3: Explode Arrays (One Row Per Item)
```csv
id,name,email,address.city,address.zip,tag,project.name,project.status
1,Alice,alice@example.com,SF,94102,engineering,API v2,done
1,Alice,alice@example.com,SF,94102,engineering,Dashboard,active
1,Alice,alice@example.com,SF,94102,senior,API v2,done
1,Alice,alice@example.com,SF,94102,senior,Dashboard,active
```
Cartesian product of arrays. Each combination = new row. **Use for relational import.**

### Option 4: Normalize to Multiple CSVs (Star Schema)
- `users.csv` — id, name, email, address_city, address_zip
- `user_tags.csv` — user_id, tag
- `user_projects.csv` — user_id, project_name, project_status
Best for database loading. DevStackIO can output this via the "Multiple Files" option.

## How to Convert JSON to CSV (Step by Step)

### 1. Prepare Your JSON
- Must be an **array of objects** (most common)
- Or a single object (converts to 1-row CSV)
- Or newline-delimited JSON (NDJSON) — one object per line

```json
// Array of objects ✓
[{"a":1},{"a":2}]

// Single object ✓
{"a":1,"b":2}

// NDJSON ✓
{"a":1}
{"a":2}
```

### 2. Open the Converter
Go to [DevStackIO JSON to CSV](/tools/json-to-csv)

### 3. Paste or Upload
- Paste JSON directly (up to 50MB)
- Drag & drop `.json` / `.ndjson` file
- Click "Load Sample" to see format

### 4. Configure Output (The Critical Step)

| Setting | Options | When to Use |
|---------|---------|-------------|
| **Flatten nested objects** | ✓ / ✗ | ✓ for shallow objects (address, metadata). ✗ for deep/complex. |
| **Array handling** | `json` / `explode` / `join` / `first` / `count` | See below |
| **Delimiter** | `,` / `;` / `\t` / `|` | `,` for Excel US. `;` for EU Excel. `\t` for TSV. |
| **Quote character** | `"` / `'` / none | `"` standard. `'` if data has many quotes. |
| **Escape character** | `"` / `\` | `"` (RFC 4180). `\` for some DBs. |
| **Header row** | ✓ / ✗ | ✓ for human use. ✗ for some DB imports. |
| **Null value** | empty / `null` / `NULL` / `N/A` | Empty = standard. `NULL` for SQL. |
| **Date format** | ISO / Unix / Custom | ISO 8601 default. Unix for DB. |
| **Encoding** | UTF-8 / UTF-16 | UTF-8 always unless legacy system demands else. |
| **BOM** | ✓ / ✗ | ✓ for Excel on Windows. |

#### Array Handling Deep Dive

| Mode | Input `["a","b"]` | Output | Best For |
|------|-------------------|--------|----------|
| `json` | `["a","b"]` | `["a","b"]` (JSON string) | Preserve structure, parse later |
| `join` | `["a","b"]` | `a;b` (custom delimiter) | Human-readable, searchable |
| `explode` | `["a","b"]` | **2 rows** (cartesian) | Relational import, one-to-many |
| `first` | `["a","b"]` | `a` | Quick preview, primary value |
| `count` | `["a","b"]` | `2` | Analytics, cardinality checks |

### 5. Preview & Validate
- First 100 rows rendered as table
- Column types inferred (number, date, boolean, string)
- Row count, column count, file size shown

### 6. Download
- Single `.csv` file
- Or **ZIP of multiple CSVs** (if "Multiple Files" + array explode)
- Streaming download for large files (no memory crash)

---

## Advanced Features

### Custom JSONPath Extraction
Extract only specific fields from complex objects:

```json
// Input
{"data": {"users": [{"profile": {"name": "Alice", "settings": {"theme": "dark"}}}]}}

// JSONPath: $.data.users[*].profile
// Result: [{"name": "Alice", "settings": {"theme": "dark"}}]

// JSONPath: $.data.users[*].profile.name
// Result: ["Alice"]
```

Enter JSONPath in "Field Filter" to cherry-pick columns.

### Streaming Large Files (100MB+)
The converter uses a Web Worker + TransformStream:
1. File read as stream
2. JSON parsed incrementally (NDJSON) or tokenized (JSON array)
3. Each object → CSV row → pushed to download stream
4. **Constant memory** regardless of file size

### Formula Injection Protection
CSV cells starting with `=`, `+`, `-`, `@` can execute formulas in Excel/Sheets (security risk).

DevStackIO **auto-prefixes** with `'` (single quote):
```csv
name,formula
"Alice","'=1+1"    // Displays as =1+1, doesn't calculate
```

Disable with "Allow Formulas" checkbox (not recommended for untrusted data).

### Batch Convert Multiple Files
Upload a ZIP of JSON files → get a ZIP of CSVs with same names.

---

## Common Pitfalls & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| **Columns misaligned** | Inconsistent keys across objects | Enable "Union All Keys" (default) — creates column for every key seen |
| **Truncated data** | Excel 1M row / 16K col limit | Split output, use DB, or Power Query |
| **Special chars garbled** | Encoding mismatch | Force UTF-8 with BOM for Excel |
| **Dates as numbers** | Excel auto-format | Import via Data → From Text/CSV, set column type |
| **Newlines in cells** | JSON strings with `\n` | CSV quotes handle this. Check "Multiline" in Excel import |
| **Memory crash** | 500MB file in browser | Use streaming (auto-enabled >50MB) or CLI |

---

## Automation: CLI & CI/CD

### Node.js Script
```javascript
import { jsonToCsv } from '@devstackio/json-csv';
import { createReadStream, createWriteStream } from 'fs';

const transform = jsonToCsv({
  flatten: true,
  arrayMode: 'explode',
  delimiter: ',',
  encoding: 'utf8'
});

createReadStream('data.json')
  .pipe(transform)
  .pipe(createWriteStream('data.csv'))
  .on('finish', () => console.log('Done'));
```

### GitHub Action
```yaml
- name: Convert JSON to CSV
  run: |
    npx @devstackio/json-csv-cli \
      --input ./build/artifacts/*.json \
      --output ./dist/csv/ \
      --flatten \
      --array-mode explode
```

### Python Equivalent
```python
import pandas as pd
df = pd.read_json('data.json')
df.to_csv('data.csv', index=False, quoting=csv.QUOTE_ALL)
```

---

## JSON to CSV vs. CSV to JSON

| Direction | Tool | Use Case |
|-----------|------|----------|
| JSON → CSV | [This tool](/tools/json-to-csv) | Export, analyze, import |
| CSV → JSON | [CSV to JSON](/tools/csv-to-json) | Config from spreadsheet, seed data |
| JSON ↔ CSV | [Both](/tools/json-to-csv) | Round-trip editing |

---

## FAQ

**Can I convert XML to CSV?**
Not directly. Use [XML to JSON](/tools/xml-to-json) first, then JSON to CSV.

**What about YAML/TOML?**
[YAML/TOML/JSON Converter](/tools/toml-converter) → JSON → CSV.

**Does it handle 1GB files?**
Browser: ~500MB (memory). CLI: Unlimited (streaming). For 1GB+, use the CLI.

**Can I map JSON keys to different CSV headers?**
Yes — "Column Mapping" panel lets you rename, reorder, or exclude columns.

**Is my data uploaded?**
Never. 100% client-side. Works offline after first load.

**How to handle `null` vs empty string?**
"Null Value" setting: `empty` (default), `null`, `NULL`, `N/A`. Empty = `,,` in CSV.

---

## Related Tools

- [CSV to JSON](/tools/csv-to-json) — Reverse conversion
- [JSON Formatter](/tools/json-formatter) — Clean input first
- [JSON Validator](/tools/json-validator) — Fix syntax errors
- [JSON Path Finder](/tools/json-path-finder) — Test JSONPath queries
- [Table to JSON](/tools/table-to-json) — HTML table → JSON → CSV

---

*Convert now → [Free JSON to CSV Converter](/tools/json-to-csv) — Streaming, 50MB+ support, zero upload, total privacy.*