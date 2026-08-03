## Why Convert Timestamps?

Unix timestamps (seconds since January 1, 1970 UTC) are the universal language of time in computing. But raw numbers like `1704067200` are meaningless to humans. A timestamp converter bridges this gap — instantly translating between machine time and human-readable dates across timezones.

DevStackIO's [Timestamp Converter](/tools/timestamp-converter) handles Unix seconds, milliseconds, ISO 8601, RFC 2822, and custom formats — with timezone support, relative time, and batch conversion. All client-side.

## What Is a Unix Timestamp?

```
Unix Epoch: January 1, 1970 00:00:00 UTC
Timestamp:  Number of seconds (or milliseconds) since epoch

Example: 1704067200
         = 1,704,067,200 seconds since 1970-01-01
         = 2024-01-01 00:00:00 UTC
```

### Precision Variants

| Format | Unit | Range | Example | Use Case |
|--------|------|-------|---------|----------|
| **Unix seconds** | Seconds | 1970–2038 (32-bit) / 1970–2554 (64-bit) | `1704067200` | Standard, APIs, databases |
| **Unix milliseconds** | Milliseconds | 1970–2286 (64-bit) | `1704067200000` | JavaScript, Java, .NET, logging |
| **Unix microseconds** | Microseconds | 1970–2286 | `1704067200000000` | High-precision, Go, databases |
| **Unix nanoseconds** | Nanoseconds | 1970–2262 | `1704067200000000000` | Linux kernel, tracing |

**Critical**: Always know your precision! `1704067200` (seconds) ≠ `1704067200000` (milliseconds) — off by 1000x.

## Timezone Handling

```
Timestamp: 1704067200 (2024-01-01 00:00:00 UTC)

Timezone          | Local Time
------------------|------------------------
UTC               | 2024-01-01 00:00:00
America/New_York  | 2023-12-31 19:00:00 (EST, UTC-5)
America/Los_Angeles| 2023-12-31 16:00:00 (PST, UTC-8)
Europe/London     | 2024-01-01 00:00:00 (GMT, UTC+0)
Europe/Paris      | 2024-01-01 01:00:00 (CET, UTC+1)
Asia/Tokyo        | 2024-01-01 09:00:00 (JST, UTC+9)
Australia/Sydney  | 2024-01-01 11:00:00 (AEDT, UTC+11)
```

**DST matters**: Same timezone, different offsets in summer vs winter.
```
America/New_York:
  Winter (EST): UTC-5
  Summer (EDT): UTC-4

Timestamp 1704067200 (Jan 1):  2023-12-31 19:00:00 EST
Timestamp 1717200000 (Jun 1):  2024-06-01 20:00:00 EDT
```

## Common Date Formats

| Format | Example | Standard | Parsable? |
|--------|---------|----------|-----------|
| **ISO 8601** | `2024-01-15T10:30:45.123Z` | RFC 3339 | ✅ Native |
| **ISO 8601 (offset)** | `2024-01-15T10:30:45+05:30` | RFC 3339 | ✅ Native |
| **RFC 2822** | `Mon, 15 Jan 2024 10:30:45 +0000` | Email headers | ✅ Most libs |
| **RFC 3339** | `2024-01-15T10:30:45Z` | Web standards | ✅ Native |
| **Unix seconds** | `1704067200` | POSIX | ✅ Native |
| **Unix milliseconds** | `1704067200000` | JavaScript | ✅ Native |
| **Custom** | `01/15/2024 10:30 AM` | Locale-specific | ⚠️ Needs parsing |

## How to Convert Timestamps Online (Step by Step)

1. **Open the converter** — [DevStackIO Timestamp Converter](/tools/timestamp-converter)
2. **Input timestamp** — Paste Unix seconds, milliseconds, ISO string, or RFC 2822
3. **Auto-detect** — Tool identifies format and precision automatically
4. **Select timezone** — Choose from IANA database (searchable) or use local
5. **View results** — Multiple formats displayed simultaneously:
   - Human readable (configurable format)
   - ISO 8601 / RFC 3339
   - Unix seconds / milliseconds
   - Relative time ("2 hours ago", "in 3 days")
