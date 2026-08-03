## Why Look Up DNS Records?

DNS (Domain Name System) translates human-readable domains to IP addresses. But DNS holds much more — mail servers (MX), name servers (NS), text records (TXT for SPF/DKIM/DMARC), aliases (CNAME), and IPv6 addresses (AAAA). A DNS lookup tool reveals this infrastructure instantly.

DevStackIO's [DNS Lookup](/tools/dns-lookup) queries A, AAAA, MX, NS, TXT, CNAME, SOA, CAA, DS, DNSKEY — with DNSSEC validation, resolver selection, and raw response display. All client-side via DNS-over-HTTPS (DoH).

## DNS Record Types

| Type | Purpose | Example Value |
|------|---------|---------------|
| **A** | IPv4 address | `93.184.216.34` |
| **AAAA** | IPv6 address | `2606:2800:220:1:248:1893:25c8:1946` |
| **MX** | Mail exchanger (priority + host) | `10 mail.example.com` |
| **NS** | Authoritative name server | `ns1.example.com` |
| **CNAME** | Canonical name (alias) | `www.example.com` |
| **TXT** | Arbitrary text (SPF, DKIM, verification) | `"v=spf1 include:_spf.google.com ~all"` |
| **SOA** | Start of Authority (zone metadata) | `ns1.example.com hostmaster.example.com 2024011501 7200 3600 1209600 3600` |
| **CAA** | Certification Authority Authorization | `0 issue "letsencrypt.org"` |
| **DS** | Delegation Signer (DNSSEC) | `12345 8 2 ABCDEF...` |
| **DNSKEY** | DNSSEC public key | `257 3 8 AwEAAc...` |
| **PTR** | Reverse DNS (IP → domain) | `example.com` |
| **SRV** | Service location | `10 5 443 server.example.com` |
| **TLSA** | TLS Authentication (DANE) | `3 1 1 ABCDEF...` |

## How DNS Resolution Works

```
User types: example.com
                │
                ▼
┌─────────────────────────────────────┐
│ 1. Check local cache (browser, OS)  │
└─────────────────────────────────────┘
                │
                ▼ (miss)
┌─────────────────────────────────────┐
│ 2. Recursive resolver (ISP, 1.1.1.1,│
│    8.8.8.8, DoH provider)           │
└─────────────────────────────────────┘
                │
                ▼ (if not cached)
┌─────────────────────────────────────┐
│ 3. Root servers (.)                 │
│    → .com TLD servers               │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ 4. TLD servers (.com)               │
│    → example.com authoritative NS   │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│ 5. Authoritative nameservers        │
│    → A/AAAA record returned         │
└─────────────────────────────────────┘
```

**TTL (Time To Live)**: Seconds a record can be cached. Lower = faster propagation, higher query load.

## How to Look Up DNS Records Online (Step by Step)

1. **Open the lookup tool** — [DevStackIO DNS Lookup](/tools/dns-lookup)
2. **Enter domain** — `example.com` or subdomain `www.example.com`
3. **Select record type** — A, AAAA, MX, NS, TXT, CNAME, SOA, CAA, ALL
4. **Choose resolver** — Cloudflare (1.1.1.1), Google (8.8.8.8), Quad9 (9.9.9.9), System default
5. **Enable DNSSEC** — Toggle validation (green = valid, red = invalid, yellow = unsupported)
6. **Query** — Click "Lookup" — results appear in structured table
7. **View raw response** — Expand for full DNS message (flags, authority, additional)
8. **Export** — Copy JSON, download zone file format

## Common Use Cases

### 1. Verify DNS Propagation
```
After changing A record:
- Check multiple resolvers (1.1.1.1, 8.8.8.9, 9.9.9.9)
- All should show new IP within TTL period
- Tool shows resolver IP for each result
```

### 2. Email Configuration (MX, SPF, DKIM, DMARC)
```bash
# MX Records
MX 10 mail.example.com
MX 20 backup-mail.example.com

# SPF (TXT)
"v=spf1 include:_spf.google.com ~all"

# DKIM (TXT at selector._domainkey)
"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."

# DMARC (TXT at _dmarc)
"v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"
```

