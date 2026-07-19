## Why Decode JWTs?

JWT (JSON Web Token) is the standard for stateless auth. But when something breaks — 401 errors, expired tokens, wrong claims, CORS issues — you need to *see* what's inside. Without a decoder, you're guessing.

DevStackIO's [JWT Decoder](/tools/jwt-decoder) lets you paste any token and instantly see:
- **Header** — Algorithm, token type, key ID
- **Payload** — Claims (sub, exp, iat, roles, permissions, custom)
- **Signature** — Verification status (if public key provided)

All client-side. Your tokens never leave your browser.

---

## JWT Anatomy Refresher

A JWT is three Base64URL-encoded parts joined by dots:

```
xxxxx.yyyyy.zzzzz
│     │     │
│     │     └─ Signature
│     └─────── Payload (claims)
└───────────── Header
```

### Header (Example)
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "2024-01-01"
}
```

| Field | Purpose |
|-------|---------|
| `alg` | Signing algorithm (HS256, RS256, ES256, EdDSA) |
| `typ` | Always "JWT" |
| `kid` | Key ID for key rotation |
| `cty` | Content type (rare) |
| `jku` | JWK Set URL (rare) |

### Payload / Claims (Example)
```json
{
  "sub": "user_12345",
  "name": "Alice",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "iat": 1704067200,
  "exp": 1704153600,
  "nbf": 1704067200,
  "iss": "https://auth.example.com",
  "aud": "api.example.com",
  "jti": "abc123def456"
}
```

| Claim | Name | Required? | Description |
|-------|------|-----------|-------------|
| `iss` | Issuer | No | Who created the token |
| `sub` | Subject | No | User/entity ID (unique) |
| `aud` | Audience | No | Who the token is for |
| `exp` | Expiration | **Yes (best practice)** | Unix timestamp — **must be future** |
| `nbf` | Not Before | No | Token not valid before this time |
| `iat` | Issued At | No | Unix timestamp — when created |
| `jti` | JWT ID | No | Unique token ID (prevent replay) |
| `*` | Custom | No | Your app's data (roles, perms, etc.) |

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```
Or RSA/ECDSA/EdDSA for asymmetric. **Never trust a token without verifying the signature.**

---

## Step-by-Step: Decode & Debug a JWT

### 1. Get the Token
Sources:
- **Browser DevTools** → Application → Local Storage / Cookies → `access_token`
- **Network tab** → Authorization header: `Bearer eyJhbGc...`
- **React/Vue DevTools** → State → auth token
- **Mobile** → Proxy (Charles/Proxyman) → Inspect requests
- **Logs** → Search for `Bearer` or `eyJ`

### 2. Open the Decoder
[tools.devstackio.com/tools/jwt-decoder](/tools/jwt-decoder)

### 3. Paste the Token
- Auto-detects JWT format (3 parts, Base64URL)
- Shows **raw parts** and **decoded JSON** side by side
- Highlights syntax errors in red

### 4. Analyze the Output

#### Header Tab
- ✅ `alg` matches your expectation (RS256 ≠ HS256)
- ✅ `kid` exists if using key rotation
- ⚠️ `alg: "none"` — **Critical vulnerability** (reject immediately)

#### Payload Tab
| Check | What to Look For |
|-------|------------------|
| **exp** | `exp > now`? (Green = valid, Red = expired) |
| **nbf** | `nbf < now`? (Token not yet valid) |
| **iat** | Reasonable? (Not years in past/future) |
| **iss** | Matches your auth server? |
| **aud** | Includes your API/client ID? |
| **sub** | Correct user ID? |
| **Custom claims** | Roles, permissions, tenant, scope present? |

#### Signature Tab
- **No key provided** → "Signature verification skipped"
- **HS256** → Paste secret → ✅ Valid / ❌ Invalid
- **RS256/ES256** → Paste **public key** (PEM) or **JWKS URL** → Auto-fetch + verify
- **JWKS** → Enter `https://auth.example.com/.well-known/jwks.json` → Auto-rotate keys

### 5. Debug Common Issues

| Symptom | Likely Cause | Decoder Reveals |
|---------|--------------|-----------------|
| `401 Unauthorized` | Token expired | `exp` < now |
| `403 Forbidden` | Missing scope/role | `permissions` / `roles` array |
| `Invalid token` | Wrong algorithm | `alg` mismatch (HS256 vs RS256) |
| `Key not found` | `kid` rotation | `kid` in header ≠ JWKS keys |
| `Audience invalid` | Wrong `aud` claim | `aud` ≠ your API identifier |
| `Issuer invalid` | Wrong auth server | `iss` ≠ expected |
| `Token not yet valid` | Clock skew | `nbf` > now / `iat` > now |

---

## Algorithm Deep Dive

| Algorithm | Type | Key | Use Case | Security Notes |
|-----------|------|-----|----------|----------------|
| **HS256** | HMAC | Shared secret | Simple apps, single service | Secret must be 256+ bits. Rotate periodically. |
| **HS384/512** | HMAC | Shared secret | Higher security needs | Longer tags, same secret mgmt issues |
| **RS256** | RSA | Public/Private | **Standard for auth servers** | Public key verifiable by anyone. Key rotation via JWKS. |
| **RS384/512** | RSA | Public/Private | High security | Larger keys, slower |
| **ES256** | ECDSA | Public/Private | Mobile, IoT (smaller keys) | P-256 curve. Faster verify than RSA. |
| **ES384/512** | ECDSA | Public/Private | High security | P-384, P-521 curves |
| **EdDSA** | Ed25519 | Public/Private | Modern, fast, small | **Recommended for new systems**. No RNG needed for signing. |
| **PS256** | RSA-PSS | Public/Private | RSA with probabilistic sig | More secure than PKCS#1 v1.5 |

