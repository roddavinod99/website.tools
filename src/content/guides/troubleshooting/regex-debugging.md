# Regex Debugging & Troubleshooting

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
| `\w` | Word char `[a-zA-Z0-9_]` | `\w+` | "hello123" |
| `\s` | Whitespace | `\s+` | "  \t\n" |
| `^` | Start of string/line | `^Hello` | "Hello world" |
| `$` | End of string/line | `world$` | "Hello world" |
| `\b` | Word boundary | `\bcat\b` | "cat" not "catapult" |

### Quantifiers
| Quantifier | Meaning | Example |
|------------|---------|---------|
| `*` | 0 or more | `ab*c` → ac, abc, abbc... |
| `+` | 1 or more | `ab+c` → abc, abbc... |
| `?` | 0 or 1 | `ab?c` → ac, abc |
| `{n}` | Exactly n | `a{3}` → aaa |
| `{n,m}` | n to m | `a{2,4}` → aa, aaa, aaaa |

**Greedy vs Lazy:**
- Greedy (default): `.*` matches as much as possible
- Lazy: `.*?` matches as little as possible

```javascript
const html = "<div>Hello</div><span>World</span>";
/<div>.*<\/div>/.exec(html);   // Greedy: "<div>Hello</div><span>World</span>"
/<div>.*?<\/div>/.exec(html);  // Lazy:   "<div>Hello</div>"
```

## Capture Groups

### Numbered Groups `()`
```javascript
const regex = /(\d{4})-(\d{2})-(\d{2})/;
const match = regex.exec("2024-01-15");
// match[0] = "2024-01-15" (full match)
// match[1] = "2024" (year)
// match[2] = "01" (month)
// match[3] = "15" (day)
```

### Named Groups `(?<name>)` (ES2018+)
```javascript
const regex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = regex.exec("2024-01-15");
// match.groups = { year: "2024", month: "01", day: "15" }
```

### Non-Capturing Groups `(?:)`
```javascript
/(?:cat|dog|bird)s/  // Matches "cats", "dogs", "birds" — no extra capture
```

### Backreferences `\1`, `\k<name>`
```javascript
/\b(\w+)\s+\1\b/.test("hello hello");  // true (repeated word)
/(?<word>\w+)\s+\k<word>/.test("test test");  // true (named)
```

## Flags (Modifiers)
| Flag | Name | Effect |
|------|------|--------|
| `g` | Global | Find all matches, not just first |
| `i` | Case-insensitive | `/cat/i` matches "Cat", "CAT", "cat" |
| `m` | Multiline | `^` and `$` match line boundaries |
| `s` | DotAll (ES2018) | `.` matches newlines too |
| `u` | Unicode (ES2015) | Proper Unicode, enables `\p{...}` |
| `y` | Sticky (ES2015) | Match only at `lastIndex` position |

```javascript
// Unicode property escapes (requires 'u' flag)
/\p{Script=Greek}+/u.test("αβγ");     // true
/\p{Emoji}+/u.test("😀🎉");          // true
/\p{General_Category=Letter}/u.test("你好"); // true
```

## How to Test Regex Online

1. **Open the tester** — [DevStackIO Regex Tester](/tools/regex-tester)
2. **Enter pattern** — Type regex (with or without `/delimiters/`)
3. **Set flags** — Toggle g, i, m, s, u, y as needed
4. **Enter test string** — Paste text, type, or load file
5. **Real-time results** — Matches highlight instantly
6. **Inspect groups** — Panel shows full match + all capture groups per match
7. **Test substitution** — Enter replacement string (supports `$1`, `$&`, `$<name>`)
8. **Explain mode** — Get plain-English breakdown of each pattern part
9. **Copy/export** — Pattern, matches, or substitution result

## Common Patterns Library

### Validation
```regex
# Email (simplified)
^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$

# URL
^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$

# IPv4
^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$

# UUID v4
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

# Strong password
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
```

### Transformation
```regex
# CamelCase to snake_case
([a-z])([A-Z]) → $1_$2 (then lowercase)

# Remove HTML tags
<[^>]*> → (empty)

# Normalize whitespace
\s+ → (space)
```

## Real-World Debugging Examples

### 1. Password Validation Not Working
```javascript
// Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
// Test: "Password1" → Should match
// Test: "password1" → Should NOT match (no uppercase)
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
```

## Performance & ReDoS Prevention

### Catastrophic Backtracking
```javascript
// DANGEROUS: Exponential backtracking
/(a+)+b/.test("aaaaaaaaaaaaaaaaaaaaac");  // Freezes!

// Engine tries: (a)(a)(a)... then (aa)(aa)... then (aaa)(aaa)...
```

### Safe Patterns
```javascript
// Avoid nested quantifiers: (a+)+
// Use specific character classes: [a-z] not .
// Bound repetitions: {1,100} not *
// Anchor when possible: ^...$

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

## FAQ

**Why doesn't my regex work in JavaScript but works in Python?**
Different engines support different features. JS lacks: atomic groups, possessive quantifiers, recursion, verbose mode.

**How do I match a literal backslash?**
`\\\\` in string literal → `\\` in regex → matches single `\`

**What's the difference between `test()` and `exec()`?**
- `test()`: Returns boolean, updates `lastIndex` (with `g` flag)
- `exec()`: Returns match array or null, captures groups
- `match()`: String method, returns all matches (with `g`) or first match array

**How do I replace all occurrences?**
```javascript
str.replace(/pattern/g, "replacement")  // With global flag
str.replaceAll("literal", "replacement") // No regex, safer for literals
```

**Can I use regex to parse HTML/XML/JSON?**
**No.** Use proper parsers. Regex cannot handle nested structures reliably.

## Related Tools
- [Regex Tester](/tools/regex-tester) — Real-time matching, capture groups, flags, substitution
- [Regex Cheatsheet](/tools/regex-memo) — Quick reference for patterns
- [String Escape/Unescape](/tools/escape-unescape) — Handle regex in strings
- [Text Diff Checker](/tools/diff-checker) — Compare regex outputs

## References
- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [ECMAScript 2024 RegExp Spec](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects)
- [Regular-Expressions.info](https://www.regular-expressions.info/)
- [OWASP: ReDoS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Regular_Expression_Denial_of_Service_ReDoS_Cheat_Sheet.html)
---

## Related Resources

## Related Guides

- [JSON Errors & Fixes](/guides/troubleshooting/json-errors)
- [JWT Decoding](/guides/troubleshooting/jwt-decoding)
- [Hash Verification](/guides/troubleshooting/hash-verification)
- [DNS Troubleshooting](/guides/troubleshooting/dns-troubleshooting)
- [Timestamp Conversion](/guides/troubleshooting/timestamp-conversion)

## Related Tools

- [regex-tester](/tools/regex-tester)

