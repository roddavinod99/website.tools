## Why Parse URLs?

URLs are everywhere — API endpoints, redirects, OAuth callbacks, tracking parameters, deep links. But raw URLs are hard to read: percent-encoded, nested query parameters, fragments, authentication credentials. A URL parser breaks them into structured components instantly.

DevStackIO's [URL Parser](/tools/url-parser) parses any URL into protocol, host, path, query parameters, and hash — with decoding, validation, and editing. All client-side, zero tracking.

## URL Anatomy

```
https://user:pass@sub.example.com:8080/path/to/resource?param1=value1&param2=value2#section
│       │           │                │       │                    │                   │
│       │           │                │       │                    │                   └─ Fragment (hash)
│       │           │                │       │                    └─ Query string
│       │           │                │       └─ Path
│       │           │                └─ Port
│       │           └─ Hostname
│       └─ Credentials (deprecated)
└─ Protocol (scheme)
```

### Component Breakdown

| Component | Example | Description |
|-----------|---------|-------------|
| **Protocol** | `https:` | Scheme: http, https, ftp, ws, wss, mailto, tel, custom |
| **Username** | `user` | Authentication (deprecated in URLs) |
| **Password** | `pass` | Authentication (deprecated, security risk) |
| **Hostname** | `sub.example.com` | Domain or IP address |
| **Port** | `8080` | Numeric port (optional, defaults by protocol) |
| **Path** | `/path/to/resource` | Hierarchical resource path |
| **Query** | `?param1=value1&param2=value2` | Key-value parameters |
| **Hash** | `#section` | Fragment identifier (client-side only) |

## Percent Encoding (URL Encoding)

Special characters must be encoded as `%XX` (hex byte value):

| Character | Encoded | Reason |
|-----------|---------|--------|
| Space | `%20` or `+` | Not allowed in URLs |
| `!` | `%21` | Reserved |
| `#` | `%23` | Fragment delimiter |
| `?` | `%3F` | Query delimiter |
| `&` | `%26` | Parameter separator |
| `=` | `%3D` | Key-value separator |
| `/` | `%2F` | Path separator (in query) |
| `:` | `%3A` | Protocol/port separator |
| `@` | `%40` | Credentials separator |
| `[` `]` | `%5B` `%5D` | IPv6 literals |
| Unicode | `%E2%9C%93` | UTF-8 bytes (`✓`) |

**Note**: Modern `URLSearchParams` handles encoding/decoding automatically.

## How to Parse URLs Online (Step by Step)

1. **Open the parser** — [DevStackIO URL Parser](/tools/url-parser)
2. **Paste URL** — Raw URL from browser, logs, API response, email
3. **Auto-parse** — Components appear instantly in structured panels
4. **Inspect query params** — Table view with decoded keys/values
5. **Edit components** — Modify protocol, host, path, params, hash
6. **Reconstruct** — Get updated URL with proper encoding
7. **Copy or download** — Individual components or full URL

## Common Use Cases

### 1. Debugging OAuth / Redirect Flows
```
# Authorization callback (hard to read)
https://app.example.com/callback?code=4%2F0AX4XfWi...&scope=email+profile&state=xyz#fragment

# Parsed → Clear structure:
Protocol: https
Host: app.example.com
Path: /callback
Query:
  code: 4/0AX4XfWi... (decoded)
  scope: email profile
  state: xyz
Hash: fragment
```

### 2. Analyzing Tracking Parameters
```javascript
// Marketing URL
https://shop.example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_content=banner1&gclid=EAIaIQobChMI...

// Parse → See all UTM params at a glance
// Remove unwanted: gclid, fbclid, msclkid (privacy)
```

### 3. Building API Requests
```javascript
// Base URL + dynamic params
const base = "https://api.example.com/v1/users";
const params = new URLSearchParams({
  page: "2",
  limit: "50",
  sort: "created_at",
  order: "desc",
  filter: "active"
});
const url = `${base}?${params}`;
// https://api.example.com/v1/users?page=2&limit=50&sort=created_at&order=desc&filter=active
```

### 4. Deep Linking / Universal Links
```
# iOS Universal Link
https://app.example.com/user/12345?referral=abc&feature=new_dashboard

# Android App Link
https://app.example.com/user/12345?referral=abc&feature=new_dashboard

// Parse → Extract path segments for routing
pathname: /user/12345
params: { referral: "abc", feature: "new_dashboard" }
```

### 5. Cleaning URLs for Sharing
```javascript
// Remove tracking params before sharing
function cleanUrl(urlString) {
  const url = new URL(urlString);
  const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'msclkid', 'igshid', 'mc_cid', 'mc_eid'];
  trackingParams.forEach(p => url.searchParams.delete(p));
  // Remove empty hash
  if (url.hash === '#') url.hash = '';
  return url.toString();
}
```

