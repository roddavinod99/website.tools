## Why Compare Text Differences?

Comparing text is a daily developer task — code reviews, config changes, API response diffs, document versions, log analysis. Doing it manually is error-prone and slow. A diff checker shows exactly what changed: additions, deletions, modifications — line by line or character by character.

DevStackIO's [Text Diff Checker](/tools/diff-checker) provides side-by-side and unified views, syntax highlighting, word-level diff, ignore whitespace options, and export. All client-side, handles large files via Web Worker.

## Diff Algorithms

### Myers Diff Algorithm (Standard)
The classic O(ND) algorithm used by Git, diff, and most tools. Finds the shortest edit script (SES) — minimum insertions/deletions to transform A to B.

```
Old: A B C D E F
New: A B X C D Y F

SES: Delete E, Insert X before C, Insert Y before F
```

### Word-Level Diff
Compares words instead of lines — better for prose, documentation, minified code.

```
Line diff:     "The quick brown fox" vs "The quick red fox"
               - The quick brown fox
               + The quick red fox

Word diff:     The quick [-brown-] {+red+} fox
```

### Character-Level Diff
Finest granularity — for single-line changes, typo detection.

```
"function" vs "functon"
f u n c t i o n
f u n c t o n
              ^
```

## Diff Output Formats

### Unified Diff (Git Style)
```diff
--- old/config.json
+++ new/config.json
@@ -1,7 +1,7 @@
 {
   "name": "my-app",
-  "version": "1.0.0",
+  "version": "1.1.0",
   "dependencies": {
     "react": "^18.0.0"
   }
 }
```

### Side-by-Side (Visual)
```
┌─────────────────────┬─────────────────────┐
│ Old                 │ New                 │
├─────────────────────┼─────────────────────┤
│ version: "1.0.0"    │ version: "1.1.0"    │
│ debug: false        │ debug: true         │
│                     │ timeout: 5000       │
└─────────────────────┴─────────────────────┘
```

### Inline/Unified (Compact)
```
version: "1.0.0" → "1.1.0"
debug: false → true
+ timeout: 5000
```

## How to Compare Text Online (Step by Step)

1. **Open the diff checker** — [DevStackIO Text Diff Checker](/tools/diff-checker)
2. **Choose view mode** — Side-by-side, unified, or inline
3. **Input old text** — Paste, type, or upload file (left panel)
4. **Input new text** — Paste, type, or upload file (right panel)
5. **Auto-diff** — Changes highlight instantly:
   - 🟢 Green = Added
   - 🔴 Red = Removed
   - 🟡 Yellow = Modified
6. **Configure options** — Ignore whitespace, case-insensitive, word-level
7. **Navigate changes** — Next/Previous change buttons
8. **Export** — Copy diff, download as `.diff` patch file, or JSON

## Common Use Cases

### 1. Code Review (Pull Request Simulation)
```diff
# Before merge - review changes locally
- const apiUrl = "https://api.example.com/v1";
+ const apiUrl = process.env.API_URL || "https://api.example.com/v1";
+ 
+ if (!apiUrl) {
+   throw new Error("API_URL not configured");
+ }
```

### 2. Config File Drift Detection
```diff
# production.json vs staging.json
{
  "database": {
-   "host": "prod-db.example.com",
+   "host": "staging-db.example.com",
    "port": 5432,
-   "ssl": true
+   "ssl": false
  },
  "cache": {
+   "ttl": 300
  }
}
```

### 3. API Response Regression Testing
```bash
# Save baseline response
curl -s https://api.example.com/users > baseline.json

# After deploy
curl -s https://api.example.com/users > current.json

# Diff
diff baseline.json current.json
```

### 4. Log Analysis (Before/After Fix)
```
# Before fix
2024-01-15 10:30:45 ERROR Connection timeout after 30000ms
2024-01-15 10:30:46 WARN Retrying... (attempt 1)
2024-01-15 10:30:47 ERROR Connection timeout after 30000ms

# After fix (timeout increased)
2024-01-15 11:00:00 INFO Connected successfully
2024-01-15 11:00:01 INFO Query executed in 45ms
```