### ⚠️ Algorithm Confusion Attack
If your server accepts **both** HS256 and RS256, attacker can:
1. Get public key (from JWKS)
2. Sign token with HS256 using public key as secret
3. Server verifies with HS256 (public key) → **Accepts forged token**

**Fix:** Explicitly configure expected algorithm(s). Never auto-detect.

---

## Verifying Signatures in the Decoder

### HS256 (Symmetric)
1. Select "HS256" in algorithm dropdown
2. Paste **secret** (base64 or raw string)
3. Click "Verify" → ✅ Valid / ❌ Invalid

### RS256/ES256 (Asymmetric) — Public Key
1. Select algorithm
2. Paste **PEM public key**:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```
3. Or paste **JWK**:
```json
{"kty":"RSA","e":"AQAB","n":"...","kid":"2024-01"}
```
4. Click "Verify"

### JWKS (Key Rotation) — Best for Production
1. Enter JWKS URL: `https://auth.example.com/.well-known/jwks.json`
2. Decoder fetches keys, matches `kid` from header
3. Verifies with correct key automatically
4. Caches for 5 min (configurable)

---

## Time & Clock Skew Handling

JWT times are Unix timestamps (seconds since 1970-01-01 UTC).

### The Decoder Shows
- **Human readable** — "Jan 1, 2024 12:00:00 UTC"
- **Relative** — "Expired 2 hours ago" / "Expires in 15 minutes"
- **Raw** — `1704153600`

### Clock Skew Best Practice
Servers should accept tokens within a **leeway window** (typically 30-60 seconds):

```
valid if: (now - leeway) < exp AND (now + leeway) > nbf
```

Decoder shows "Valid with 30s leeway" if applicable.

### Common Time Bugs
| Bug | Symptom | Fix |
|-----|---------|-----|
| Server clock behind | Valid tokens rejected | NTP sync |
| Client clock ahead | Token seems expired early | NTP sync |
| `exp` in milliseconds | Token expires in year 50000 | Divide by 1000 |
| Missing `exp` | Token never expires | **Always set exp** |

---

## Token Debugging Checklist

When a JWT fails, verify in order:

1. **Format** — 3 parts, valid Base64URL, no extra whitespace
2. **Header** — `alg` expected, `kid` present if JWKS
3. **Payload** — `exp` future, `nbf` past, `iss`/`aud` match
4. **Signature** — Verifies with correct key/algorithm
5. **Claims** — Required custom claims present (role, tenant, scope)
6. **Revocation** — Check `jti` against blocklist (if implemented)
7. **Scope** — Token has required permissions for endpoint

---

## Security: What NOT to Put in JWTs

| ❌ Never Put in JWT | Why |
|---------------------|-----|
| Passwords / secrets | Anyone with token sees them |
| PII (SSN, DOB, address) | Token may be logged |
| Credit card data | PCI violation |
| Full user objects | Token size, exposure |
| Database IDs (predictable) | Enumeration attacks |
| Internal service URLs | Info disclosure |

| ✅ Safe in JWT | Notes |
|----------------|-------|
| User ID (`sub`) | Opaque, non-guessable (UUID) |
| Roles / permissions | Minimal set |
| Tenant / org ID | For multi-tenancy |
| Session ID (`jti`) | For revocation |
| Expiration (`exp`) | **Always** |
| Issued at (`iat`) | For replay detection |

---

## Advanced: Token Introspection vs. Local Validation

| | Local Validation (Decoder) | Introspection Endpoint |
|--|---------------------------|------------------------|
| **Speed** | Instant (ms) | Network round-trip |
| **Revocation** | ❌ No (unless short exp + blocklist) | ✅ Real-time |
| **Privacy** | ✅ Token never leaves | ❌ Token sent to auth server |
| **Load** | Zero on auth server | Scales with requests |
| **Use case** | API gateways, microservices | High-security, financial |

**Hybrid approach:** Short-lived access tokens (5-15 min) validated locally + refresh token introspection.

---

## FAQ

**Can I decode without verifying?**
Yes — decoder shows header/payload without key. But **never trust** unverified tokens in production.

**Why does my token have 4 parts?**
It's likely a **nested JWT** (JWT inside JWT) or **JWE** (encrypted). Decoder handles both — paste and it auto-detects.

**What's `x5c` in header?**
X.509 certificate chain. Used in mTLS / mutual TLS. Decoder shows cert details.

**Can I edit and re-encode?**
Use [JWT Generator](/tools/jwt-generator) to create new tokens. Don't manually edit Base64.

**Is there a VS Code extension?**
Not official. Copy token → paste in decoder → done.

**My token works in Postman but not browser?**
Check: `SameSite` cookies, CORS, `Authorization` header vs cookie, token storage (localStorage vs httpOnly cookie).

---

## Related Tools

- [JWT Generator](/tools/jwt-generator) — Create tokens for testing
- [JWT Generator (Advanced)](/tools/jwt-generator) — RS256/ES256 with key upload
- [Base64 Decoder](/tools/base64-decoder) — Raw part decoding
- [JSON Formatter](/tools/json-formatter) — Pretty-print payload
- [Timestamp Converter](/tools/timestamp-converter) — `exp`/`iat` to human time

---

*Decode your token now → [Free JWT Decoder](/tools/jwt-decoder) — Paste, inspect, verify. Zero upload, total privacy, supports HS256/RS256/ES256/EdDSA + JWKS.*