6. **Batch convert** — Paste multiple timestamps (one per line) → table output
7. **Copy or download** — Individual or CSV/JSON export

## Use Cases

### 1. Debugging JWT Expiration
```json
// JWT payload
{
  "exp": 1704067200,
  "iat": 1704063600
}

// Convert:
// exp = 2024-01-01 00:00:00 UTC (EXPIRED if now > this)
// iat = 2023-12-31 23:00:00 UTC (issued 1 hour ago)
```

### 2. Log Analysis
```bash
# Application log (milliseconds)
2024-01-15T10:30:45.123Z [INFO] Request processed in 45ms
# Convert 1705315845123 → 2024-01-15 10:30:45.123 UTC
```

### 3. Database Timestamp Columns
```sql
-- PostgreSQL
SELECT created_at, EXTRACT(EPOCH FROM created_at) AS unix_seconds
FROM users WHERE id = 123;
-- created_at: 2024-01-15 10:30:45+00
-- unix_seconds: 1705315845

-- MySQL
SELECT UNIX_TIMESTAMP(created_at) FROM users WHERE id = 123;
```

### 4. API Response Timestamps
```json
// Stripe API
{
  "created": 1704067200,
  "expires_at": 1704153600
}

// GitHub API
{
  "created_at": "2024-01-15T10:30:45Z",
  "updated_at": "2024-01-15T10:30:45Z"
}

// Convert both to same format for comparison
```

### 5. Scheduling / Cron
```javascript
// Run at specific Unix timestamp
const runAt = 1704067200; // 2024-01-01 00:00:00 UTC
const delay = runAt * 1000 - Date.now();
if (delay > 0) setTimeout(task, delay);
```

### 6. Cross-Timezone Coordination
```
Team meeting: "2024-01-15 14:00 UTC"
Convert to each member's timezone:
  New York:     2024-01-15 09:00 EST
  London:       2024-01-15 14:00 GMT
  Mumbai:       2024-01-15 19:30 IST
  Tokyo:        2024-01-15 23:00 JST
  Sydney:       2024-01-16 01:00 AEDT
```

## Programming Language Examples

### JavaScript / TypeScript (Native)
```typescript
// Parse various formats
const ts1 = 1704067200;           // seconds
const ts2 = 1704067200000;        // milliseconds
const iso = "2024-01-01T00:00:00Z";
const rfc = "Mon, 01 Jan 2024 00:00:00 GMT";

// Date constructor handles all (ms precision)
const d1 = new Date(ts1 * 1000);   // seconds → ms
const d2 = new Date(ts2);          // milliseconds
const d3 = new Date(iso);          // ISO 8601
const d4 = new Date(rfc);          // RFC 2822

// Format output
console.log(d1.toISOString());           // "2024-01-01T00:00:00.000Z"
console.log(d1.toLocaleString());        // "1/1/2024, 12:00:00 AM" (local)
console.log(d1.toLocaleString('en-US', { timeZone: 'America/New_York' }));
// "12/31/2023, 7:00:00 PM"

// Get Unix timestamps
console.log(Math.floor(d1.getTime() / 1000));  // seconds: 1704067200
console.log(d1.getTime());                     // milliseconds: 1704067200000

// Temporal API (Stage 3, polyfill available)
// import { Temporal } from '@js-temporal/polyfill';
const instant = Temporal.Instant.fromEpochSeconds(1704067200);
const zdt = instant.toZonedDateTimeISO('America/New_York');
console.log(zdt.toString()); // "2023-12-31T19:00:00-05:00[America/New_York]"
```

