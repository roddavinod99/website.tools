# DNS Troubleshooting Guide

## Why DNS Matters

DNS (Domain Name System) translates human-readable domain names into IP addresses. When DNS breaks, websites become unreachable, emails fail, and services become inaccessible — often with cryptic error messages that don't point to DNS as the root cause.

DevStackIO's [DNS Lookup Tool](/tools/dns-lookup) performs authoritative DNS queries from our servers, showing you exactly what the global DNS system returns for any domain. All results include TTL, record type, and response time.

## DNS Record Types

| Type | Purpose | Example Value |
|------|---------|---------------|
| **A** | IPv4 address | `93.184.216.34` |
| **AAAA** | IPv6 address | `2606:2800:220:1:248:1893:25c8:1946` |
| **CNAME** | Alias to another name | `www.example.com` → `example.com` |
| **MX** | Mail exchange (priority) | `10 mail.example.com` |
| **TXT** | Text data (SPF, DKIM, verification) | `"v=spf1 include:_spf.google.com ~all"` |
| **NS** | Name server | `ns1.example.com` |
| **SOA** | Start of Authority (zone admin) | `ns1.example.com admin.example.com 2024010101 7200 3600 1209600 3600` |
| **PTR** | Reverse DNS (IP → name) | `34.216.184.93.in-addr.arpa` → `example.com` |
| **CAA** | Certificate Authority Authorization | `0 issue "letsencrypt.org"` |
| **SRV** | Service location | `_sip._tcp.example.com 10 5060 sipserver.example.com` |

## Common DNS Issues & Solutions

### 1. Website Not Loading / `NXDOMAIN`

**Symptoms**: Browser shows "Server not found", "DNS_PROBE_FINISHED_NXDOMAIN"

**Diagnosis**:
```bash
# Check if domain exists
dig example.com A +short
# No output = NXDOMAIN

# Check NS records
dig example.com NS +short
# Should return authoritative name servers
```

**Causes & Fixes**:
- Domain expired → Renew at registrar
- NS records wrong → Update to correct nameservers at registrar
- DNS propagation delay → Wait up to 48 hours (check with `dig @8.8.8.8 example.com`)
- Typos in domain → Verify spelling

### 2. Intermittent Resolution

**Symptoms**: Site loads sometimes, fails other times

**Diagnosis**:
```bash
# Check multiple resolvers
dig @8.8.8.8 example.com A
dig @1.1.1.1 example.com A
dig @9.9.9.9 example.com A

# Check for round-robin / load balancer
dig example.com A +short
# Multiple IPs returned = round-robin
```

**Causes & Fixes**:
- Multiple NS with inconsistent records → Ensure all nameservers have identical zones
- TTL too low → Increase TTL (3600+ seconds for stable records)
- GeoDNS returning different IPs → Expected behavior for CDN/geo-routing

### 3. Email Delivery Failures

**Symptoms**: Bounces, spam folder, "SPF fail", "DKIM fail", "DMARC fail"

**Diagnosis**:
```bash
# Check MX records
dig example.com MX +short

# Check SPF (TXT at root or _spf)
dig example.com TXT +short | grep spf

# Check DKIM (selector._domainkey)
dig selector._domainkey.example.com TXT +short

# Check DMARC (_dmarc)
dig _dmarc.example.com TXT +short
```

**Causes & Fixes**:
| Issue | Record | Fix |
|-------|--------|-----|
| No MX | Missing MX | Add MX pointing to mail server |
| SPF fail | TXT at root | Add `v=spf1 include:_spf.provider.com ~all` |
| DKIM fail | selector._domainkey | Publish DKIM public key from mail provider |
| DMARC fail | _dmarc | Add `v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com` |

### 4. SSL/TLS Certificate Issues

**Symptoms**: "Certificate not valid", "CA not authorized"

**Diagnosis**:
```bash
# Check CAA records
dig example.com CAA +short
# 0 issue "letsencrypt.org" — only Let's Encrypt allowed
```

