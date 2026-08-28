# Base64 Encoding: Complete Guide to Binary-to-Text Conversion

## What is Base64?

Base64 is a binary-to-text encoding scheme that represents binary data as an ASCII string, making it safe to transmit over text-based protocols such as HTTP, SMTP, and JSON. It works by mapping every 3 bytes of binary data to 4 characters drawn from a 64-character alphabet of A-Z, a-z, 0-9, plus, and slash. This means the encoded output is roughly 33% larger than the original binary data, a cost that is acceptable for text-safe transport. Base64 is **not encryption**; it is encoding, so anyone who sees the string can decode it.

## How Base64 Works

The encoder splits the input into groups of three bytes (24 bits) and then divides those 24 bits into four 6-bit chunks, each of which maps to one character in the Base64 alphabet.

```
Input:  "Hello"
Bytes:  48 65 6C 6C 6F  (5 bytes = 40 bits)
Groups: 48 65 6C | 6C 6F 00  (padded to 6 bytes)
Base64: SGVsbG8=
```

When the input length is not a multiple of three, one or two padding characters (`=`) are appended so the output length is always a multiple of four.

## Base64 Variants

| Variant | Alphabet | Padding | Line Breaks | Use Case |
|---------|----------|---------|-------------|----------|
| **Standard** (RFC 4648) | A–Z, a–z, 0–9, `+`, `/` | `=` | None | General purpose |
| **Base64URL** (RFC 4648 §5) | A–Z, a–z, 0–9, `-`, `_` | None | None | JWTs, URLs, cookies |
| **MIME** (RFC 2045) | A–Z, a–z, 0–9, `+`, `/` | `=` | Every 76 chars | Email attachments |

**Key Difference**: Base64URL replaces `+` → `-` and `/` → `_` so encoded strings work safely in URLs and filenames without additional encoding.

## Common Use Cases

- **Data URLs**: Embed images directly in HTML/CSS (`data:image/png;base64,iVBORw0K...`)
- **JWT Tokens**: Header and payload are Base64URL-encoded
- **Basic Auth**: `Authorization: Basic base64(username:password)`
- **Email Attachments**: MIME uses Base64 for binary attachments
- **Configuration Files**: Store binary data in JSON/YAML/TOML
- **API Payloads**: Some APIs require Base64-encoded fields

## Using DevStackIO Base64 Tool

Our Base64 Encoder/Decoder lets you instantly convert text to Base64 or decode Base64 back to plain text, with optional URL-safe output and line-wrapping controls. It also includes an Image to Base64 converter for creating data URIs from image files. All processing happens entirely in your browser, ensuring your data never leaves your device.

### Step-by-Step Usage

1. **Open the tool** — Navigate to [DevStackIO Base64 Encoder/Decoder](/tools/base64)
2. **Choose mode** — Click "Encode" (text → Base64) or "Decode" (Base64 → text)
3. **Select preset** — Standard, Base64URL, or MIME based on your use case
4. **Input data** — Paste text, type directly, or drag-and-drop a file
5. **Auto-process** — Result appears instantly. Invalid Base64 shows a red error with position
6. **Copy or download** — Use toolbar buttons to get the result
7. **Verify** — For decoding, the tool shows byte length and character count for validation

## Code Examples

### JavaScript / TypeScript

```typescript
// Browser APIs (modern)
const encoded = btoa("Hello World");           // "SGVsbG8gV29ybGQ="
const decoded = atob("SGVsbG8gV29ybGQ=");      // "Hello World"

// Unicode-safe (TextEncoder)
const encoded = btoa(new TextEncoder().encode("Hello 🌍").reduce((s, b) => s + String.fromCharCode(b), ""));
const decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0)));

// Node.js
const encoded = Buffer.from("Hello World").toString("base64");
const decoded = Buffer.from(encoded, "base64").toString("utf-8");
```

### Python

```python
import base64

# Standard
encoded = base64.b64encode(b"Hello World").decode()  # "SGVsbG8gV29ybGQ="
decoded = base64.b64decode(encoded)                   # b"Hello World"

# URL-safe (no padding)
encoded = base64.urlsafe_b64encode(b"Hello World").decode().rstrip("=")
decoded = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
```

