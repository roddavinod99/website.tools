## Why Calculate IP Subnets?

IP subnetting is fundamental to network design — dividing networks into smaller segments for security, performance, and organization. A subnet calculator eliminates manual binary math: CIDR notation, network/broadcast addresses, usable host ranges, wildcard masks, and IPv6 prefixes.

DevStackIO's [IP Calculator](/tools/ip-calculator) and [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator) handle IPv4 and IPv6 — CIDR, netmask, wildcard, host count, subnet splitting, supernetting. All client-side, instant results.

## IPv4 Addressing Basics

### Address Structure
```
IPv4: 32 bits = 4 octets (8 bits each)
Example: 192.168.1.100
Binary:  11000000.10101000.00000001.01100100
         │         │         │         │
         └─ Octet 1 (192)       └─ Octet 4 (100)
```

### CIDR Notation (Classless Inter-Domain Routing)
```
192.168.1.0/24
│           │
│           └─ Prefix length (network bits)
└─ Network address

/24 = 24 network bits, 8 host bits
      = 255.255.255.0 netmask
      = 256 total addresses (2^8)
      = 254 usable hosts (minus network + broadcast)
```

### Traditional Classes (Legacy, for reference)
| Class | First Octet | Default Mask | CIDR | Hosts |
|-------|-------------|--------------|------|-------|
| A | 1-126 | 255.0.0.0 | /8 | 16,777,214 |
| B | 128-191 | 255.255.0.0 | /16 | 65,534 |
| C | 192-223 | 255.255.255.0 | /24 | 254 |
| D | 224-239 | Multicast | — | — |
| E | 240-255 | Reserved | — | — |

**Modern practice**: Ignore classes, use CIDR exclusively.

## Key Calculations

### Network Address
```
IP:       192.168.1.100  (11000000.10101000.00000001.01100100)
Mask:     255.255.255.0  (11111111.11111111.11111111.00000000)
AND:      192.168.1.0    (11000000.10101000.00000001.00000000)
          └─ Network address
```

### Broadcast Address
```
Network:  192.168.1.0    (11000000.10101000.00000001.00000000)
Host bits: 00000000 → set all to 1
Broadcast: 192.168.1.255 (11000000.10101000.00000001.11111111)
```

### Usable Host Range
```
First usable: Network + 1 = 192.168.1.1
Last usable:  Broadcast - 1 = 192.168.1.254
Total usable: 2^(32-prefix) - 2 = 2^8 - 2 = 254
```

### Wildcard Mask (Inverse of Netmask)
```
Netmask:  255.255.255.0  (11111111.11111111.11111111.00000000)
Wildcard: 0.0.0.255      (00000000.00000000.00000000.11111111)
Used in:  Cisco ACLs, OSPF, BGP
```

## IPv4 Quick Reference

| CIDR | Netmask | Wildcard | Total IPs | Usable Hosts | /30 | /31 | /32 |
|------|---------|----------|-----------|--------------|-----|-----|-----|
| /8 | 255.0.0.0 | 0.255.255.255 | 16,777,216 | 16,777,214 | — | — | — |
| /16 | 255.255.0.0 | 0.0.255.255 | 65,536 | 65,534 | — | — | — |
| /24 | 255.255.255.0 | 0.0.0.255 | 256 | 254 | — | — | — |
| /25 | 255.255.255.128 | 0.0.0.127 | 128 | 126 | — | — | — |
| /26 | 255.255.255.192 | 0.0.0.63 | 64 | 62 | — | — | — |
| /27 | 255.255.255.224 | 0.0.0.31 | 32 | 30 | — | — | — |
| /28 | 255.255.255.240 | 0.0.0.15 | 16 | 14 | — | — | — |
| /29 | 255.255.255.248 | 0.0.0.7 | 8 | 6 | — | — | — |
| **/30** | 255.255.255.252 | 0.0.0.3 | **4** | **2** | **PtP links** | — | — |
| **/31** | 255.255.255.254 | 0.0.0.1 | **2** | **2*** | — | **PtP (RFC 3021)** | — |
| **/32** | 255.255.255.255 | 0.0.0.0 | **1** | **1** | — | — | **Single host** |

* /31: Both addresses usable for point-to-point (no network/broadcast)
* /32: Single host route (loopback, host route)

## IPv6 Addressing