### Python
```python
from datetime import datetime, timezone
import time

# Parse
ts_seconds = 1704067200
ts_millis = 1704067200000
iso_str = "2024-01-01T00:00:00Z"
rfc_str = "Mon, 01 Jan 2024 00:00:00 GMT"

# From Unix timestamp (UTC)
dt1 = datetime.fromtimestamp(ts_seconds, tz=timezone.utc)
dt2 = datetime.fromtimestamp(ts_millis / 1000, tz=timezone.utc)

# From ISO/RFC
dt3 = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
dt4 = datetime.strptime(rfc_str, "%a, %d %b %Y %H:%M:%S %Z")

# Format
print(dt1.isoformat())           # 2024-01-01T00:00:00+00:00
print(dt1.strftime("%Y-%m-%d %H:%M:%S %Z"))  # 2024-01-01 00:00:00 UTC
print(int(dt1.timestamp()))      # 1704067200 (seconds)
print(int(dt1.timestamp() * 1000)) # 1704067200000 (milliseconds)

# Timezone conversion (zoneinfo - Python 3.9+)
from zoneinfo import ZoneInfo
ny = dt1.astimezone(ZoneInfo("America/New_York"))
print(ny.strftime("%Y-%m-%d %H:%M:%S %Z"))  # 2023-12-31 19:00:00 EST
```

### Go
```go
import (
    "fmt"
    "time"
)

func main() {
    // Parse
    tsSec := int64(1704067200)
    tsMs := int64(1704067200000)
    isoStr := "2024-01-01T00:00:00Z"
    
    // From Unix (seconds)
    t1 := time.Unix(tsSec, 0)
    // From Unix (milliseconds)
    t2 := time.UnixMilli(tsMs)
    // From ISO
    t3, _ := time.Parse(time.RFC3339, isoStr)
    
    // Format
    fmt.Println(t1.Format(time.RFC3339))        // 2024-01-01T00:00:00Z
    fmt.Println(t1.Format("2006-01-02 15:04:05 MST")) // 2024-01-01 00:00:00 UTC
    fmt.Println(t1.Unix())                      // 1704067200
    fmt.Println(t1.UnixMilli())                 // 1704067200000
    
    // Timezone (requires zoneinfo or tzdata)
    loc, _ := time.LoadLocation("America/New_York")
    fmt.Println(t1.In(loc).Format("2006-01-02 15:04:05 MST")) // 2023-12-31 19:00:00 EST
}
```

### Rust
```rust
use chrono::{DateTime, Utc, TimeZone, Local};
use chrono_tz::America::New_York;

fn main() {
    // Parse
    let ts_sec = 1704067200i64;
    let ts_ms = 1704067200000i64;
    let iso = "2024-01-01T00:00:00Z";
    
    // From Unix
    let dt1 = Utc.timestamp_opt(ts_sec, 0).single().unwrap();
    let dt2 = Utc.timestamp_millis_opt(ts_ms).single().unwrap();
    // From ISO
    let dt3 = iso.parse::<DateTime<Utc>>().unwrap();
    
    // Format
    println!("{}", dt1.to_rfc3339());           // 2024-01-01T00:00:00+00:00
    println!("{}", dt1.format("%Y-%m-%d %H:%M:%S %Z")); // 2024-01-01 00:00:00 UTC
    println!("{}", dt1.timestamp());            // 1704067200
    println!("{}", dt1.timestamp_millis());     // 1704067200000
    
    // Timezone
    let ny = dt1.with_timezone(&New_York);
    println!("{}", ny.format("%Y-%m-%d %H:%M:%S %Z")); // 2023-12-31 19:00:00 EST
}
```

### PostgreSQL / MySQL
```sql
-- PostgreSQL
SELECT 
  to_timestamp(1704067200) AS from_unix,           -- 2024-01-01 00:00:00+00
  EXTRACT(EPOCH FROM NOW())::bigint AS to_unix,    -- current as seconds
  NOW() AT TIME ZONE 'America/New_York' AS ny_time;

-- MySQL
SELECT 
  FROM_UNIXTIME(1704067200) AS from_unix,          -- 2024-01-01 00:00:00
  UNIX_TIMESTAMP(NOW()) AS to_unix,                -- current as seconds
  CONVERT_TZ(NOW(), 'UTC', 'America/New_York') AS ny_time;
```

