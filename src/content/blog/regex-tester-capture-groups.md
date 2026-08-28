## Why Test Regular Expressions?

Regular expressions (regex) are powerful but notoriously hard to write and debug. A single misplaced character changes the entire match behavior. An interactive regex tester lets you see matches in real-time, inspect capture groups, test edge cases, and understand exactly what your pattern matches — before deploying to production.

DevStackIO's [Regex Tester](/tools/regex-tester) provides real-time matching with full capture group visualization, support for all major flags (g, i, m, s, u, y), substitution testing, and regex explanation. All client-side, runs in a Web Worker for large inputs.

## Regex Fundamentals

### Anatomy of a Pattern
```
/pattern/flags
 ^      ^    ^
 |      |    └─ Flags: g, i, m, s, u, y
 |      └─ Delimiters (JS: /.../, others: implicit)
 └─ The pattern itself
```

### Common Metacharacters

| Char | Meaning | Example | Matches |
|------|---------|---------|---------|
| `.` | Any char (except newline) | `c.t` | cat, cot, cxt |
| `\d` | Digit `[0-9]` | `\d{3}-\d{4}` | 555-1234 |
| `\D` | Non-digit | `\D+` | "abc" |
| `\w` | Word char `[a-zA-Z0-9_]` | `\w+` | "hello123" |
| `\W` | Non-word char | `\W+` | "!@#" |
| `\s` | Whitespace | `\s+` | "  \t\n" |
| `\S` | Non-whitespace | `\S+` | "hello" |
| `^` | Start of string/line | `^Hello` | "Hello world" |
| `$` | End of string/line | `world$` | "Hello world" |
| `\b` | Word boundary | `\bcat\b` | "cat" not "catapult" |
| `\B` | Non-word boundary | `\Bcat\B` | "scatter" |

### Quantifiers

| Quantifier | Meaning | Example |
|------------|---------|---------|
| `*` | 0 or more | `ab*c` → ac, abc, abbc, abbbc... |
| `+` | 1 or more | `ab+c` → abc, abbc, abbbc... |
| `?` | 0 or 1 | `ab?c` → ac, abc |
| `{n}` | Exactly n | `a{3}` → aaa |
| `{n,}` | n or more | `a{2,}` → aa, aaa, aaaa... |
| `{n,m}` | n to m | `a{2,4}` → aa, aaa, aaaa |

**Greedy vs Lazy**:
- Greedy (default): `.*` matches as much as possible
- Lazy: `.*?` matches as little as possible

```javascript
// HTML tag example
const html = "<div>Hello</div><span>World</span>";

/<div>.*<\/div>/.exec(html);   // Greedy: "<div>Hello</div><span>World</span>"
/<div>.*?<\/div>/.exec(html);  // Lazy:   "<div>Hello</div>"
```

### Character Classes

| Pattern | Description |
|---------|-------------|
| `[abc]` | a, b, or c |
| `[a-z]` | a through z |
| `[^abc]` | NOT a, b, or c |
| `[a-zA-Z0-9]` | Alphanumeric |
| `[[:alpha:]]` | POSIX alpha (locale-aware) |

## Capture Groups

### Numbered Groups `()`
```javascript
const regex = /(\d{4})-(\d{2})-(\d{2})/;
const match = regex.exec("2024-01-15");
/*
match[0] = "2024-01-15"  (full match)
match[1] = "2024"        (year)
match[2] = "01"          (month)
match[3] = "15"          (day)
*/
```

### Named Groups `(?<name>)` (ES2018+)
```javascript
const regex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = regex.exec("2024-01-15");
/*
match.groups = { year: "2024", month: "01", day: "15" }
match[0] = "2024-01-15"
*/
```

### Non-Capturing Groups `(?:)`
```javascript
// Group for alternation without capturing
/(?:cat|dog|bird)s/  // Matches "cats", "dogs", "birds"
// No extra capture group created
```

### Backreferences `\1`, `\2`, `\k<name>`
```javascript
// Match repeated words
/\b(\w+)\s+\1\b/.test("hello hello");  // true
/\b(\w+)\s+\1\b/.test("hello world");  // false

// Named backreference
/(?<word>\w+)\s+\k<word>/.test("test test");  // true
```

## Flags (Modifiers)

| Flag | Name | Effect |
|------|------|--------|
| `g` | Global | Find all matches, not just first |
| `i` | Case-insensitive | `/cat/i` matches "Cat", "CAT", "cat" |
| `m` | Multiline | `^` and `$` match line boundaries |
| `s` | DotAll (ES2018) | `.` matches newlines too |
| `u` | Unicode (ES2015) | Proper Unicode handling, enables `\p{...}` |
| `y` | Sticky (ES2015) | Match only at `lastIndex` position |