### Structure
```
IPv6: 128 bits = 8 hextets (16 bits each, 4 hex chars)
Example: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
Compressed: 2001:db8:85a3::8a2e:370:7334
```

### Prefix Lengths
| Prefix | Use Case | Addresses |
|--------|----------|-----------|
| /128 | Single interface | 1 |
| /64 | **Standard subnet** (SLAAC) | 2^64 ≈ 1.8×10^19 |
| /56 | Typical ISP delegation (256 /64s) | 2^72 |
| /48 | Site allocation (65,536 /64s) | 2^80 |
| /32 | ISP allocation | 2^96 |
| /128 | Loopback (::1) | 1 |

**Key difference**: IPv6 /64 is the minimum subnet for SLAAC. No "wasted" addresses — abundance is the point.

### Special IPv6 Addresses
| Address | Purpose |
|---------|---------|
| `::1/128` | Loopback (localhost) |
| `::/128` | Unspecified (source only) |
| `fe80::/10` | Link-local (auto-configured) |
| `fc00::/7` | Unique Local (ULA, RFC 4193) |
| `ff00::/8` | Multicast |
| `2001:db8::/32` | Documentation (RFC 3849) |
| `2002::/16` | 6to4 tunneling (deprecated) |

## How to Calculate Subnets Online (Step by Step)

1. **Open the calculator** — [DevStackIO IP Calculator](/tools/ip-calculator) (IPv4) or [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator)
2. **Enter IP/CIDR** — `192.168.1.100/24` or `192.168.1.100 255.255.255.0`
3. **Auto-calculate** — All fields populate instantly:
   - Network address
   - Broadcast address
   - First/last usable host
   - Total/usable host count
   - Netmask (dotted, hex, binary)
   - Wildcard mask
   - CIDR notation
4. **Subnet splitting** — Enter "Number of subnets" or "Hosts per subnet" → get child subnets
5. **Supernetting** — Enter multiple networks → get summary route
6. **IPv6** — Switch tab, enter `2001:db8::/48` → get /64 subnets
7. **Export** — Copy table, download CSV, generate network diagram text

## Common Use Cases

### 1. VLAN Design
```
Office network: 10.0.0.0/16 (65,536 hosts)

Split by floor/department:
VLAN 10 (Mgmt):    10.0.0.0/24     (254 hosts)
VLAN 20 (Eng):     10.0.1.0/24     (254 hosts)
VLAN 30 (Sales):   10.0.2.0/24     (254 hosts)
VLAN 40 (Guest):   10.0.3.0/24     (254 hosts)
VLAN 50 (Servers): 10.0.10.0/24    (254 hosts)
VLAN 60 (IoT):     10.0.20.0/24    (254 hosts)
Reserved:          10.0.4.0/22     (1,022 hosts) — growth
```

### 2. Point-to-Point Links (/31 or /30)
```bash
# Router A <-> Router B
Interface: 10.0.100.0/31
  Router A: 10.0.100.0
  Router B: 10.0.100.1
  No broadcast needed (RFC 3021)

# Legacy /30 (4 IPs, 2 usable)
Interface: 10.0.100.0/30
  Network:  10.0.100.0
  Router A: 10.0.100.1
  Router B: 10.0.100.2
  Broadcast: 10.0.100.3
```

### 3. AWS VPC / Cloud Subnetting
```
VPC: 10.0.0.0/16

Public subnets (AZ-a, AZ-b):
  10.0.0.0/20   (4,094 hosts) — AZ-a
  10.0.16.0/20  (4,094 hosts) — AZ-b

Private subnets:
  10.0.32.0/19  (8,190 hosts) — AZ-a
  10.0.64.0/19  (8,190 hosts) — AZ-b

Database subnets:
  10.0.96.0/20  (4,094 hosts) — AZ-a
  10.0.112.0/20 (4,094 hosts) — AZ-b

Reserved: 10.0.128.0/17 (32,766 hosts) — future
```

### 4. IPv6 Site Planning
```
ISP assigns: 2001:db8:1234::/48

Subnet allocation (/64 each):
2001:db8:1234:0000::/64  — DMZ / Public
2001:db8:1234:0001::/64  — Internal LAN
2001:db8:1234:0002::/64  — WiFi / Guest
2001:db8:1234:0003::/64  — Servers
2001:db8:1234:0004::/64  — IoT / OT
...
2001:db8:1234:ffff::/64  — 65,536 subnets available
```