### Go

```go
import "encoding/base64"

// Standard
encoded := base64.StdEncoding.EncodeToString([]byte("Hello World"))
decoded, _ := base64.StdEncoding.DecodeString(encoded)

// URL-safe
encoded = base64.URLEncoding.EncodeToString([]byte("Hello World"))
```

### Command Line

```bash
# macOS / Linux
echo -n "Hello World" | base64          # Encode
echo "SGVsbG8gV29ybGQ=" | base64 -d     # Decode

# Windows (PowerShell)
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("Hello World"))
```

## Privacy & Performance

DevStackIO's Base64 tool runs entirely in your browser using a Web Worker. Your data never leaves your device. No server uploads, no logging, no tracking. It handles 100MB+ files smoothly because encoding/decoding happens off the main thread.

- **Zero server interaction** — Static files served via CDN, no API calls
- **No persistence** — Data exists only in component state → clipboard/download
- **CSP hardened** — `script-src 'self'` blocks injected scripts
- **Open source** — Audit the code on [GitHub](https://github.com/roddavinod99)

## FAQ

**What's the difference between Base64 and Base64URL?**
Base64URL replaces `+` with `-` and `/` with `_`, and omits padding (`=`). This makes the output safe for URLs, filenames, and cookies without additional percent-encoding.

**Why does my decoded text show garbled characters?**
The original data was likely binary (image, PDF, certificate) not text. Base64 can encode any bytes — decoding binary produces non-printable characters. Use the "Download" button to save as a file instead.

**Does Base64 provide encryption?**
No. Base64 is **encoding**, not encryption. It provides zero security — anyone can decode it instantly. Never use Base64 to hide secrets, passwords, or tokens.

**What's the size overhead?**
Base64 increases data size by ~33% (4 characters for every 3 bytes). For large files, consider compression (gzip, Brotli) before Base64 encoding.

**Can I decode a JWT payload with this tool?**
Yes. JWT uses Base64URL. Paste the middle part (between the dots), select "Base64URL" preset, and decode. For full JWT debugging, use our [JWT Decoder](/tools/jwt-decoder).

**Is there a file size limit?**
The browser handles up to ~100MB depending on available memory. For larger files, use a streaming CLI tool like `base64` command.

**Why does my Base64 string have newlines?**
That's MIME format (RFC 2045) which inserts line breaks every 76 characters for email compatibility. Select "Standard" preset to get a single continuous line.

**Can I use this offline?**
Yes, after the first load. Service Worker caches all assets for offline use.

## Related Guides

- [JWT Structure](/guides/concepts/jwt-structure) — How JWTs use Base64URL
- [URL Encoding](/guides/references/url-components) — Percent-encoding for URLs
- [HTML Entities](/guides/concepts/html-encoding) — Encode special characters for HTML

## Tools

- [Base64 Encoder/Decoder](/tools/base64) — Encode/decode with Standard/Base64URL/MIME presets
- [Base64 Image Converter](/tools/image-to-base64) — Images → Data URLs
- [JWT Decoder](/tools/jwt-decoder) — Decode & verify JWT tokens (Base64URL)
- [URL Encoder/Decoder](/tools/url-encoder) — Percent-encoding for URLs
- [HTML Entity Encoder](/tools/html-entity) — Encode special characters for HTML

## References

- [RFC 4648 — The Base16, Base32, and Base64 Data Encodings](https://www.rfc-editor.org/rfc/rfc4648)
- [RFC 2045 — MIME Part One: Format of Internet Message Bodies](https://www.rfc-editor.org/rfc/rfc2045)
- [MDN Web Docs: btoa() / atob()](https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa)
- [OWASP: Base64 Encoding](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#base64-encoding)
---

## Related Resources

## Related Guides

- [JSON Basics](/guides/concepts/json-basics)
- [JWT Structure](/guides/concepts/jwt-structure)
- [Cron Syntax](/guides/concepts/cron-syntax)
- [IP Subnetting](/guides/concepts/ip-subnetting)
- [Regex Fundamentals](/guides/concepts/regex-fundamentals)

## Related Tools

- [base64](/tools/base64)
- [image-to-base64](/tools/image-to-base64)

