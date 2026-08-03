## Why Generate Cron Expressions?

Cron is the standard for scheduling tasks on Unix/Linux systems — backups, database maintenance, log rotation, report generation, cleanup jobs. But cron syntax is cryptic: five (or six) fields with specific ranges, special characters, and gotchas. A visual cron generator prevents errors like "runs every minute instead of daily."

DevStackIO's [Cron Expression Generator](/tools/cron-expression) provides a visual builder — pick schedule, see human-readable description, validate expression, test next run times. Supports standard 5-field, 6-field (with seconds), Quartz, Spring, and systemd timers. All client-side.

## Cron Syntax

### Standard 5-Field (Linux/Unix)
```
* * * * *
│ │ │ └─ Day of week (0-7) (Sun=0 or 7)
│ │ └──── Month (1-12)
│ └────── Day of month (1-31)
└──────── Hour (0-23)
         Minute (0-59)
```

### 6-Field (with Seconds - Quartz, Spring, AWS)
```
* * * * * *
│ │ │ │ └─ Day of week (1-7)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
            Second (0-59)
```

### Field Values & Special Characters

| Field | Range | Special Chars |
|-------|-------|---------------|
| Minute | 0-59 | `,` `-` `*` `/` |
| Hour | 0-23 | `,` `-` `*` `/` |
| Day of month | 1-31 | `,` `-` `*` `/` `?` `L` `W` |
| Month | 1-12 (or JAN-DEC) | `,` `-` `*` `/` |
| Day of week | 0-7 (or SUN-SAT) | `,` `-` `*` `/` `?` `L` `#` |
| Second (optional) | 0-59 | `,` `-` `*` `/` |

### Special Characters Explained

| Char | Name | Meaning | Example |
|------|------|---------|---------|
| `*` | All values | Every minute/hour/day | `*` = every minute |
| `,` | List | Multiple values | `1,15,30` = min 1, 15, 30 |
| `-` | Range | Inclusive range | `9-17` = hours 9 to 17 |
| `/` | Step | Every N | `*/15` = every 15 min |
| `?` | No specific value | Day of month OR day of week | `? *` = any day of month |
| `L` | Last | Last day of month/week | `L` = last day of month |
| `W` | Weekday | Nearest weekday | `15W` = nearest weekday to 15th |
| `#` | Nth weekday | 1st, 2nd... Monday | `MON#1` = 1st Monday |

## Common Patterns

| Schedule | Expression | Description |
|----------|------------|-------------|
| Every minute | `* * * * *` | ⚠️ Heavy load |
| Every 5 minutes | `*/5 * * * *` | Common for monitoring |
| Every hour | `0 * * * *` | At minute 0 |
| Daily at midnight | `0 0 * * *` | 00:00 |
| Daily at 2:30 AM | `30 2 * * *` | Low traffic window |
| Weekdays at 9 AM | `0 9 * * 1-5` | Mon-Fri |
| Weekly (Sunday 3 AM) | `0 3 * * 0` | Weekly maintenance |
| Monthly (1st, 6 AM) | `0 6 1 * *` | Monthly reports |
| First Monday | `0 9 * * 1#1` | Quarterly reviews |
| Last day of month | `0 0 L * *` | Month-end processing |
| Every 6 hours | `0 */6 * * *` | 00:00, 06:00, 12:00, 18:00 |
| At 30 min past hour | `30 * * * *` | Half-hour marks |

## Timezone Handling

```
Cron runs in system timezone by default.

# Set timezone for specific cron
CRON_TZ=America/New_York 0 9 * * * /script.sh

# Or in crontab (GNU cron)
TZ=UTC
0 0 * * * /daily-backup.sh

# systemd timers: use OnCalendar with timezone
OnCalendar=*-*-* 00:00:00 UTC
```

**Best practice**: Run cron in UTC, convert in application logic.

## How to Generate Cron Online (Step by Step)

1. **Open the generator** — [DevStackIO Cron Expression Generator](/tools/cron-expression)
2. **Select format** — Standard (5-field), Quartz (6-field), Spring, systemd
3. **Choose schedule type** — Minute, Hourly, Daily, Weekly, Monthly, Custom
4. **Configure visually** — Dropdowns, checkboxes, time pickers
5. **See expression** — Real-time cron string updates
6. **Read description** — Human-readable: "Every day at 02:30"
7. **Test next runs** — Shows next 10 execution times
8. **Validate** — Green = valid, Red = syntax error with details
9. **Copy/Export** — Expression, crontab line, systemd timer unit