## URLSearchParams API Deep Dive

```javascript
const url = new URL("https://example.com/search?q=hello+world&tag=js&tag=ts&page=2");

// Get single value (first)
url.searchParams.get("q");        // "hello world" (auto-decoded)
url.searchParams.get("page");     // "2"

// Get all values for key
url.searchParams.getAll("tag");   // ["js", "ts"]

// Check existence
url.searchParams.has("q");        // true

// Iterate all
for (const [key, value] of url.searchParams) {
  console.log(key, value);
}
// q "hello world"
// tag "js"
// tag "ts"
// page "2"

// Modify
url.searchParams.set("page", "3");
url.searchParams.append("tag", "react");
url.searchParams.delete("tag");   // Deletes ALL "tag"
url.searchParams.sort();          // Sort by key

// Serialize
url.searchParams.toString();      // "q=hello+world&page=3&tag=react"
url.toString();                   // Full URL with updated query
```

## URL Validation & Security

### SSRF Protection (Server-Side)
```javascript
// ❌ NEVER trust user-supplied URLs for server fetches
async function fetchUserUrl(url) {
  const response = await fetch(url); // DANGEROUS!
}

// ✅ Validate: allowed protocols, no private IPs, no localhost
function validateUrl(urlString) {
  const url = new URL(urlString);
  
  // 1. Allowed protocols only
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid protocol");
  }
  
  // 2. Resolve hostname to IP, check private ranges
  const ip = await dns.resolve4(url.hostname);
  const privateRanges = [
    /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^127\./, /^169\.254\./, /^::1$/, /^fe80::/
  ];
  if (privateRanges.some(r => r.test(ip[0]))) {
    throw new Error("Private IP not allowed");
  }
  
  // 3. Block metadata endpoints
  if (url.hostname === "169.254.169.254" || url.hostname === "metadata.google.internal") {
    throw new Error("Metadata endpoint blocked");
  }
  
  return url;
}
```

### Client-Side Safety
```javascript
// Sanitize URLs before setting window.location
function safeRedirect(urlString) {
  const url = new URL(urlString, window.location.origin);
  
  // Only allow same-origin or approved domains
  const allowed = ["example.com", "trusted-partner.com"];
  if (!allowed.includes(url.hostname) && url.origin !== window.location.origin) {
    console.warn("Blocked redirect to:", url.hostname);
    return false;
  }
  
  window.location.href = url.toString();
  return true;
}
```

## Common URL Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| **REST API** | `https://api.example.com/v1/users/123/posts?include=comments` | Resource hierarchy |
| **GraphQL** | `https://api.example.com/graphql?query={user{name}}` | Query in URL |
| **WebSocket** | `wss://api.example.com/ws?token=xyz` | Real-time |
| **Data URL** | `data:image/png;base64,iVBORw0K...` | Embedded resources |
| **Blob URL** | `blob:https://example.com/uuid` | Temporary file refs |
| **File URL** | `file:///home/user/doc.pdf` | Local files |
| **Mailto** | `mailto:user@example.com?subject=Hello&body=Test` | Email links |
| **Tel** | `tel:+1-555-123-4567` | Phone links |
| **Intent (Android)** | `intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end` | App deep links |

## Programming Language Examples

### JavaScript / TypeScript (Native)
```typescript
// Parse
const url = new URL("https://user:pass@sub.example.com:8080/path?foo=bar#baz");
console.log(url.protocol);     // "https:"
console.log(url.hostname);     // "sub.example.com"
console.log(url.port);         // "8080"
console.log(url.pathname);     // "/path"
console.log(url.searchParams.get("foo")); // "bar"
console.log(url.hash);         // "#baz"

// Build
const apiUrl = new URL("https://api.example.com/v1/users");
apiUrl.searchParams.set("page", "2");
apiUrl.searchParams.set("limit", "50");
// "https://api.example.com/v1/users?page=2&limit=50"

// Relative resolution
const absolute = new URL("/api/users", "https://example.com");
// "https://example.com/api/users"
```

### Python
```python
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Parse
url = "https://user:pass@sub.example.com:8080/path?foo=bar&tag=a&tag=b#baz"
parsed = urlparse(url)
print(parsed.scheme)      # https
print(parsed.netloc)      # user:pass@sub.example.com:8080
print(parsed.path)        # /path
print(parsed.query)       # foo=bar&tag=a&tag=b
print(parsed.fragment)    # baz

# Query params as dict (lists for multiples)
params = parse_qs(parsed.query)
print(params)             # {'foo': ['bar'], 'tag': ['a', 'b']}

# Build
new_query = urlencode({"page": "2", "limit": "50"}, doseq=True)
new_url = urlunparse(("https", "api.example.com", "/v1/users", "", new_query, ""))
# https://api.example.com/v1/users?page=2&limit=50
```

