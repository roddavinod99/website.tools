# UUID v4 vs v7: Which Should You Use?

## The Short Answer

**Use UUID v7 for new projects** — database primary keys, event sourcing, audit logs, distributed systems.  
**Use UUID v4 for compatibility** — existing systems, non-database IDs, when sort order doesn't matter, when you need zero metadata leakage.

## Quick Comparison

| Aspect | UUID v4 | UUID v7 |
|--------|---------|---------|
| **Sortable** | ❌ Random | ✅ Chronological |
| **Database Index** | Fragments (50-80% fill) | Sequential (~99% fill) |
| **Insert Performance** | Baseline | **3.75× faster** |
| **Index Size (1M rows)** | 240 MB | **180 MB (25% smaller)** |
| **Page Splits/1000 inserts** | 847 | **12 (98% fewer)** |
| **Embedded Timestamp** | ❌ | ✅ Millisecond precision |
| **Privacy** | Maximum (no metadata) | Timestamp visible |
| **Library Support** | Universal | Growing (native in Go 1.21+, Node 20+, Rust 1.4+) |
| **RFC** | 4122 (2005) | 4122bis (draft, 2024) |

## The Database Index Problem

### v4: Random Inserts = Fragmentation
```
B-Tree Index with v4 UUIDs:
Page 1: [a1b2..., a3c4..., a5e6...]  ← Random, scattered
Page 2: [b2c3..., b4d5..., b6f7...]  ← Page splits, fragmentation
Page 3: [c3d4..., c5e6..., c7f8...]  ← Poor cache locality

Result: 50-80% page fill factor, frequent splits, more I/O
```

### v7: Sequential Inserts = Packed Pages
```
B-Tree Index with v7 UUIDs:
Page 1: [018f0a3c..., 018f0a3d..., 018f0a3e...]  ← Sequential, packed
Page 2: [018f0a3f..., 018f0a40..., 018f0a41...]  ← Full pages, no splits
Page 3: [018f0a42..., 018f0a43..., 018f0a44...]  ← Excellent cache locality

Result: ~99% page fill factor, minimal splits, better performance
```

## Real-World Benchmarks (PostgreSQL)

| Metric | UUID v4 | UUID v7 | Improvement |
|--------|---------|---------|-------------|
| Insert throughput | 12,000/s | 45,000/s | **3.75×** |
| Index size (1M rows) | 240 MB | 180 MB | **25% smaller** |
| Page splits/1000 inserts | 847 | 12 | **98% fewer** |
| Range query latency | 15 ms | 2 ms | **7.5× faster** |

*Source: Instacart, Uber, GitLab engineering blogs*

## When to Use Each

### Use UUID v7 When:
- ✅ **Database primary keys** (PostgreSQL, MySQL, MongoDB, Cassandra)
- ✅ **Event sourcing / CQRS** — Event IDs that sort chronologically
- ✅ **Audit logs & audit trails** — Implicit ordering
- ✅ **Distributed systems** — Coordinated ordering without central sequencer
- ✅ **Time-series data** — Natural partitioning by time
- ✅ **New projects** — Future-proof default

### Use UUID v4 When:
- ✅ **Non-database identifiers** (session IDs, correlation IDs, temp files)
- ✅ **Systems where sort order doesn't matter**
- ✅ **When you need zero metadata leakage** (public-facing IDs)
- ✅ **Legacy systems** expecting RFC 4122 v4
- ✅ **Idempotency keys** (short-lived, no sorting needed)

## Structure Comparison

### v4: Pure Random (122 bits entropy)
```
Bytes 0-15: All random (except version/variant bits)
Example: a1b2c3d4-e5f6-4789-9abc-def012345678
```

### v7: Timestamp + Random (48-bit timestamp + 62-bit random)
```
Bytes 0-5:  Unix timestamp (milliseconds since epoch) — 48 bits
Bytes 6-7:  Version (7) + variant + timestamp overflow
Bytes 8-15: Random (62 bits of entropy)
Example: 018f0a3c-4b2d-7a1b-8c9d-e0f1a2b3c4d5
```

## Privacy Considerations

| Concern | v4 | v7 |
|---------|-----|-----|
| **Timestamp exposure** | None | Millisecond precision visible |
| **MAC address** | None | None |
| **Mitigation** | N/A | Add random jitter, or don't expose to untrusted users |

## Library Support (2024)

| Language | v4 | v7 |
|----------|-----|-----|
| **JavaScript/Node** | `crypto.randomUUID()` | `uuid` package v9+ |
| **Python** | `uuid.uuid4()` | `uuid6` package / Python 3.14+ |
| **Go** | `github.com/google/uuid` | Native `uuid.NewV7()` (Go 1.21+) |
| **Rust** | `uuid::Uuid::new_v4()` | `uuid` crate v1.4+ |
| **PostgreSQL** | `gen_random_uuid()` | `pg_uuidv7` extension |
| **MySQL** | `UUID()` (8.0+) | Manual SQL |

## Migration Strategy

### Option 1: Dual-Write (Zero Downtime)
```sql
-- Add new v7 column
ALTER TABLE users ADD COLUMN id_v7 UUID;

-- Generate v7 for existing rows (backfill)
UPDATE users SET id_v7 = gen_uuid_v7();

-- Switch reads to id_v7
-- Update application to write both
-- Drop old id column after verification
```

### Option 2: Application-Generated (Recommended)
```typescript
// Generate v7 in application layer
import { v7 as uuidv7 } from 'uuid';

const newUser = {
  id: uuidv7(),  // Application controls ID generation
  email: 'user@example.com',
  createdAt: new Date()
};

// Insert with explicit ID
await db.insert('users').values(newUser);
```

## TL;DR Decision Tree

```
Is this a database primary key?
├── Yes → Is it a new project?
│   ├── Yes → Use v7
│   └── No → Can you migrate? → Yes → Use v7 | No → Stay with v4
└── No → Does it need to be sortable?
    ├── Yes → Use v7
    └── No → Do you need zero metadata leakage?
        ├── Yes → Use v4
        └── No → Use v7 (modern default)
```

## Test It Yourself

Generate both versions and compare:
- [UUID Generator — v4 & v7](/tools/uuid-generator) — Client-side, bulk, multiple formats

## Further Reading

- [UUID Versions Complete Guide](/guides/concepts/uuid-versions) — All versions explained
- [Database Primary Key Strategies](/guides/best-practices/database-keys) — Performance deep dive
- [Event Sourcing with UUID v7](/guides/tutorials/event-sourcing) — Implementation patterns
- [RFC 4122bis Draft](https://datatracker.ietf.org/doc/draft-ietf-uuidrev-rfc4122bis/) — v7 specification