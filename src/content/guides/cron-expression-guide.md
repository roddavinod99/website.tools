## What is a Cron Expression?

Cron expressions schedule jobs to run automatically at specific times. They originated in Unix's cron daemon and are now used by virtually every modern scheduler: GitHub Actions, AWS EventBridge, CloudWatch, Kubernetes CronJobs, Jenkins, and Laravel/Python/Node scheduling libraries. A standard cron expression has five fields — minute, hour, day of month, month, and day of week — and each field accepts a number, a range, a list, or special operators like `*` (every), `/` (step), `-` (range), and `,` (list). Some systems add a sixth field for seconds and a seventh for year.

## Reading a Cron Expression

Each field controls one unit of time, in order: minute (0-59), hour (0-23), day of month (1-31), month (1-12 or names), and day of week (0-6 or names). `0 9 * * *` means "every day at 09:00". `*/15 * * * *` means "every 15 minutes". `0 0 1 * *` means "at midnight on the 1st of every month". The day-of-month and day-of-week fields are combined with an implicit OR in standard cron (in cron syntax), but an AND in some systems like AWS EventBridge — a classic source of "why did my job run on the wrong day" bugs.

## Building and Testing Expressions

The safest way to work with cron is to build the expression from a structured form — picking the minutes, hours, days, and months you want — and let the tool render the exact five-field string. Then test it against a calendar to confirm the next several run times are what you expect. Our cron expression generator does exactly this: it builds valid expressions for common schedules, shows the equivalent human-readable description, and lists the next run times so you can verify the schedule before deploying it.

## Common Mistakes

The most frequent cron mistakes are assuming cron understands timezones (it usually does not — it runs in the machine's local time), off-by-one errors in weekday numbering (some systems start at 0=Sunday, others at 1=Monday), and forgetting that `*` in both day fields means "every day," which combined with other fields can produce surprising results. Always specify an explicit timezone at the scheduler level, test with a next-runs preview, and add a minute of jitter to cron jobs that may run in unison across many hosts.