**Causes & Fixes**:
- CAA restricts CA → Add your CA to CAA record
- No CAA → Any CA can issue (less secure but more flexible)

### 5. Subdomain Not Working

**Symptoms**: `api.example.com` fails, `www.example.com` works

**Diagnosis**:
```bash
# Check specific subdomain
dig api.example.com A +short
dig api.example.com CNAME +short

# Check wildcard
dig *.example.com A +short
```

**Causes & Fixes**:
- Missing record → Add A/CNAME for subdomain
- Wildcard not configured → Add `*.example.com` CNAME or A record
- CNAME at apex not allowed → Use A/ALIAS/ANAME at root, CNAME for subdomains

### 6. IPv6 Connectivity Issues

**Symptoms**: Site works on IPv4, fails on IPv6 (or vice versa)

**Diagnosis**:
```bash
# Check AAAA records
dig example.com AAAA +short

# Test IPv6 connectivity
curl -6 https://example.com
# or
ping6 example.com
```

**Causes & Fixes**:
- Missing AAAA → Add IPv6 address to DNS
- Server not listening on IPv6 → Configure web server for `::`
- Firewall blocking IPv6 → Allow port 80/443 on IPv6

## Using DevStackIO DNS Lookup Tool

1. **Open the tool** — [DevStackIO DNS Lookup](/tools/dns-lookup)
2. **Enter domain** — `example.com` or subdomain
3. **Select record type** — A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, SRV, PTR, or **ALL**
4. **Choose resolver** — Cloudflare (1.1.1.1), Google (8.8.8.8), Quad9 (9.9.9.9), or System default
5. **Query** — Click "Lookup" — results appear with TTL, response time, status
6. **Compare resolvers** — Run same query against multiple resolvers to detect inconsistencies

## DNS Propagation & Caching

### TTL (Time To Live)
- **TTL = how long resolvers cache the record**
- Lower TTL = faster propagation, more query load
- Higher TTL = slower propagation, less load

**Recommended TTLs**:
| Record Type | TTL |
|-------------|-----|
| A/AAAA (stable) | 3600 (1 hour) to 86400 (24 hours) |
| A/AAAA (changing soon) | 300 (5 min) to 600 (10 min) |
| CNAME | 3600+ |
| MX | 3600+ |
| TXT (SPF/DKIM/DMARC) | 3600+ |
| NS | 86400+ |

### Checking Propagation
```bash
# Query authoritative directly (bypass cache)
dig @ns1.example.com example.com A

# Query multiple public resolvers
for ns in 8.8.8.8 1.1.1.1 9.9.9.9 208.67.222.222; do
  echo "=== $ns ==="
  dig @$ns example.com A +short
done
```

### Flushing Local Cache
```bash
# Linux (systemd-resolved)
sudo systemd-resolve --flush-caches

# Linux (nscd)
sudo systemctl restart nscd

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Browser (Chrome)
chrome://net-internals/#dns → "Clear host cache"
```

## DNS Security

### DNSSEC
- **Purpose**: Cryptographically verify DNS responses
- **Check**: `dig example.com DNSKEY +dnssec`
- **Enable**: At registrar + DNS provider (Cloudflare, Route53, etc.)

### DANE / TLSA
- **Purpose**: Bind TLS certificates to DNS
- **Record**: `_443._tcp.example.com TLSA 3 1 1 <hash>`
- **Use**: Email (SMTP), HTTPS validation

### DNS over HTTPS (DoH) / DNS over TLS (DoT)
- **Purpose**: Encrypt DNS queries
- **DoH**: `https://dns.google/dns-query` (port 443)
- **DoT**: `tls://1.1.1.1` (port 853)

## Programming: DNS Queries

### JavaScript (DoH)
```javascript
async function dnsLookup(domain, type = 'A') {
  const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`;
  const response = await fetch(url, { headers: { 'Accept': 'application/dns-json' } });
  return response.json();
}