```javascript
// Unicode property escapes (requires 'u' flag)
/\p{Script=Greek}+/u.test("αβγ");     // true
/\p{Emoji}+/u.test("😀🎉");          // true
/\p{General_Category=Letter}/u.test("你好"); // true
```

## How to Test Regex Online (Step by Step)

1. **Open the tester** — [DevStackIO Regex Tester](/tools/regex-tester)
2. **Enter pattern** — Type regex (with or without `/delimiters/`)
3. **Set flags** — Toggle g, i, m, s, u, y as needed
4. **Enter test string** — Paste text, type, or load file
5. **Real-time results** — Matches highlight instantly in test string
6. **Inspect groups** — Panel shows full match + all capture groups per match
7. **Test substitution** — Enter replacement string (supports `$1`, `$&`, `$<name>`)
8. **Explain mode** — Get plain-English breakdown of each pattern part
9. **Copy/export** — Pattern, matches, or substitution result

## Common Patterns Library

### Validation
```regex
# Email (simplified, RFC 5322 is complex)
^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$

# URL
^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$

# IPv4
^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$

# UUID v4
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

# Credit card (Luhn check needs code)
^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})$

# Strong password (8+ chars, upper, lower, digit, special)
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$
```

### Extraction
```regex
# URLs in text
https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)

# Email addresses
[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+

# IP addresses (v4)
\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b

# Hashtags
#\w+

# Mentions
@\w+

# Hex colors
#(?:[0-9a-fA-F]{3}){1,2}\b

# Dates (YYYY-MM-DD)
\d{4}-\d{2}-\d{2}

# Version numbers
v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?
```

### Transformation
```regex
# CamelCase to snake_case
([a-z])([A-Z]) → $1_$2 (then lowercase)

# Snake_case to CamelCase
_([a-z]) → \U$1 (then capitalize first)

# Remove HTML tags
<[^>]*> → (empty)

# Normalize whitespace
\s+ → (space)

# Add quotes to CSV fields
^|,(?=(?:[^"]*"[^"]*")*[^"]*$) → ", (complex)
```

## Real-World Debugging Examples

### 1. Password Validation Not Working
```javascript
// Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
// Test: "Password1" → Should match
// Test: "password1" → Should NOT match (no uppercase)
// Test: "PASSWORD1" → Should NOT match (no lowercase)
// Test: "Password" → Should NOT match (no digit)
// Debug: Use tester to see which lookahead fails
```

### 2. URL Matching Too Much
```javascript
// Pattern: https?://.+
// Test: "Visit https://example.com and https://test.com"
// Matches: "https://example.com and https://test.com" (greedy!)
// Fix: https?://.+? (lazy) or https?://[^\s]+
```

### 3. Capturing Groups Off by One
```javascript
// Pattern: (\d{3})-(\d{3})-(\d{4})
// Test: "555-123-4567"
// Groups: [0]="555-123-4567", [1]="555", [2]="123", [3]="4567"
// If you add outer group: ((\d{3})-(\d{3})-(\d{4}))
// Groups shift! Use named groups to avoid confusion.
```

### 4. Unicode Not Matching
```javascript
// Pattern: \w+
// Test: "你好" (Chinese) → No match in JS without 'u' flag
// Fix: /\w+/u → Matches (with Unicode property)
// Or: /[\p{L}\p{N}_]+/u for explicit Unicode letters/numbers
```

## Performance & ReDoS Prevention

### Catastrophic Backtracking
```javascript
// DANGEROUS: Exponential backtracking
/(a+)+b/.test("aaaaaaaaaaaaaaaaaaaaac");  // Freezes!

// Input: "a" × 20 + "c"
// Engine tries: (a)(a)(a)... then (aa)(aa)... then (aaa)(aaa)...
```

### Safe Patterns
```javascript
// Use atomic groups / possessive quantifiers (not in JS, but in PCRE)
// In JS: restructure to avoid nesting quantifiers

// Instead of (a+)+b
// Use a+b (if that's what you mean)
// Or: a{1,20}b (bounded)
```

### Best Practices
1. **Anchor** patterns when possible: `^...$`
2. **Avoid** nested quantifiers: `(a+)+`
3. **Use** specific character classes: `[a-z]` not `.`
4. **Bound** repetitions: `{1,100}` not `*`
5. **Test** with long non-matching strings
6. **Profile** with `console.time()` in real code

