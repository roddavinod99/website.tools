# Timestamp Conversion & Troubleshooting

## Why Timestamps Matter

Unix timestamps (seconds since 1970-01-01 00:00:00 UTC) are the universal language of time in computing. They appear in logs, APIs, databases, JWTs, certificates, and blockchain. But converting between human time and Unix time is error-prone — off-by-one bugs, timezone confusion, millisecond vs second precision, and year 2038 problems.

DevStackIO's [Timestamp Converter](/tools/timestamp-converter) handles bidirectional conversion with timezone support, batch processing, and format detection. All client-side, instant results.

## Unix Timestamp Basics

### Definition
```
Unix Time = Seconds elapsed since 1970-01-01 00:00:00 UTC (epoch)
```

### Key Milestones
| Timestamp | Human Date | Notes |
|-----------|------------|-------|
| `0` | 1970-01-01 00:00:00 UTC | Epoch |
| `86400` | 1970-01-02 00:00:00 UTC | 1 day |
| `1000000000` | 2001-09-09 01:46:40 UTC | Billion seconds |
| `1609459200` | 2021-01-01 00:00:00 UTC | Year 2021 |
| `1704067200` | 2024-01-01 00:00:00 UTC | Year 2024 |
| `2147483647` | 2038-01-19 03:14:07 UTC | **32-bit signed max (Y2038 problem)** |
| `4294967295` | 2106-02-07 06:28:15 UTC | 32-bit unsigned max |

### Precision
| Unit | Bits Needed | Max Range | Use Case |
|------|-------------|-----------|----------|
| **Seconds** | 32-bit | 1970–2038 (signed) | Traditional Unix time |
| **Milliseconds** | 64-bit | ±292 million years | JavaScript `Date.now()`, JWT `exp` |
| **Microseconds** | 64-bit | ±292,000 years | High-precision logging |
| **Nanoseconds** | 64-bit | ±292 years | Go `time.Time`, Linux `clock_gettime` |

## Common Formats

| Format | Example | Description |
|--------|---------|-------------|
| **Unix seconds** | `1704067200` | Standard, 32-bit compatible |
| **Unix milliseconds** | `1704067200000` | JS `Date.now()`, 13 digits |
| **ISO 8601** | `2024-01-01T00:00:00Z` | Human-readable, timezone-aware |
| **ISO 8601 with offset** | `2024-01-01T00:00:00+05:30` | Explicit timezone |
| **RFC 2822** | `Mon, 01 Jan 2024 00:00:00 +0000` | Email headers |
| **Custom** | `2024-01-01 00:00:00` | Space-separated, no T |

## How to Convert Timestamps Online

1. **Open the converter** — [DevStackIO Timestamp Converter](/tools/timestamp-converter)
2. **Enter timestamp** — Paste Unix seconds, milliseconds, or ISO 8601 string
3. **Auto-detect** — Tool identifies format (10-digit = seconds, 13-digit = ms)
4. **Select timezone** — UTC (default), local, or specific IANA zone (`America/New_York`)
5. **View results** — All formats displayed simultaneously
6. **Batch convert** — Paste multiple timestamps (one per line) for bulk conversion
7. **Copy/export** — One-click copy individual or all results

## Common Conversion Issues

### 1. Seconds vs Milliseconds Confusion

**Symptom**: Date shows year 50,000+ or 1970

| Input | Interpreted As | Result |
|-------|----------------|--------|
| `1704067200000` | **Seconds** | Year 53984 (wrong!) |
| `1704067200000` | **Milliseconds** | 2024-01-01 (correct) |
| `1704067200` | **Seconds** | 2024-01-01 (correct) |
| `1704067200` | **Milliseconds** | 1970-01-21 (wrong!) |

**Detection Rule**:
- 10 digits (`1704067200`) → **Seconds**
- 13 digits (`1704067200000`) → **Milliseconds**
- 16+ digits → **Microseconds/nanoseconds**

**Fix**: Always verify digit count. Tool auto-detects but shows both interpretations.

### 2. Timezone Misinterpretation

**Symptom**: Time off by hours

```javascript
// WRONG: Treats UTC timestamp as local
new Date(1704067200 * 1000).toString()  // "Sun Dec 31 2023 19:00:00 GMT-0500"

// CORRECT: Explicitly use UTC
new Date(1704067200 * 1000).toISOString()  // "2024-01-01T00:00:00.000Z"
```

**Best Practice**: Always store/display in UTC. Convert to local only at presentation layer.

### 3. Year 2038 Problem (Y2038)

**Issue**: 32-bit signed integer overflow on 2038-01-19 03:14:07 UTC

```c
// 32-bit signed max: 2,147,483,647
time_t t = 2147483647;  // 2038-01-19 03:14:07 UTC
t++;  // Overflow! Becomes negative → 1901-12-13
```