// Usage
const result = await dnsLookup('example.com', 'A');
console.log(result.Answer); // [{name: "example.com", type: 1, TTL: 3600, data: "93.184.216.34"}]
```

### Python
```python
import dns.resolver

def dns_lookup(domain, record_type='A'):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['1.1.1.1', '8.8.8.8']  # Custom resolvers
    try:
        answers = resolver.resolve(domain, record_type)
        return [str(r) for r in answers]
    except dns.resolver.NXDOMAIN:
        return []
    except dns.exception.DNSException as e:
        return [f"Error: {e}"]

# Usage
print(dns_lookup('example.com', 'A'))
print(dns_lookup('example.com', 'MX'))
```

### Go
```go
import (
    "github.com/miekg/dns"
)

func dnsLookup(domain, recordType string) ([]string, error) {
    m := new(dns.Msg)
    m.SetQuestion(dns.Fqdn(domain), dns.StringToType[recordType])
    
    c := new(dns.Client)
    r, _, err := c.Exchange(m, "1.1.1.1:53")
    if err != nil { return nil, err }
    
    var results []string
    for _, ans := range r.Answer {
        results = append(results, ans.String())
    }
    return results, nil
}
```

### Command Line
```bash
# dig (comprehensive)
dig example.com A +short
dig example.com MX +short
dig example.com TXT +short
dig example.com ANY +noall +answer

# host (simple)
host example.com
host -t MX example.com

# nslookup (interactive)
nslookup example.com
nslookup -type=MX example.com

# drill (LDNS)
drill example.com A
```

## FAQ

**Why does `dig` return different IPs than my browser?**
Browser may use DoH (Cloudflare/Google) while `dig` uses system resolver. Try `dig @1.1.1.1 example.com`.

**How long does DNS propagation take?**
Depends on TTL. With TTL=3600, up to 1 hour. With TTL=86400, up to 24 hours. Check multiple resolvers.

**Can I have CNAME at root (@)?**
No — RFC prohibits CNAME at zone apex. Use A record, or ALIAS/ANAME (provider-specific).

**Why does my SPF record show "PermError: too many DNS lookups"?**
SPF has a 10-lookup limit. Flatten includes: `v=spf1 ip4:1.2.3.4 ip4:5.6.7.8 ~all` instead of multiple `include:`.

**What's the difference between `~all` and `-all` in SPF?**
- `~all` = SoftFail (accept but mark suspicious)
- `-all` = HardFail (reject)

**How do I delegate a subdomain to another DNS provider?**
Add NS records at parent: `api.example.com NS ns1.otherprovider.com`

## Related Tools
- [DNS Lookup](/tools/dns-lookup) — Authoritative queries, multiple resolvers, all record types
- [IP Lookup](/tools/ip-lookup) — Geolocation, ASN, reverse DNS
- [SSL Certificate Checker](/tools/ssl-checker) — Certificate validation, expiry
- [Port Scanner](/tools/port-scanner) — Check if ports are open

## References
- [RFC 1034/1035 — DNS](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 4034/4035 — DNSSEC](https://www.rfc-editor.org/rfc/rfc4034)
- [RFC 7208 — SPF](https://www.rfc-editor.org/rfc/rfc7208)
- [RFC 6376 — DKIM](https://www.rfc-editor.org/rfc/rfc6376)
- [RFC 7489 — DMARC](https://www.rfc-editor.org/rfc/rfc7489)
- [RFC 8659 — CAA](https://www.rfc-editor.org/rfc/rfc8659)
---

## Related Resources

## Related Guides

- [JSON Errors & Fixes](/guides/troubleshooting/json-errors)
- [JWT Decoding](/guides/troubleshooting/jwt-decoding)
- [Regex Debugging](/guides/troubleshooting/regex-debugging)
- [Hash Verification](/guides/troubleshooting/hash-verification)
- [Timestamp Conversion](/guides/troubleshooting/timestamp-conversion)

## Related Tools

- [dns-lookup](/tools/dns-lookup)

