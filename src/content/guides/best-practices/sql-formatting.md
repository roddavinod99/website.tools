# SQL Formatting Best Practices

## Why Format SQL?

SQL is written by humans but optimized for parsers. Long queries written inline quickly become unreadable walls of text where a missing comma or a misplaced clause is nearly impossible to spot. Formatting SQL into a consistent, indented structure — keywords on their own lines, aligned clauses, and capitalized keywords — makes queries readable at a glance, easier to debug, and simpler to review in code reviews and pull requests.

## What Makes a Good SQL Formatter?

### Dialect Support

SQL isn't one language. A good formatter handles:

| Dialect | Quoting | Limit | Auto-inc | Upsert |
|---------|---------|-------|----------|--------|
| **MySQL** | `` `name` `` | `LIMIT n` | `AUTO_INCREMENT` | `ON DUPLICATE KEY` |
| **PostgreSQL** | `"name"` | `LIMIT n` | `SERIAL` / `IDENTITY` | `ON CONFLICT` |
| **SQLite** | `"name"` | `LIMIT n` | `AUTOINCREMENT` | `ON CONFLICT` |
| **Standard SQL** | `"name"` | `LIMIT n` | `GENERATED AS IDENTITY` | `MERGE` |
| **T-SQL** | `[name]` | `TOP n` | `IDENTITY(1,1)` | `MERGE` |
| **BigQuery** | `` `name` `` | `LIMIT n` | `GENERATED AS IDENTITY` | `MERGE` |

### Configurable Style

| Option | Choices | Default |
|--------|---------|---------|
| Indentation | 2 spaces, 4 spaces, tabs | 2 spaces |
| Keyword case | UPPER, lower, Preserve | UPPER |
| Identifier case | Preserve, UPPER, lower | Preserve |
| Comma position | Leading, trailing | Trailing |
| Line width | 80, 100, 120, unlimited | 100 |
| Dense operators | `a+b` vs `a + b` | Spaced |

### Key Features

- **Syntax validation** — Catches errors before execution
- **Minify mode** — Single-line for logging/production
- **Comment preservation** — Keeps `--` and `/* */` comments
- **Large query support** — 100KB+ via Web Worker
- **Copy/Download** — One-click clipboard or `.sql` file

## How to Format SQL Online

1. **Open the formatter** — [DevStackIO SQL Formatter](/tools/sql-formatter)
2. **Select dialect** — MySQL, PostgreSQL, SQLite, Standard, T-SQL, BigQuery
3. **Paste your query** — Raw SQL from code, logs, or database client
4. **Configure style** — Adjust indentation, casing, line width via toolbar
5. **Format** — Click "Format" or press `Ctrl+Enter`
6. **Review & copy** — Syntax-highlighted output with line numbers
7. **Download** — Save as `.sql` file for version control

## Before & After Examples

### Complex JOIN with Subquery

```sql
-- Before: Minified from ORM/logs
SELECT u.id,u.name,u.email,COUNT(o.id) as order_count,SUM(o.total) as lifetime_value FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.created_at>='2024-01-01' AND u.status='active' GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>0 ORDER BY lifetime_value DESC LIMIT 20;

-- After: Formatted (PostgreSQL, 2-space indent, UPPER keywords)
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS lifetime_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY lifetime_value DESC
LIMIT 20;
```

### CTE with Window Functions

```sql
-- Before
WITH ranked AS (SELECT *,ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rn FROM products WHERE active=true) SELECT * FROM ranked WHERE rn<=3;

-- After
WITH ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products
  WHERE active = true
)
SELECT *
FROM ranked
WHERE rn <= 3;
```

## Common Use Cases

### 1. Debugging ORM-Generated Queries

```python
# Django ORM
User.objects.filter(orders__total__gt=100).select_related('profile').annotate(
    order_count=Count('orders')
).order_by('-order_count')[:10]

# Copy SQL from Django Debug Toolbar → Paste in formatter → Readable!
```

### 2. Code Review Readability

```sql
-- PR shows this change:
- WHERE u.status = 'active' AND u.created_at >= '2024-01-01'
+ WHERE u.status = 'active'
+   AND u.created_at >= '2024-01-01'
+   AND u.verified_at IS NOT NULL
```

### 3. Migrating Between Databases

```sql
-- MySQL → PostgreSQL
-- Formatter helps spot dialect-specific syntax:
-- MySQL: `id` INT AUTO_INCREMENT
-- PostgreSQL: id SERIAL / GENERATED ALWAYS AS IDENTITY
```