### 3. Subdomain & CNAME Verification
```
www.example.com → CNAME → example.com
blog.example.com → CNAME → example.github.io
shop.example.com → CNAME → myshop.shopify.com

# Check: CNAME target resolves correctly
```

### 4. CDN / Load Balancer Verification
```
example.com → A → 192.0.2.1 (origin)
cdn.example.com → CNAME → d123.cloudfront.net
                 → A → 52.84.123.45 (edge)
                 → A → 54.230.12.34 (edge)
```

### 5. DNSSEC Validation
```
Domain: example.com
DS record at .com: 12345 8 2 ABCDEF...
DNSKEY at example.com: 257 3 8 AwEAAc...
Validation: ✅ Chain of trust verified
            ✅ Signatures valid
            ⚠️ Algorithm 8 (RSASHA256) - OK
```

### 6. CAA Record Check (Before SSL Cert)
```
CAA 0 issue "letsencrypt.org"
CAA 0 issue "digicert.com"
CAA 0 iodef "mailto:security@example.com"

# Only listed CAs can issue certs
# Prevents unauthorized issuance
```

### 7. Debugging "Site Not Loading"
```
Checklist:
☐ A/AAAA records exist and correct?
☐ NS records match registrar?
☐ TTL not too high (propagation delay)?
☐ DNSSEC not broken?
☐ Resolver not blocking (try 1.1.1.1, 8.8.8.8)?
☐ CNAME chain not too long (>5)?
```

## DNS-over-HTTPS (DoH) vs Traditional DNS

| Aspect | Traditional (UDP/53) | DoH (HTTPS/443) |
|--------|---------------------|-----------------|
| **Privacy** | Plaintext (visible to ISP) | Encrypted (TLS) |
| **Censorship** | Easy to block/filter | Harder to block |
| **Performance** | Lower latency (no TLS) | Slightly higher |
| **Caching** | OS/browser cache | Browser/DoH cache |
| **Port** | 53 (often blocked) | 443 (rarely blocked) |

**Tool uses DoH** via Cloudflare/Google endpoints — your queries encrypted.

## DNS Security: Common Issues

### DNS Hijacking
```
User queries: bank.com
ISP/resolver returns: 192.168.1.100 (fake page)
Protection: DoH, DNSSEC, trusted resolvers
```

### Cache Poisoning
```
Attacker injects fake record into resolver cache
Users get wrong IP for domain
Protection: DNSSEC (cryptographic validation)
```

### Subdomain Takeover
```
CNAME points to expired service (GitHub Pages, Heroku, S3)
Attacker claims subdomain → serves content
Prevention: Monitor CNAME targets, remove stale records
```

### Zone Walking (NSEC)
```
NSEC records reveal all subdomains in zone
NSEC3 (hashed) prevents enumeration
Check: Does domain use NSEC or NSEC3?
```

## Programming: DNS Queries

### JavaScript (DoH via fetch)
```javascript
// Cloudflare DoH
async function dnsLookup(domain, type = 'A') {
  const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/dns-json' }
  });
  const data = await response.json();
  return data.Answer || [];
}

// Usage
const records = await dnsLookup('example.com', 'MX');
records.forEach(r => console.log(r.data, 'TTL:', r.TTL));
```

### Node.js (Native dns module)
```javascript
const dns = require('dns').promises;

async function lookup(domain) {
  const [a, aaaa, mx, ns, txt, soa, cname] = await Promise.all([
    dns.resolve4(domain),
    dns.resolve6(domain),
    dns.resolveMx(domain),
    dns.resolveNs(domain),
    dns.resolveTxt(domain),
    dns.resolveSoa(domain),
    dns.resolveCname(domain).catch(() => []),
  ]);
  return { a, aaaa, mx, ns, txt, soa, cname };
}
```