**Affected Systems**:
- 32-bit Linux/Unix (embedded, older servers)
- 32-bit applications on 64-bit OS
- Databases with `INT` timestamp columns
- File systems with 32-bit timestamps (ext3, older FAT)

**Solutions**:
- Use 64-bit `time_t` (standard on modern 64-bit systems)
- Migrate database columns to `BIGINT` / `TIMESTAMP(6)`
- Use `int64` in code, not `int`/`long` (platform-dependent)

### 4. Leap Seconds

**Issue**: UTC occasionally adds a leap second (23:59:60)

| Date | Leap Second |
|------|-------------|
| 2016-12-31 | 23:59:60 |
| 2015-06-30 | 23:59:60 |
| 2012-06-30 | 23:59:60 |

**Impact**: Unix time **does not count leap seconds** — it smears or repeats a second. Most systems ignore this, but high-precision systems (financial, scientific) must handle it.

### 5. JavaScript Date Quirks

```javascript
// Month is 0-indexed!
new Date(2024, 0, 1)   // 2024-01-01 (month 0 = January)
new Date(2024, 1, 1)   // 2024-02-01 (month 1 = February)

// Day is 1-indexed (correct)
new Date(2024, 0, 1)   // 1st day of month

// Parsing ISO strings
new Date("2024-01-01")           // UTC in modern browsers
new Date("2024-01-01T00:00:00")  // Local in some older browsers
new Date("2024-01-01T00:00:00Z") // Always UTC (preferred)

// Timestamp in constructor
new Date(1704067200000)  // Milliseconds since epoch
new Date(1704067200)     // Treated as milliseconds! Wrong!
```

## Programming Language Examples

### JavaScript / TypeScript
```typescript
// Seconds → Date
const seconds = 1704067200;
const date = new Date(seconds * 1000);  // Must multiply by 1000!

// Milliseconds → Date
const ms = 1704067200000;
const date = new Date(ms);

// Date → Unix seconds
const unixSeconds = Math.floor(Date.now() / 1000);

// Date → Unix milliseconds
const unixMs = Date.now();

// Formatting
date.toISOString();           // "2024-01-01T00:00:00.000Z"
date.toLocaleString();        // "1/1/2024, 12:00:00 AM" (local)
date.toLocaleString('en-US', { timeZone: 'UTC' });  // Force UTC

// Intl.DateTimeFormat (modern, flexible)
new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false
}).format(date);  // "01/01/2024, 19:00:00"
```

### Python
```python
from datetime import datetime, timezone
import time

# Unix seconds → datetime (UTC)
dt = datetime.fromtimestamp(1704067200, tz=timezone.utc)
# 2024-01-01 00:00:00+00:00

# Unix milliseconds → datetime
dt = datetime.fromtimestamp(1704067200000 / 1000, tz=timezone.utc)

# datetime → Unix seconds
seconds = int(dt.timestamp())  # 1704067200

# datetime → Unix milliseconds
ms = int(dt.timestamp() * 1000)  # 1704067200000

# Formatting
dt.isoformat()           # "2024-01-01T00:00:00+00:00"
dt.strftime("%Y-%m-%d %H:%M:%S")  # "2024-01-01 00:00:00"

# Timezone conversion
import zoneinfo
dt_ny = dt.astimezone(zoneinfo.ZoneInfo("America/New_York"))
# 2023-12-31 19:00:00-05:00

# Parsing
datetime.fromisoformat("2024-01-01T00:00:00+00:00")
datetime.strptime("2024-01-01 00:00:00", "%Y-%m-%d %H:%M:%S")
```

### Go
```go
import (
    "fmt"
    "time"
)

func main() {
    // Unix seconds → Time
    sec := int64(1704067200)
    t := time.Unix(sec, 0)  // 2024-01-01 00:00:00 +0000 UTC

    // Unix milliseconds → Time
    ms := int64(1704067200000)
    t = time.UnixMilli(ms)

    // Time → Unix seconds
    sec = t.Unix()

    // Time → Unix milliseconds
    ms = t.UnixMilli()

    // Formatting
    fmt.Println(t.Format(time.RFC3339))        // "2024-01-01T00:00:00Z"
    fmt.Println(t.Format("2006-01-02 15:04:05")) // "2024-01-01 00:00:00"

    // Timezone
    loc, _ := time.LoadLocation("America/New_York")
    fmt.Println(t.In(loc).Format(time.RFC3339)) // "2023-12-31T19:00:00-05:00"

    // Parsing
    t, _ = time.Parse(time.RFC3339, "2024-01-01T00:00:00Z")
    t, _ = time.Parse("2006-01-02 15:04:05", "2024-01-01 00:00:00")
}
```