### 4. Log Analysis

```bash
# Slow query log (minified)
# Format to understand execution plan
EXPLAIN ANALYZE SELECT ... FROM ... JOIN ... WHERE ...
```

## Formatting Configuration Guide

### For Teams (Consistent Style)

```json
{
  "indent": 2,
  "keywordCase": "upper",
  "identifierCase": "preserve",
  "commaPosition": "trailing",
  "lineWidth": 100,
  "denseOperators": false,
  "newLineBeforeSemicolon": false
}
```

### For Compact Logging (Single Line)

```json
{
  "indent": 0,
  "keywordCase": "upper",
  "lineWidth": 0,
  "denseOperators": true
}
```

### For Readability (Wide)

```json
{
  "indent": 4,
  "keywordCase": "upper",
  "identifierCase": "lower",
  "commaPosition": "leading",
  "lineWidth": 120
}
```

## Minify vs. Pretty-Print

| Mode | Use Case | Output |
|------|----------|--------|
| **Pretty** | Development, code review, documentation | Multi-line, indented |
| **Minify** | Production logs, embedding in JSON, network payloads | Single line, minimal whitespace |

```sql
-- Pretty (development)
SELECT
  id,
  name
FROM users
WHERE active = true;

-- Minify (production logging)
SELECT id,name FROM users WHERE active=true;
```

## Privacy & Performance

DevStackIO's SQL Formatter runs in a Web Worker. Your queries never leave your browser. No server uploads, no logging, no tracking. Handles 500KB+ queries without freezing the UI.

## Integration

### VS Code Extension

```json
// settings.json
"sql-formatter.dialect": "postgresql",
"sql-formatter.keywordCase": "upper",
"editor.formatOnSave": true
```

### CI/CD Pipeline (GitHub Actions)

```yaml
- name: Check SQL formatting
  run: |
    npx sql-formatter --config .sql-formatter.json --check **/*.sql
```

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: sql-format
      name: Format SQL files
      entry: sql-formatter --fix
      language: system
      types: [sql]
```

## FAQ

**Does the formatter execute my query?**
No. It only parses and reformats. Zero database connection.

**What if my query has syntax errors?**
The formatter highlights the error position (line/column) and shows a descriptive message.

**Can I format PL/pgSQL, T-SQL stored procedures?**
Yes — the formatter handles procedural blocks, variables, loops, and control flow.

**Is there a file size limit?**
Browser handles ~10MB comfortably. For larger files, use the CLI version.

**Does it support BigQuery / Snowflake / Redshift?**
Yes — select "BigQuery" dialect for cloud warehouse syntax.

## Related Guides

- [SQL Security Best Practices](/guides/best-practices/sql-security) — Injection prevention, parameterization
- [Database Indexing](/guides/best-practices/database-indexing) — Performance optimization
- [Query Optimization](/guides/tutorials/query-optimization) — EXPLAIN analysis

## Tools

- [SQL Formatter](/tools/sql-formatter) — MySQL, PostgreSQL, SQLite, T-SQL, BigQuery. Client-side, configurable, syntax validation
- [SQL Minifier](/tools/sql-minifier) — Compact for production logs
- [SQL Validator](/tools/sql-validator) — Syntax checking
- [JSON Formatter](/tools/json-formatter) — Format JSON API responses
- [YAML Formatter](/tools/yaml-formatter) — Format YAML configs

## References

- [sql-formatter-org/sql-formatter](https://github.com/sql-formatter-org/sql-formatter) — Core library
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/sql-syntax.html)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [SQLite SQL Language](https://www.sqlite.org/lang.html)
- [T-SQL Reference (Microsoft)](https://learn.microsoft.com/en-us/sql/t-sql/language-reference)
- [GoogleSQL (BigQuery) Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql)
- [ANSI SQL:2016 Standard](https://www.iso.org/standard/63555.html)
---

## Related Resources

## Related Guides

- [Password Security](/guides/best-practices/password-security)
- [Image Optimization](/guides/best-practices/image-optimization)
- [JWT Security](/guides/best-practices/jwt-security)
- [bcrypt Hashing](/guides/best-practices/bcrypt-hashing)
- [HMAC Authentication](/guides/best-practices/hmac-authentication)

## Related Tools

- [sql-formatter](/tools/sql-formatter)