### Python (dnspython)
```python
import dns.resolver

def lookup(domain):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['1.1.1.1', '8.8.8.8']  # Custom resolvers
    
    results = {}
    for rtype in ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'CAA']:
        try:
            answers = resolver.resolve(domain, rtype)
            results[rtype] = [str(r) for r in answers]
        except dns.resolver.NoAnswer:
            results[rtype] = []
        except dns.resolver.NXDOMAIN:
            return {'error': 'Domain does not exist'}
    return results
```

### Go
```go
import (
    "github.com/miekg/dns"
)

func lookup(domain string) {
    c := &dns.Client{}
    m := &dns.Msg{}
    m.SetQuestion(dns.Fqdn(domain), dns.TypeA)
    
    // Use DoH
    r, _, err := c.Exchange(m, "https://cloudflare-dns.com/dns-query")
    // Parse r.Answer
}
```

### Command Line
```bash
# dig (most versatile)
dig example.com                    # A record
dig example.com AAAA               # AAAA
dig example.com MX                 # MX
dig example.com TXT                # TXT
dig example.com NS                 # NS
dig example.com SOA                # SOA
dig example.com CAA                # CAA
dig example.com ANY                # All (often blocked)
dig @1.1.1.1 example.com           # Specific resolver
dig +dnssec example.com            # DNSSEC
dig +trace example.com             # Full trace from root

# nslookup (interactive)
nslookup example.com
nslookup -type=MX example.com

# host (simple)
host example.com
host -t MX example.com

# drill (LDNS, DNSSEC focus)
drill example.com
drill -D example.com              # DNSSEC validation
```

## FAQ

**Why do different resolvers return different results?**
- Caching (TTL not expired)
- GeoDNS (different IPs by region)
- Split-horizon DNS (internal vs external)
- Resolver blocking/filtering

**What's the difference between `dig` and `nslookup`?**
- `dig`: More detailed, scriptable, supports DoH, DNSSEC
- `nslookup`: Interactive, simpler, deprecated in some distros

**Can I query internal/private DNS?**
No — tool uses public DoH resolvers. For internal DNS, use `nslookup`/`dig` on network.

**Why does my CNAME not resolve?**
- CNAME target doesn't exist (NXDOMAIN)
- CNAME chain too long (>5-10 hops)
- CNAME at apex (not allowed, use ALIAS/ANAME)

**What is DNS propagation?**
Time for changes to reach all resolvers worldwide. Depends on TTL. Can take minutes to 48 hours.

**How do I check if DNSSEC is working?**
Tool shows "DNSSEC Valid" badge. Or: `dig +dnssec example.com` → look for `ad` flag in flags.

**Can I do reverse DNS (PTR)?**
Tool supports forward lookup. For PTR: `dig -x 1.2.3.4` or use [IP Lookup](/tools/ip-lookup).

**Why no ANY query?**
Many resolvers block ANY (amplification attack vector). Query specific types instead.

## Related Tools

- [IP Lookup](/tools/ip-lookup) — Geolocation, ASN, reverse DNS
- [IP Calculator](/tools/ip-calculator) — Subnet, CIDR calculations
- [SSL Certificate Decoder](/tools/ssl-decoder) — Certificate transparency, DNS names
- [HTTP Header Parser](/tools/http-header-parser) — Check `Server`, `X-Powered-By` headers
- [URL Parser](/tools/url-parser) — Parse domain from URLs

## References

- [RFC 1034/1035 — Domain Names](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 8484 — DNS-over-HTTPS (DoH)](https://www.rfc-editor.org/rfc/rfc8484)
- [RFC 4033/4034/4035 — DNSSEC](https://www.rfc-editor.org/rfc/rfc4033)
- [RFC 6844 — CAA Records](https://www.rfc-editor.org/rfc/rfc6844)
- [DNSViz — DNSSEC Visualization](https://dnsviz.net/)
- [MXToolbox — DNS Diagnostics](https://mxtoolbox.com/)
- [Cloudflare DoH](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/)
- [Google DoH](https://developers.google.com/speed/public-dns/docs/doh)

---

*Look up DNS records now → [Free DNS Lookup](/tools/dns-lookup) — A, AAAA, MX, NS, TXT, CNAME, SOA, CAA. DNSSEC validation, multiple resolvers, raw response. Client-side DoH.*