### Rust
```rust
use chrono::{DateTime, Utc, TimeZone, Local, FixedOffset};

fn main() {
    // Unix seconds → DateTime<Utc>
    let secs = 1704067200i64;
    let dt: DateTime<Utc> = Utc.timestamp_opt(secs, 0).single().unwrap();
    // 2024-01-01 00:00:00 UTC

    // Unix milliseconds → DateTime<Utc>
    let ms = 1704067200000i64;
    let dt = Utc.timestamp_millis_opt(ms).single().unwrap();

    // DateTime → Unix seconds
    let secs = dt.timestamp();  // 1704067200

    // DateTime → Unix milliseconds
    let ms = dt.timestamp_millis();  // 1704067200000

    // Formatting
    println!("{}", dt.to_rfc3339());           // "2024-01-01T00:00:00+00:00"
    println!("{}", dt.format("%Y-%m-%d %H:%M:%S")); // "2024-01-01 00:00:00"

    // Timezone conversion
    let ny = FixedOffset::west_opt(5 * 3600).unwrap();
    println!("{}", dt.with_timezone(&ny));  // 2023-12-31 19:00:00 -05:00

    // Local time
    let local: DateTime<Local> = dt.with_timezone(&Local);
}
```

### SQL (PostgreSQL / MySQL)
```sql
-- PostgreSQL
SELECT to_timestamp(1704067200);           -- 2024-01-01 00:00:00+00
SELECT extract(epoch from now())::bigint;  -- Current Unix seconds
SELECT now() AT TIME ZONE 'UTC';           -- Current UTC time

-- MySQL
SELECT FROM_UNIXTIME(1704067200);          -- 2024-01-01 00:00:00
SELECT UNIX_TIMESTAMP();                   -- Current Unix seconds
SELECT UTC_TIMESTAMP();                    -- Current UTC

-- Convert with timezone
SELECT CONVERT_TZ(FROM_UNIXTIME(1704067200), '+00:00', '-05:00');  -- MySQL
```

## Batch Conversion

For multiple timestamps, use the tool's batch mode or programmatic approaches:

```bash
# Bash: Convert list of timestamps
cat timestamps.txt | while read ts; do
  date -d "@$ts" -u +"%Y-%m-%d %H:%M:%S UTC"
done

# Python batch
import sys, datetime
for line in sys.stdin:
    ts = int(line.strip())
    print(datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).isoformat())
```

## FAQ

**Why does my timestamp show 1970 or year 50000+?**
You're mixing seconds and milliseconds. 10 digits = seconds, 13 digits = milliseconds.

**How do I convert a timestamp in Excel/Google Sheets?**
```excel
= A1 / 86400 + DATE(1970,1,1)    # For seconds in A1
= A1 / 86400000 + DATE(1970,1,1)  # For milliseconds in A1
```
Then format cell as Date/Time.

**What's the maximum timestamp in JavaScript?**
`Number.MAX_SAFE_INTEGER` = `9007199254740991` ms ≈ year 285,616. But `Date` only supports ±100,000,000 days from epoch ≈ year 275,760.

**How do I handle timestamps in JSON?**
Use ISO 8601 strings (`"2024-01-01T00:00:00Z"`) — self-describing, timezone-aware, human-readable. Avoid raw numbers.

**Does the tool support dates before 1970?**
Yes — negative timestamps work. `-86400` = 1969-12-31 00:00:00 UTC.

**What about dates after 2038?**
Use 64-bit timestamps (milliseconds or 64-bit seconds). Tool handles full 64-bit range.

## Related Tools
- [Timestamp Converter](/tools/timestamp-converter) — Bidirectional, batch, timezone-aware
- [Date Calculator](/tools/date-calculator) — Business days, intervals, age
- [ETA Calculator](/tools/eta-calculator) — Time remaining calculations
- [ISO 8601 Validator](/tools/iso8601-validator) — Validate date strings

## References
- [Unix Time — Wikipedia](https://en.wikipedia.org/wiki/Unix_time)
- [Year 2038 Problem](https://en.wikipedia.org/wiki/Year_2038_problem)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- [ECMAScript Date](https://tc39.es/ecma262/#sec-date-objects)
---

## Related Resources

## Related Guides

- [JSON Errors & Fixes](/guides/troubleshooting/json-errors)
- [JWT Decoding](/guides/troubleshooting/jwt-decoding)
- [Regex Debugging](/guides/troubleshooting/regex-debugging)
- [Hash Verification](/guides/troubleshooting/hash-verification)
- [DNS Troubleshooting](/guides/troubleshooting/dns-troubleshooting)

## Related Tools

- [timestamp-converter](/tools/timestamp-converter)