### 5. CIDR Aggregation (Supernetting)
```
Routes to summarize:
192.168.0.0/24
192.168.1.0/24
192.168.2.0/24
192.168.3.0/24

Common prefix: 192.168.0.0/22 (covers .0-.3)
Saves 3 routing table entries
```

## Programming: Subnet Calculations

### JavaScript
```javascript
// IPv4
function ipv4Calc(cidr) {
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr);
  const octets = ip.split('.').map(Number);
  
  // IP to 32-bit integer
  const ipNum = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  
  // Netmask
  const maskNum = ~0 << (32 - prefix);
  const networkNum = ipNum & maskNum;
  const broadcastNum = networkNum | ~maskNum;
  
  // Convert back to dotted
  const toIP = (n) => [
    (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255
  ].join('.');
  
  const totalHosts = 1 << (32 - prefix);
  const usableHosts = totalHosts - 2;
  
  return {
    network: toIP(networkNum),
    broadcast: toIP(broadcastNum),
    firstUsable: toIP(networkNum + 1),
    lastUsable: toIP(broadcastNum - 1),
    totalHosts,
    usableHosts: prefix >= 31 ? totalHosts : usableHosts, // /31, /32 special
    netmask: toIP(maskNum),
    wildcard: toIP(~maskNum & 0xffffffff),
    prefix,
  };
}

// Usage
console.log(ipv4Calc('192.168.1.100/24'));
```

### Python (ipaddress module)
```python
import ipaddress

# IPv4
net = ipaddress.IPv4Network('192.168.1.100/24', strict=False)
print(f"Network: {net.network_address}")
print(f"Broadcast: {net.broadcast_address}")
print(f"Netmask: {net.netmask}")
print(f"Hostmask (wildcard): {net.hostmask}")
print(f"Prefix: {net.prefixlen}")
print(f"Usable hosts: {net.num_addresses - 2}")
print(f"First usable: {net.network_address + 1}")
print(f"Last usable: {net.broadcast_address - 1}")

# Iterate usable hosts
for ip in net.hosts():
    print(ip)  # First 5: 192.168.1.1 ... 192.168.1.254

# Subnet splitting
subnets = list(net.subnets(prefixlen_diff=2))  # /26 subnets
for s in subnets:
    print(s)

# Supernetting
supernet = net.supernet(prefixlen_diff=2)  # /22

# IPv6
net6 = ipaddress.IPv6Network('2001:db8::/48')
print(f"Network: {net6.network_address}")
print(f"Subnets (/64): {list(net6.subnets(new_prefix=64))[:3]}")
```

### Go
```go
import (
    "fmt"
    "net"
)

func main() {
    // IPv4
    _, ipv4Net, _ := net.ParseCIDR("192.168.1.100/24")
    ones, bits := ipv4Net.Mask.Size()
    fmt.Printf("Prefix: /%d\n", ones)
    fmt.Printf("Netmask: %v\n", ipv4Net.Mask)
    fmt.Printf("Network: %v\n", ipv4Net.IP)
    
    // Broadcast (manual for IPv4)
    ip := ipv4Net.IP.To4()
    mask := ipv4Net.Mask
    broadcast := make(net.IP, 4)
    for i := 0; i < 4; i++ {
        broadcast[i] = ip[i] | ^mask[i]
    }
    fmt.Printf("Broadcast: %v\n", broadcast)
    
    // IPv6
    _, ipv6Net, _ := net.ParseCIDR("2001:db8::/48")
    fmt.Printf("IPv6 Network: %v\n", ipv6Net.IP)
    fmt.Printf("IPv6 Prefix: /%d\n", ipv6Net.Mask.Size())
}
```

### Rust (ipnetwork crate)
```rust
use ipnetwork::IpNetwork;

fn main() {
    // IPv4
    let net: IpNetwork = "192.168.1.100/24".parse().unwrap();
    println!("Network: {}", net.network());
    println!("Broadcast: {}", net.broadcast());
    println!("Netmask: {}", net.mask());
    println!("Prefix: /{}", net.prefix());
    println!("Size: {}", net.size());
    
    // Iterate
    for ip in net.iter().take(5) {
        println!("  {}", ip);
    }
    
    // Subnet
    let subnets: Vec<_> = net.subnet(26).unwrap().collect();
    println!("Subnets (/26): {}", subnets.len());
    
    // IPv6
    let net6: IpNetwork = "2001:db8::/48".parse().unwrap();
    let subnets64: Vec<_> = net6.subnet(64).unwrap().collect();
    println!("IPv6 /64 subnets: {}", subnets64.len());
}
```