### 5. Document Version Comparison
```diff
# README v1 vs v2
- ## Installation
- npm install my-package
+ ## Installation
+ npm install my-package@latest
+ 
+ ## Quick Start
+ import { MyComponent } from 'my-package';
```

### 6. Minified Code Comparison
```diff
# Before minification (formatted)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

# After minification (single line)
- function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }
+ function calculateTotal(i){return i.reduce((s,t)=>s+t.price,0)}
# Word-level diff shows: items→i, sum→s, item→t
```

## Diff Options Explained

| Option | Effect | When to Use |
|--------|--------|-------------|
| **Ignore whitespace** | Treat `a b` == `a  b` | Code with formatting differences |
| **Ignore case** | Treat `ABC` == `abc` | Case-insensitive comparison |
| **Word-level** | Diff by words not lines | Prose, minified code, long lines |
| **Character-level** | Diff by characters | Single-line changes, typos |
| **Context lines** | Show N unchanged lines around changes | Better context in unified view |
| **Trim trailing whitespace** | Ignore end-of-line spaces | Cleaner diffs |

## Understanding Diff Output

### Symbols
| Symbol | Meaning |
|--------|---------|
| `+` | Line added in new |
| `-` | Line removed from old |
| ` ` (space) | Unchanged context line |
| `!` | Line changed (both - and +) |
| `?` | Inline change markers (some tools) |

### Hunk Header (Unified)
```
@@ -10,7 +10,7 @@ function processData()
```
- `-10,7` = Old file: start line 10, 7 lines shown
- `+10,7` = New file: start line 10, 7 lines shown
- `function processData()` = Nearest function/context

## Programming: Generating Diffs

### JavaScript (diff library)
```javascript
import { diffLines, diffWords, diffChars, createPatch } from 'diff';

// Line-level
const lineDiff = diffLines(oldText, newText);
lineDiff.forEach(part => {
  if (part.added) console.log('+ ' + part.value);
  else if (part.removed) console.log('- ' + part.value);
  else console.log('  ' + part.value);
});

// Word-level
const wordDiff = diffWords(oldText, newText);

// Character-level
const charDiff = diffChars(oldText, newText);

// Generate unified patch file
const patch = createPatch('filename', oldText, newText, 'old', 'new');
```

### Python (difflib)
```python
import difflib

old = old_text.splitlines(keepends=True)
new = new_text.splitlines(keepends=True)

# Unified diff
diff = difflib.unified_diff(old, new, fromfile='old', tofile='new', lineterm='')
print('\n'.join(diff))

# Context diff
diff = difflib.context_diff(old, new, fromfile='old', tofile='new')
print('\n'.join(diff))

# HTML side-by-side
html_diff = difflib.HtmlDiff()
print(html_diff.make_file(old, new, 'Old', 'New'))

# SequenceMatcher for ratio
matcher = difflib.SequenceMatcher(None, old_text, new_text)
print(f"Similarity: {matcher.ratio():.2%}")
```

### Go (github.com/sergi/go-diff)
```go
import (
    "github.com/sergi/go-diff/diffmatchpatch"
)

dmp := diffmatchpatch.New()
diffs := dmp.DiffMain(oldText, newText, false)
// diffs = []Diff{ {Type: DiffInsert, Text: "new"}, {Type: DiffDelete, Text: "old"}, ... }

// Pretty print
fmt.Println(dmp.DiffPrettyText(diffs))

// Patch
patches := dmp.PatchMake(oldText, diffs)
patchText := dmp.PatchToText(patches)
```

### Rust (similar crate)
```rust
use similar::{Algorithm, TextDiff};

let diff = TextDiff::configure()
    .algorithm(Algorithm::Myers)
    .diff_lines(old_text, new_text);

for change in diff.iter_all_changes() {
    let sign = match change.tag() {
        ChangeTag::Delete => "-",
        ChangeTag::Insert => "+",
        ChangeTag::Equal => " ",
    };
    println!("{}{}", sign, change);
}

// Unified diff
let mut output = String::new();
for hunk in diff.unified_diff().iter_hunks() {
    write!(output, "{}", hunk)?;
}
```