### Go
```go
import (
    "net/url"
    "fmt"
)

func main() {
    // Parse
    u, _ := url.Parse("https://user:pass@sub.example.com:8080/path?foo=bar#baz")
    fmt.Println(u.Scheme)     // https
    fmt.Println(u.Host)       // user:pass@sub.example.com:8080
    fmt.Println(u.Path)       // /path
    fmt.Println(u.RawQuery)   // foo=bar
    fmt.Println(u.Fragment)   // baz

    // Query params
    q := u.Query()
    fmt.Println(q.Get("foo"))     // bar
    fmt.Println(q["tag"])         // [a b]

    // Build
    api := &url.URL{
        Scheme: "https",
        Host: "api.example.com",
        Path: "/v1/users",
    }
    api.Query().Set("page", "2")
    fmt.Println(api.String()) // https://api.example.com/v1/users?page=2
}
```

### Rust
```rust
use url::Url;

fn main() {
    // Parse
    let url = Url::parse("https://user:pass@sub.example.com:8080/path?foo=bar#baz").unwrap();
    println!("Scheme: {}", url.scheme());
    println!("Host: {}", url.host_str().unwrap());
    println!("Port: {:?}", url.port());
    println!("Path: {}", url.path());
    println!("Query: {}", url.query().unwrap_or(""));
    println!("Fragment: {}", url.fragment().unwrap_or(""));

    // Query params
    let params: Vec<_> = url.query_pairs().collect();
    println!("{:?}", params); // [("foo", "bar")]

    // Build
    let mut api = Url::parse("https://api.example.com/v1/users").unwrap();
    api.query_pairs_mut().append_pair("page", "2");
    println!("{}", api); // https://api.example.com/v1/users?page=2
}
```

### Command Line
```bash
# Node.js
node -e "console.log(new URL(process.argv[1]).searchParams.get('foo'))" \
  "https://example.com?foo=bar"

# Python
python3 -c "
from urllib.parse import urlparse, parse_qs
import sys
u = urlparse(sys.argv[1])
print(parse_qs(u.query))
" "https://example.com?foo=bar&foo=baz"

# jq (for JSON APIs with URL fields)
echo '{"url": "https://example.com?foo=bar"}' | jq -r '.url | split("?")[1] | split("&") | map(split("=")) | from_entries'
```

## FAQ

**Why does `new URL("example.com")` throw?**
Invalid URL — must include protocol (`https://example.com`). Use `new URL("example.com", "https://base.com")` for relative resolution.

**How do I handle URLs without protocol?**
```javascript
function parseMaybeUrl(input) {
  try { return new URL(input); } catch {}
  try { return new URL("https://" + input); } catch {}
  return null;
}
```

**What's the difference between `searchParams.get()` and `getAll()`?**
`get()` returns first value. `getAll()` returns array of all values for that key.

**Can I parse `mailto:` and `tel:` URLs?**
Yes — `new URL("mailto:user@example.com?subject=Test")` works. Protocol-specific properties vary.

**How do I remove the hash/fragment?**
`url.hash = ""` or `url.href = url.origin + url.pathname + url.search`

**Why are my query params in wrong order?**
`URLSearchParams` preserves insertion order. Use `.sort()` for deterministic ordering.

**Is there a file size limit for URL parsing?**
No practical limit — URLs are typically <2KB. Browser limit is ~2MB for `URL` constructor.

**Does the tool decode percent-encoding automatically?**
Yes — `searchParams.get()` returns decoded strings. Raw access: `url.search` (encoded), `url.searchParams.toString()` (re-encoded).

## Related Tools

- [URL Encoder/Decoder](/tools/url-encoder) — Percent-encode/decode strings
- [HTTP Header Parser](/tools/http-header-parser) — Parse headers including `Location`, `Referer`
- [Base64 Decoder](/tools/base64-decoder) — Decode data URLs
- [JSON Formatter](/tools/json-formatter) — Format JSON API responses
- [JWT Decoder](/tools/jwt-decoder) — Parse tokens in URL fragments

## References

- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 3987 — Internationalized Resource Identifiers (IRIs)](https://www.rfc-editor.org/rfc/rfc3987)
- [MDN: URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [OWASP: SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Google: URL Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)

---

*Parse URLs now → [Free URL Parser](/tools/url-parser) — Break down any URL into components. Decode query params, edit, reconstruct. 100% client-side.*