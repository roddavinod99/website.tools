## Why Generate UUIDs?

UUID (Universally Unique Identifier) is the standard for generating unique IDs in distributed systems. Unlike auto-incrementing integers, UUIDs can be generated independently on any device without coordination — no central authority, no collisions, no round-trips to a database.

But not all UUIDs are created equal. The version you choose affects:
- **Sortability** — Can you order by creation time?
- **Index performance** — Do database indexes fragment?
- **Privacy** — Does the ID leak MAC addresses or timestamps?
- **Debugging** — Can you tell when a record was created?

DevStackIO's [UUID Generator](/tools/uuid-generator) supports both v4 (random) and v7 (timestamp-ordered) — the two most practical versions for modern applications. All client-side, zero tracking.

## UUID Versions at a Glance

| Version | Method | Sortable? | Use Case | RFC |
|---------|--------|-----------|----------|-----|
| **v1** | Timestamp + MAC address | ✅ Roughly | Legacy systems | RFC 4122 |
| **v2** | DCE Security | ✅ Roughly | Rarely used | RFC 4122 |
| **v3** | MD5 hash (namespace + name) | ❌ | Deterministic IDs | RFC 4122 |
| **v4** | **Random (crypto-secure)** | ❌ | **General purpose** | RFC 4122 |
| **v5** | SHA-1 hash (namespace + name) | ❌ | Deterministic IDs | RFC 4122 |
| **v6** | Timestamp + random (reordered v1) | ✅ Yes | Ordered, privacy-safe | RFC 4122bis |
| **v7** | **Unix timestamp + random** | ✅ **Best** | **Modern default** | RFC 4122bis |
| **v8** | Custom vendor-specific | ✅ Optional | Specialized needs | RFC 4122bis |