```javascript
// Benchmark helper
function benchmark(pattern, input, iterations = 1000) {
  const regex = new RegExp(pattern);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) regex.test(input);
  return performance.now() - start;
}
```

## Programming Language Differences

| Feature | JavaScript | Python | Go | Rust | PCRE (PHP) |
|---------|------------|--------|-----|------|------------|
| Named groups | ✅ `(?<name>)` | ✅ `(?P<name>)` | ✅ `(?P<name>)` | ✅ `(?P<name>)` | ✅ `(?<name>)` |
| Unicode props | ✅ `\p{...}` (u) | ✅ `\p{...}` | ✅ `\p{...}` | ✅ `\p{...}` | ✅ `\p{...}` |
| Lookbehind | ✅ `(?<=...)` | ✅ `(?<=...)` | ❌ | ✅ `(?<=...)` | ✅ `(?<=...)` |
| Atomic groups | ❌ | ✅ `(?>...)` | ❌ | ✅ `(?>...)` | ✅ `(?>...)` |
| Possessive | ❌ | ✅ `*+` `++` | ❌ | ✅ `*+` `++` | ✅ `*+` `++` |
| Recursion | ❌ | ❌ | ❌ | ❌ | ✅ `(?R)` |
| Verbose mode | ❌ | ✅ `re.VERBOSE` | ❌ | ✅ `x` flag | ✅ `x` flag |

## FAQ

**Why doesn't my regex work in JavaScript but works in Python?**
Different engines support different features. JS lacks: atomic groups, possessive quantifiers, recursion, verbose mode. Use the tester with target engine in mind.

**How do I match a literal backslash?**
`\\\\` in string literal → `\\` in regex → matches single `\`

**What's the difference between `test()` and `exec()`?**
- `test()`: Returns boolean, updates `lastIndex` (with `g` flag)
- `exec()`: Returns match array or null, captures groups
- `match()`: String method, returns all matches (with `g`) or first match array

**How do I replace all occurrences?**
```javascript
// With global flag
str.replace(/pattern/g, "replacement")

// With replaceAll (ES2021)
str.replaceAll("literal", "replacement")  // No regex, safer for literals
```

**Can I use regex to parse HTML/XML/JSON?**
**No.** Use proper parsers. Regex cannot handle nested structures reliably.

**Why is my regex slow on long strings?**
Likely catastrophic backtracking. Test with the tester's "Performance" mode (shows steps). Restructure pattern.

**Does the tester support lookbehind?**
Yes — `(?<=...)` and `(?<!...)` (fixed-width in JS).

**What's the maximum regex length?**
No practical limit. Browser regex engines handle thousands of characters.

## Related Tools

- [Regex Cheatsheet](/tools/regex-memo) — Quick reference for patterns
- [String Escape/Unescape](/tools/escape-unescape) — Handle regex in strings
- [Text Diff Checker](/tools/diff-checker) — Compare regex outputs
- [JSON Path Finder](/tools/json-path-finder) — Query JSON instead of regex

## References

- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [ECMAScript 2024 RegExp Spec](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects)
- [Regular-Expressions.info](https://www.regular-expressions.info/)
- [Regex101 — Interactive Tester](https://regex101.com/) (PCRE, JS, Python, Go)
- [OWASP: ReDoS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Regular_Expression_Denial_of_Service_ReDoS_Cheat_Sheet.html)
- [Unicode Technical Standard #18](https://www.unicode.org/reports/tr18/)
- [Mastering Regular Expressions (Friedl)](https://www.oreilly.com/library/view/mastering-regular-expressions/9780596528126/)

---

*Test regex now → [Free Regex Tester](/tools/regex-tester) — Real-time matching, capture groups, flags, substitution, explanation. Web Worker powered, client-side.*
---

## Related Resources

## More Blog Posts

- [Base64 Encode/Decode Online — Free Tool for Developers](/blog/base64-encode-decode-online)
- [UUID v4 vs v7 Generator — Which UUID Version Should You Use?](/blog/uuid-v4-vs-v7-generator)
- [SQL Formatter Online — Format, Beautify & Validate SQL Queries](/blog/sql-formatter-online)
- [Hash Generator Online — MD5, SHA-256, SHA-512 & More](/blog/hash-generator-online)
- [Image Compressor for Web — Reduce Size 40-80% (JPEG, PNG, WebP, AVIF)](/blog/image-compressor-for-web)