### Command Line
```bash
# Basic diff
diff -u old.txt new.txt          # Unified
diff -y old.txt new.txt          # Side-by-side
diff -u --ignore-all-space old.txt new.txt  # Ignore whitespace

# Git diff (even without repo)
git diff --no-index old.txt new.txt

# Colored output
diff -u old.txt new.txt | colordiff
git diff --no-index --color old.txt new.txt

# Word diff
git diff --no-index --word-diff old.txt new.txt
```

## Applying Patches

### Unified Patch Format
```diff
--- a/config.json
+++ b/config.json
@@ -1,5 +1,5 @@
 {
   "name": "my-app",
-  "version": "1.0.0",
+  "version": "1.1.0",
   "debug": false
 }
```

### Apply with `patch` command
```bash
# Create patch
diff -u old.txt new.txt > changes.patch

# Apply
patch < changes.patch

# Dry run
patch --dry-run < changes.patch

# Reverse
patch -R < changes.patch
```

### Apply in JavaScript
```javascript
import { applyPatch } from 'diff';

const patched = applyPatch(oldText, patchText);
// Returns new text or false if fails
```

## Performance for Large Files

| File Size | Algorithm | Time | Memory |
|-----------|-----------|------|--------|
| < 10 KB | Myers (standard) | < 1 ms | Minimal |
| 10-100 KB | Myers + Web Worker | 1-50 ms | Low |
| 100 KB - 1 MB | Myers + checkpointing | 50-500 ms | Medium |
| 1-10 MB | Myers + streaming | 0.5-5 s | High |
| > 10 MB | External tool recommended | — | — |

**Tip**: For huge files, use `git diff` or CLI `diff` which use memory-mapped files.

## FAQ

**Why does my diff show everything as changed?**
Likely line ending difference (CRLF vs LF). Enable "Ignore whitespace" or normalize line endings first.

**Can I diff binary files?**
No — diff tools are for text. Use `cmp` or `xxd` for binary comparison.

**What's the difference between side-by-side and unified?**
- Side-by-side: Visual, easier to scan, shows both versions
- Unified: Compact, standard patch format, better for version control

**How do I ignore specific lines (like timestamps)?**
Pre-process: remove/filter lines matching pattern before diffing.

**Can I diff three files (merge conflict)?**
Use `diff3` or Git's merge tools. Online tools typically do two-way only.

**Why are some changes shown as delete+add instead of modify?**
Most diff algorithms don't detect "modify" — they show delete old line + add new line. Some tools post-process to show `!` for modifications.

**Is there a maximum file size?**
Browser: ~10MB practical. For larger, use CLI tools.

**Does it work with minified code?**
Yes — use word-level or character-level mode. Line-level on minified code shows entire file as changed.

## Related Tools

- [JSON Diff Checker](/tools/json-diff) — Structural JSON comparison
- [Text Diff Visualizer](/tools/text-diff-visual) — Alternative visual diff
- [String Comparison](/tools/string-comparison) — Character-level analysis
- [Git Cheatsheet](/tools/git-cheatsheet) — Git diff commands
- [Regex Tester](/tools/regex-tester) — Pre-process with regex

## References

- [Myers Diff Algorithm Paper](https://www.cs.dartmouth.edu/~doug/diff.ps)
- [diffutils Manual](https://www.gnu.org/software/diffutils/manual/)
- [Git Diff Documentation](https://git-scm.com/docs/git-diff)
- [difflib Python Docs](https://docs.python.org/3/library/difflib.html)
- [diff-match-patch (Google)](https://github.com/google/diff-match-patch)
- [Unified Diff Format](https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html)

---

*Compare text now → [Free Text Diff Checker](/tools/diff-checker) — Side-by-side, unified, inline views. Word/char level, ignore whitespace, patch export. Client-side, Web Worker powered.*