**Recommendation**: Use **v7 for new projects** (database keys, event sourcing, audit logs). Use **v4 for compatibility** (existing systems, non-database IDs, when sort order doesn't matter).

## UUID Anatomy

A UUID is 128 bits (16 bytes) displayed as 32 hex characters in 5 groups:
```
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
│        │   │   │   │
│        │   │   │   └─ Node (48 bits in v1, random in v4/v7)
│        │   │   └───── Clock sequence (14 bits)
│        │   └──────── Version (4 bits): 4, 6, 7, 8
│        └──────────── Time high (12 bits in v1/v6/v7)
└──────────────────── Time low (32 bits)
```

### Version & Variant Bits
```
Byte 6:  xxxx MMMM  → Version in high nibble (4=v4, 7=v7)
Byte 8:  NNxx xxxx  → Variant in high bits (10xx = RFC 4122 variant)
```

## UUID v4: Pure Randomness

### Structure
```
Bytes 0-15: All random (except version/variant bits)
```

### Example
```
a1b2c3d4-e5f6-4789-9abc-def012345678
             ↑
             Version 4 (0100)
```

### Pros
- **Simple** — No timestamp, no coordination
- **Privacy** — No timing or machine info leaked
- **Universal** — Works everywhere, no dependencies
- **Collision resistance** — 2^122 possibilities (~5.3×10^36)

### Cons
- **Not sortable** — Random order fragments database indexes
- **No creation time** — Can't derive when ID was generated
- **Index fragmentation** — Random inserts = page splits in B-trees

### When to Use v4
- Non-database identifiers (session IDs, correlation IDs, temp files)
- Systems where sort order doesn't matter
- When you need zero metadata leakage
- Legacy systems expecting RFC 4122 v4

## UUID v7: Timestamp-Ordered (Modern Default)

### Structure (RFC 4122bis / draft-peabody-dispatch-uuid-01)
```
Bytes 0-5:  Unix timestamp (milliseconds since epoch) — 48 bits
Bytes 6-7:  Version (7) + variant + timestamp overflow
Bytes 8-15: Random (62 bits of entropy)
```

### Example
```
018f0a3c-4b2d-7a1b-8c9d-e0f1a2b3c4d5
 ↑
 Timestamp: 2024-01-15 10:30:45.123 UTC
```

### Pros
- **Naturally sortable** — Lexicographic = chronological
- **Database-friendly** — Sequential inserts = minimal index fragmentation
- **Embedded timestamp** — Extract creation time without extra column
- **High entropy** — 62 random bits = 4.6×10^18 combinations per ms
- **Privacy-safe** — No MAC address, only millisecond precision

### Cons
- **Timestamp leakage** — Rough creation time visible (mitigate: don't expose to untrusted users)
- **Clock dependency** — Requires reasonably synchronized clocks
- **Newer** — Some older libraries don't support v7 yet

### When to Use v7
- **Database primary keys** (PostgreSQL, MySQL, MongoDB, Cassandra)
- **Event sourcing / CQRS** — Event IDs that sort chronologically
- **Audit logs & audit trails** — Implicit ordering
- **Distributed systems** — Coordinated ordering without central sequencer
- **Time-series data** — Natural partitioning by time

## Performance Comparison: Database Indexes

### The Problem with Random UUIDs (v4)
```
B-Tree Index with v4 UUIDs:
Page 1: [a1b2..., a3c4..., a5e6...]  ← Random, scattered
Page 2: [b2c3..., b4d5..., b6f7...]  ← Page splits, fragmentation
Page 3: [c3d4..., c5e6..., c7f8...]  ← Poor cache locality

Result: 50-80% page fill factor, frequent splits, more I/O
```

### The Benefit of Ordered UUIDs (v7)
```
B-Tree Index with v7 UUIDs:
Page 1: [018f0a3c..., 018f0a3d..., 018f0a3e...]  ← Sequential, packed
Page 2: [018f0a3f..., 018f0a40..., 018f0a41...]  ← Full pages, no splits
Page 3: [018f0a42..., 018f0a43..., 018f0a44...]  ← Excellent cache locality

Result: ~99% page fill factor, minimal splits, better performance
```

### Real-World Benchmarks (PostgreSQL)
| Metric | UUID v4 | UUID v7 | Improvement |
|--------|---------|---------|-------------|
| Insert throughput | 12,000/s | 45,000/s | **3.75×** |
| Index size (1M rows) | 240 MB | 180 MB | **25% smaller** |
| Page splits/1000 inserts | 847 | 12 | **98% fewer** |
| Range query latency | 15 ms | 2 ms | **7.5× faster** |

*Source: Various PostgreSQL benchmarks (Instacart, Uber, GitLab engineering blogs)*

## How to Generate UUIDs (Step by Step)

1. **Open the generator** — [DevStackIO UUID Generator](/tools/uuid-generator)
2. **Select version** — Choose "v4 (Random)" or "v7 (Timestamp-ordered)"
3. **Set quantity** — Generate 1 to 1000 UUIDs at once
4. **Choose format** — Standard (with hyphens), compact (no hyphens), or uppercase
5. **Generate** — Click "Generate" or press `Enter`
6. **Copy or download** — One-click copy all, or download as `.txt` / `.json`

## Common Use Cases

### Database Primary Keys (Use v7)
```sql
-- PostgreSQL
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- v4 (built-in)
    -- Better: use v7 extension or application-generated
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- With v7 from application:
INSERT INTO users (id, email) VALUES ('018f0a3c-4b2d-7a1b-8c9d-e0f1a2b3c4d5', 'user@example.com');
-- id sorts chronologically, created_at is redundant for ordering
```

### Event Sourcing (Use v7)
```typescript
interface Event {
  id: string;        // v7 UUID — sorts by time
  type: string;
  payload: unknown;
  timestamp: number; // Redundant but explicit
}

// Events naturally order by id — no separate timestamp index needed
const events = await db.query('SELECT * FROM events ORDER BY id');
```

### Correlation IDs / Tracing (Use v4)
```typescript
// Request tracking — no sorting needed, privacy preferred
const correlationId = crypto.randomUUID(); // v4
logger.info({ correlationId }, "Request started");
```

### Idempotency Keys (Use v4 or v7)
```typescript
// Payment idempotency — v4 fine (short-lived), v7 if you want time-ordered audit
const idempotencyKey = uuidv7(); // or uuidv4()
await stripe.paymentIntents.create({ amount: 1000 }, { idempotencyKey });
```

## UUID in Programming Languages

### JavaScript / TypeScript (Native)
```typescript
// v4 (built-in)
const id = crypto.randomUUID(); // "a1b2c3d4-e5f6-4789-9abc-def012345678"

// v7 (requires library or polyfill)
// npm i uuid
import { v7 as uuidv7 } from 'uuid';
const id = uuidv7(); // "018f0a3c-4b2d-7a1b-8c9d-e0f1a2b3c4d5"

// Polyfill v7 manually (millisecond precision)
function uuidv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  // Timestamp (48 bits)
  bytes[0] = (now >> 40) & 0xff;
  bytes[1] = (now >> 32) & 0xff;
  bytes[2] = (now >> 24) & 0xff;
  bytes[3] = (now >> 16) & 0xff;
  bytes[4] = (now >> 8) & 0xff;
  bytes[5] = now & 0xff;
  // Version (7) + variant
  bytes[6] = 0x70 | ((bytes[6] >> 4) & 0x0f);
  bytes[7] = 0x80 | (bytes[7] & 0x3f);
  // Random (62 bits)
  crypto.getRandomValues(bytes.subarray(8));
  // Format
  return [...bytes].map((b, i) => 
    (i === 4 || i === 6 || i === 8 || i === 10) ? '-' + b.toString(16).padStart(2, '0') : b.toString(16).padStart(2, '0')
  ).join('');
}
```

### Node.js (Built-in v4, v7 via `uuid` package)
```javascript
const { randomUUID } = require('crypto'); // v4
const { v7: uuidv7 } = require('uuid');   // v7

console.log(randomUUID()); // v4
console.log(uuidv7());     // v7
```

### Python
```python
import uuid

# v4 (built-in)
id_v4 = uuid.uuid4()

# v7 (requires uuid6 or backport)
# pip install uuid6
from uuid6 import uuid7
id_v7 = uuid7()

# Or manual v7 (Python 3.11+)
import time, secrets
def uuid7():
    ms = int(time.time() * 1000)
    bytes = bytearray(16)
    bytes[0:6] = ms.to_bytes(6, 'big')
    bytes[6] = (bytes[6] & 0x0f) | 0x70  # version 7
    bytes[7] = (bytes[7] & 0x3f) | 0x80  # RFC 4122 variant
    secrets.randbits(62).to_bytes(8, 'big', signed=False)
    return uuid.UUID(bytes=bytes)
```

### Go
```go
import (
    "github.com/google/uuid" // v4
    "github.com/oklog/ulid/v2" // v7-like (ULID)
)

// v4
id := uuid.New()

// ULID (similar to v7 - timestamp + random)
id := ulid.Make()

// Native v7 (Go 1.21+)
id := uuid.NewV7()
```

### PostgreSQL
```sql
-- v4 (built-in)
SELECT gen_random_uuid();

-- v7 (requires extension)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Or use pg_uuidv7 extension
SELECT uuid_generate_v7(); -- from pg_uuidv7
```

### MySQL
```sql
-- v4 (built-in 8.0+)
SELECT UUID();

-- v7 (manual)
SELECT LOWER(CONCAT(
  LPAD(HEX(FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000) >> 40), 12, '0'),
  LPAD(HEX(FLOOR(RAND() * 0x1000000000000)), 15, '0')
));
```

### Rust
```rust
use uuid::{Uuid, Timestamp, Context};

// v4
let id = Uuid::new_v4();

// v7 (uuid crate v1.4+)
let id = Uuid::new_v7(&Timestamp::from_unix_context(
    Context::new(), 
    std::time::SystemTime::now()
).unwrap());
```

## Collision Probability

| Version | Entropy Bits | Annual Collision Risk (1B IDs/day) |
|---------|--------------|-------------------------------------|
| v4 | 122 | 1 in 10^18 (effectively zero) |
| v7 | 62 per ms | 1 in 10^9 per millisecond |

**Practical reality**: Both are collision-free for any realistic workload. The birthday paradox means you'd need ~2^61 v4 UUIDs (~2 quintillion) for 50% collision chance.

## FAQ

**Can I sort UUID v4 strings?**
Lexicographically, yes — but the order is random, not chronological. For time-based sorting, use v7.

**Does UUID v7 leak my server time?**
Only millisecond precision. If this is a concern (e.g., public-facing IDs), add random jitter or use v4.

**What's the difference between UUID v7 and ULID?**
ULID (Universally Unique Lexicographically Sortable Identifier) is a separate spec with similar goals: 48-bit timestamp + 80-bit random, base32 encoded (26 chars vs 36). Both sort chronologically. UUID v7 is RFC-standardized; ULID has wider ecosystem adoption currently.

**Can I convert between v4 and v7?**
No — they have fundamentally different structures. Generate the version you need.

**What if my system clock goes backwards?**
v7 generators typically use a monotonic counter for the same millisecond. If clock moves back significantly, you risk duplicate timestamps. Use a robust library that handles this.

**Is v7 supported in all databases?**
PostgreSQL (via extension), MySQL (manual), MongoDB (application-side), Cassandra (application-side). Native support growing — check your database version.

**How many UUIDs can I generate per millisecond with v7?**
2^62 ≈ 4.6 quintillion. More than enough for any single node.

**What about UUID v6?**
v6 reorders v1's timestamp bytes for better sorting. v7 is preferred — simpler, uses standard Unix timestamp, more random entropy.

## Related Tools

- [ULID Generator](/tools/ulid-generator) — Alternative timestamp-ordered IDs (base32)
- [Token Generator](/tools/token-generator) — Custom-format random tokens
- [Random Data Generator](/tools/random-data) — Bulk test data including UUIDs
- [BIP39 Mnemonic Generator](/tools/bip39-generator) — Human-readable seed phrases

## References

- [RFC 4122 — A Universally Unique IDentifier (UUID) URN Namespace](https://www.rfc-editor.org/rfc/rfc4122)
- [RFC 4122bis (Draft) — UUID Revised](https://datatracker.ietf.org/doc/draft-ietf-uuidrev-rfc4122bis/)
- [UUID v7 Specification (draft-peabody-dispatch-uuid-01)](https://www.ietf.org/archive/id/draft-peabody-dispatch-uuid-01.txt)
- [ULID Specification](https://github.com/ulid/spec)
- [Instacart: UUID v7 in Production](https://tech.instacart.com/uuid-v7-in-production)
- [GitLab: Why We Switched to UUID v7](https://about.gitlab.com/blog/2022/06/08/why-we-switched-to-uuid-v7/)
- [PostgreSQL UUID-OSSP Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)

---

*Generate UUIDs now → [Free UUID Generator](/tools/uuid-generator) — v4 & v7, bulk generation, multiple formats, 100% client-side.*