## Common Use Cases

### 1. Database Backup
```bash
# Daily at 2:00 AM (low load)
0 2 * * * /usr/bin/pg_dump -U postgres mydb > /backups/mydb_$(date +\%Y\%m\%d).sql

# Weekly full, daily incremental
0 2 * * 0 /scripts/full-backup.sh      # Sunday
0 2 * * 1-6 /scripts/incr-backup.sh    # Mon-Sat
```

### 2. Log Rotation
```bash
# Daily at midnight, compress
0 0 * * * /usr/sbin/logrotate /etc/logrotate.conf

# Hourly for high-volume logs
0 * * * * /scripts/rotate-nginx-logs.sh
```

### 3. Cleanup Jobs
```bash
# Delete temp files older than 7 days (daily 3 AM)
0 3 * * * find /tmp -type f -mtime +7 -delete

# Clean old Docker images (weekly Sunday 4 AM)
0 4 * * 0 docker image prune -af --filter "until=168h"
```

### 4. Report Generation
```bash
# Monthly sales report (1st at 6 AM)
0 6 1 * * /scripts/generate-sales-report.sh

# Weekly team digest (Monday 8 AM)
0 8 * * 1 /scripts/weekly-digest.sh
```

### 5. Health Checks / Monitoring
```bash
# Every 5 minutes
*/5 * * * * /scripts/health-check.sh >> /var/log/health.log 2>&1

# With alerting
*/5 * * * * /scripts/check-api.sh || /scripts/alert-oncall.sh
```

### 6. Certificate Renewal (Let's Encrypt / certbot)
```bash
# Twice daily (certbot recommends)
0 */12 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## Cron Gotchas & Best Practices

### Common Mistakes

| Mistake | Wrong | Correct |
|---------|-------|---------|
| Day of month AND day of week | `0 0 15 * 1` (15th AND Monday) | Use `?` in one: `0 0 15 * ?` |
| Missing `%` escaping in command | `date +%Y-%m-%d` | `date +\%Y-\%m-\%d` |
| Assuming seconds field exists | `0 * * * * *` (5-field) | Use 6-field format if needed |
| Overlapping jobs | `*/10` and `*/15` at same time | Stagger: `*/10` and `3/15` |
| No output redirection | `cmd` | `cmd >> /var/log/cmd.log 2>&1` |

### Best Practices

1. **Use absolute paths** — `/usr/bin/python3` not `python3`
2. **Set environment** — `PATH=/usr/local/bin:/usr/bin:/bin`
3. **Redirect output** — `>> /var/log/job.log 2>&1`
4. **Use lock files** — Prevent overlapping runs:
   ```bash
   flock -n /tmp/job.lock -c "/scripts/job.sh"
   ```
5. **Test with `cron-next`** — Verify next run times
6. **Document in repo** — Keep crontab in version control
7. **Use descriptive comments** — `# Daily DB backup at 2 AM UTC`

### Example Crontab with Best Practices
```bash
# Environment
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=alerts@example.com

# Daily database backup at 02:00 UTC
0 2 * * * /scripts/backup-db.sh >> /var/log/backup-db.log 2>&1

# Hourly log rotation
0 * * * * /usr/sbin/logrotate /etc/logrotate.d/app >> /var/log/logrotate.log 2>&1

# Weekly cleanup (Sunday 03:00)
0 3 * * 0 /scripts/cleanup.sh >> /var/log/cleanup.log 2>&1

# Monthly report (1st at 06:00)
0 6 1 * * /scripts/monthly-report.sh >> /var/log/monthly-report.log 2>&1
```

## Systemd Timers (Modern Alternative)

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Database Backup

[Service]
Type=oneshot
ExecStart=/scripts/backup-db.sh
StandardOutput=journal
StandardError=journal

# /etc/systemd/system/backup.timer
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=daily 02:00:00
Persistent=true
RandomizedDelaySec=15m

[Install]
WantedBy=timers.target
```

```bash
# Enable
systemctl enable --now backup.timer

# Check status
systemctl list-timers --all
systemctl status backup.timer