### Command Line
```bash
# Linux / macOS (date)
date -d @1704067200                    # From Unix seconds
date -d @1704067200 -u                 # UTC
date -d "2024-01-01 00:00:00 UTC" +%s  # To Unix seconds

# With timezone
TZ=America/New_York date -d @1704067200

# Milliseconds (bc required)
echo "1704067200000 / 1000" | bc | xargs -I {} date -d @{} -u

# Windows (PowerShell)
[DateTimeOffset]::FromUnixTimeSeconds(1704067200).DateTime
Get-Date -Date "2024-01-01 00:00:00Z" -Format "u"
```

## Edge Cases & Gotchas

### Year 2038 Problem (32-bit)
```
32-bit signed int max: 2,147,483,647
= 2038-01-19 03:14:07 UTC

After this: overflow → negative → 1901 or 1970
Fix: Use 64-bit timestamps (all modern systems)
```

### Leap Seconds
```
Unix time ignores leap seconds (smears them)
UTC has leap seconds; Unix time doesn't
Difference: ~27 seconds since 1972
For precise astronomy: use TAI or GPS time
```

### Millisecond vs Second Confusion
```javascript
// ❌ Common bug
Date.now()              // 1704067200000 (ms)
Math.floor(Date.now())  // Still ms!
// Server expects seconds → 1704067200000 sent instead of 1704067200

// ✅ Correct
Math.floor(Date.now() / 1000)  // 1704067200 (seconds)
```

### Timezone Database Updates
```
IANA tz database updates ~10x/year (DST rule changes)
Browser/Node.js: updates with version
Docker/images: may have stale tzdata
Always test DST transitions (March/November)
```

## FAQ

**How do I know if a timestamp is seconds or milliseconds?**
- 10 digits (1704067200) = seconds (year 2001–2286)
- 13 digits (1704067200000) = milliseconds (year 1970–2286)
- 16 digits = microseconds
- 19 digits = nanoseconds

**Why does my converted time look wrong?**
Check: timezone setting, precision (seconds vs milliseconds), DST. Use the tool's "Show raw values" to debug.

**Can I convert Windows FILETIME (100-ns since 1601)?**
Tool doesn't support directly. Formula: `(FILETIME / 10,000,000) - 11,644,473,600 = Unix seconds`.

**What about dates before 1970?**
Negative timestamps work: `-86400` = 1969-12-31 00:00:00 UTC. All modern parsers handle this.

**Does the tool handle leap years?**
Yes — all standard libraries handle Gregorian calendar rules correctly.

**Can I batch convert a CSV column?**
Yes — paste one timestamp per line, get table output. Download as CSV.

**Is there an API?**
Not yet. Use the CLI or language examples above.

## Related Tools

- [ISO 8601 Formatter](/tools/date-formatter) — Format dates in multiple standards
- [Cron Expression Generator](/tools/cron-expression) — Schedule by time
- [ETA Calculator](/tools/eta-calculator) — Time calculations
- [Chronometer](/tools/chronometer) — Stopwatch, lap timing
- [Date Calculator](/tools/date-calculator) — Add/subtract days, business days

## References

- [POSIX Time (Unix Time)](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16)
- [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- [RFC 2822 — Internet Message Format](https://www.rfc-editor.org/rfc/rfc2822)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [Year 2038 Problem](https://en.wikipedia.org/wiki/Year_2038_problem)
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Temporal API Proposal](https://tc39.es/proposal-temporal/)

---

*Convert timestamps now → [Free Timestamp Converter](/tools/timestamp-converter) — Unix seconds/ms, ISO 8601, RFC 2822. Timezone support, batch mode, relative time. 100% client-side.*