### Command Line
```bash
# sipcalc (comprehensive)
sipcalc 192.168.1.100/24
sipcalc 2001:db8::/48

# ipcalc (simple)
ipcalc 192.168.1.100/24
ipcalc -b 192.168.1.100/24  # Broadcast
ipcalc -n 192.168.1.100/24  # Network

# python -m ipaddress (Python 3.3+)
python3 -m ipaddress 192.168.1.100/24

# nmap (network scan context)
nmap -sL 192.168.1.0/24  # List hosts without scanning
```

## Special Cases & Gotchas

### /31 and /32 Prefixes
| Prefix | Network | Broadcast | Usable | Use Case |
|--------|---------|-----------|--------|----------|
| /31 | 10.0.0.0 | 10.0.0.1 | 2 (both) | Point-to-point links |
| /32 | 10.0.0.1 | 10.0.0.1 | 1 | Host routes, loopbacks |

### Private RFC 1918 Ranges
| Range | CIDR | Size | Use |
|-------|------|------|-----|
| 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | 16.7M | Large enterprises |
| 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | 1M | Medium networks |
| 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | 65K | Home/small business |

### Reserved / Special
| Range | CIDR | Purpose |
|-------|------|---------|
| 127.0.0.0/8 | Loopback | localhost |
| 169.254.0.0/16 | Link-local | APIPA (DHCP fail) |
| 224.0.0.0/4 | Multicast | 224-239.x.x.x |
| 240.0.0.0/4 | Reserved | Future/experimental |

## FAQ

**Why subtract 2 for usable hosts?**
Network address (all host bits 0) and broadcast (all host bits 1) reserved. Exception: /31 (PtP) and /32 (single host).

**What's the difference between netmask and wildcard?**
Netmask: 1=network, 0=host. Wildcard: inverse (0=match, 1=ignore). Used in ACLs.

**Can I have a /23 network?**
Yes — 512 total, 510 usable. Any prefix /0 to /32 valid.

**How do I calculate subnets for a given host count?**
Find smallest power of 2 ≥ (hosts + 2). Example: 100 hosts → 128 (2^7) → 32-7 = /25.

**What's VLSM?**
Variable Length Subnet Mask — different subnet sizes in same network. Modern routing (OSPF, BGP, EIGRP) supports it.

**Does the tool support IPv6?**
Yes — [IPv6 Calculator](/tools/ipv6-calculator) for ULA, prefix delegation, /64 subnets.

**How do I convert netmask to CIDR?**
Count 1 bits: 255.255.255.0 = 24 ones = /24. Tool does this automatically.

**What about IP address classes?**
Obsolete. Use CIDR. Classes only matter for very old equipment.

## Related Tools

- [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator) — Advanced splitting, VLSM
- [IPv4 Address Converter](/tools/ipv4-address-converter) — Decimal, hex, binary, dotted
- [IPv4 Range Expander](/tools/ipv4-range-expander) — CIDR to IP list
- [IPv6 ULA Generator](/tools/ipv6-ula-generator) — Unique Local Addresses
- [IP Lookup](/tools/ip-lookup) — Geolocation, ASN, reverse DNS

## References

- [RFC 4632 — CIDR](https://www.rfc-editor.org/rfc/rfc4632)
- [RFC 1918 — Private Address Space](https://www.rfc-editor.org/rfc/rfc1918)
- [RFC 3021 — Using /31 Prefixes](https://www.rfc-editor.org/rfc/rfc3021)
- [RFC 4291 — IPv6 Addressing Architecture](https://www.rfc-editor.org/rfc/rfc4291)
- [RFC 4193 — Unique Local IPv6 Addresses](https://www.rfc-editor.org/rfc/rfc4193)
- [ipaddress Python Module](https://docs.python.org/3/library/ipaddress.html)
- [Subnetting Made Easy (Cisco)](https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13788-3.html)

---

*Calculate subnets now → [Free IP Calculator](/tools/ip-calculator) — IPv4/IPv6, CIDR, netmask, wildcard, host range, subnet splitting, supernetting. Client-side, instant.*