# Next runs
systemctl list-timers backup.timer --no-pager
```

**Advantages over cron**: Logging via journald, dependency management, random delay, persistent=true (runs if missed), better monitoring.

## Spring / Quartz Cron (6-Field)

```java
// Spring @Scheduled
@Scheduled(cron = "0 0 2 * * ?")  // Daily 2 AM (no seconds)
@Scheduled(cron = "0 0/5 * * * ?") // Every 5 minutes
@Scheduled(cron = "0 30 9 ? * MON-FRI") // Weekdays 9:30 AM

// Quartz
CronExpression expr = new CronExpression("0 0 2 ? * *");
Date next = expr.getNextValidTimeAfter(new Date());
```

**Note**: Spring/Quartz use 6 fields (seconds first). `?` required in day-of-month OR day-of-week.

## Programming: Cron Parsing

### JavaScript (cron-parser)
```javascript
import cronParser from 'cron-parser';

const options = { currentDate: new Date() };
const interval = cronParser.parseExpression('0 2 * * *', options);

console.log(interval.next().toString());  // Next run
console.log(interval.next().toString());  // Following run

// Get next 10
for (let i = 0; i < 10; i++) {
  console.log(interval.next().toString());
}
```

### Python (croniter)
```python
from croniter import croniter
from datetime import datetime

cron = croniter('0 2 * * *', datetime.now())
for _ in range(5):
    print(cron.get_next(datetime))

# Check if valid
try:
    croniter('invalid', datetime.now())
except ValueError as e:
    print("Invalid:", e)
```

### Go (github.com/robfig/cron)
```go
import (
    "github.com/robfig/cron/v3"
    "time"
)

c := cron.New(cron.WithSeconds()) // 6-field
id := c.AddFunc("0 0 2 * * *", func() {
    fmt.Println("Running backup...")
})
c.Start()

// Parse and get next runs
schedule, _ := cron.ParseStandard("0 2 * * *")
next := schedule.Next(time.Now())
```

### Rust (cron crate)
```rust
use cron::Schedule;
use std::str::FromStr;

let schedule = Schedule::from_str("0 2 * * *").unwrap();
for datetime in schedule.upcoming(chrono::Utc).take(5) {
    println!("{}", datetime);
}
```

## FAQ

**Why does my cron run at wrong time?**
Check: system timezone (`date`), cron daemon timezone, `CRON_TZ` variable. Use UTC.

**Can I run every 40 minutes?**
Not directly with standard cron. Use: `0,40 * * * *` (at minute 0 and 40) or wrapper script with sleep.

**What's the difference between `0 0 * * *` and `0 0 * * 0`?**
First: daily at midnight. Second: weekly on Sunday at midnight.

**How do I run on the last Friday of month?**
`0 0 * * 5L` (some cron) or `0 0 25-31 * 5` (25th-31st that are Friday).

**Can I prevent overlapping runs?**
Use `flock` in command: `flock -n /tmp/mylock -c "/script.sh"`

**Why doesn't `*/5` work in hour field?**
It does! `0 */5 * * *` = every 5 hours (00:00, 05:00, 10:00, 15:00, 20:00).

**How do I debug a failing cron job?**
1. Check syslog: `grep CRON /var/log/syslog`
2. Run command manually as cron user
3. Check permissions, paths, environment
4. Add logging to script

**Is there a maximum cron jobs limit?**
No hard limit. System resources (PIDs, memory) are the constraint.

## Related Tools

- [ETA Calculator](/tools/eta-calculator) — Time calculations
- [Timestamp Converter](/tools/timestamp-converter) — Unix time ↔ human
- [Date Calculator](/tools/date-calculator) — Business days, intervals
- [Chronometer](/tools/chronometer) — Stopwatch, lap timing

## References

- [crontab(5) — Linux Manual](https://man7.org/linux/man-pages/man5/crontab.5.html)
- [cron(8) — Daemon Manual](https://man7.org/linux/man-pages/man8/cron.8.html)
- [systemd.timer(5) — Timer Units](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)
- [Quartz Cron Expression](http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [Spring @Scheduled](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#scheduling)
- [Robfig/cron Go Library](https://github.com/robfig/cron)
- [Cronitor — Monitoring](https://cronitor.io/)
- [Healthchecks.io — Cron Monitoring](https://healthchecks.io/)

---

*Generate cron expressions now → [Free Cron Expression Generator](/tools/cron-expression) — Visual builder, 5/6-field formats, Quartz/Spring/systemd, next run preview, validation. Client-side.*