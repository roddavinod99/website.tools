## Why Format SQL Online?

SQL queries start clean but quickly become unreadable — nested subqueries, complex joins, long WHERE clauses, and inconsistent indentation. A SQL formatter restores structure instantly: proper indentation, aligned keywords, consistent casing, and readable line breaks.

Unlike IDE extensions that require setup per editor, an online SQL formatter works everywhere — browser, mobile, CI logs, code reviews. Paste your query, get formatted SQL in milliseconds. DevStackIO's [SQL Formatter](/tools/sql-formatter) runs entirely client-side with Web Worker support for large queries.

## What Makes a Good SQL Formatter?

### Dialect Support
SQL isn't one language. A good formatter handles:
- **MySQL** — Backticks, `LIMIT`, `AUTO_INCREMENT`
- **PostgreSQL** — Dollar quotes, `CTE`, `RETURNING`, arrays
- **SQLite** — No stored procedures, limited `ALTER TABLE`
- **Standard SQL (ANSI)** — Portable baseline
- **T-SQL (SQL Server)** — `TOP`, `IDENTITY`, square brackets
- **BigQuery, Snowflake, Redshift** — Cloud warehouse dialects

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
- **Large query support** — 100KB+ queries via Web Worker
- **Copy/Download** — One-click clipboard or `.sql` file

## How to Format SQL Online (Step by Step)

1. **Open the formatter** — [DevStackIO SQL Formatter](/tools/sql-formatter)
2. **Select dialect** — MySQL, PostgreSQL, SQLite, Standard, T-SQL, BigQuery
3. **Paste your query** — Raw SQL from code, logs, or database client
4. **Configure style** — Adjust indentation, casing, line width via toolbar
5. **Format** — Click "Format" or press `Ctrl+Enter` — result appears instantly
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

### Nested Subqueries
```sql
-- Before
SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status='completed') AND created_at > NOW() - INTERVAL '30 days');

-- After
SELECT name
FROM customers
WHERE id IN (
  SELECT customer_id
  FROM orders
  WHERE total > (
    SELECT AVG(total)
    FROM orders
    WHERE status = 'completed'
  )
  AND created_at > NOW() - INTERVAL '30 days'
);
```

## Common Use Cases

### 1. Debugging ORM-Generated Queries
```python
# Django ORM
User.objects.filter(orders__total__gt=100).select_related('profile').annotate(
    order_count=Count('orders')
).order_by('-order_count')[:10]

# Copy the SQL from Django Debug Toolbar → Paste in formatter → Readable!
```

### 2. Code Review Readability
```sql
-- PR shows this change:
- WHERE u.status = 'active' AND u.created_at >= '2024-01-01'
+ WHERE u.status = 'active'
+   AND u.created_at >= '2024-01-01'
+   AND u.verified_at IS NOT NULL
```
Formatted diff shows intent clearly.

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

## SQL Dialect Differences

| Feature | MySQL | PostgreSQL | SQLite | T-SQL |
|---------|-------|------------|--------|-------|
| Quote identifier | `\`name\`` | `"name"` | `"name"` | `[name]` |
| Limit/Top | `LIMIT n` | `LIMIT n` | `LIMIT n` | `TOP n` |
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` / `IDENTITY` | `AUTOINCREMENT` | `IDENTITY(1,1)` |
| CTE | ✅ 8.0+ | ✅ | ✅ | ✅ |
| Window functions | ✅ 8.0+ | ✅ | ✅ 3.25+ | ✅ |
| JSON functions | ✅ | ✅ (jsonb) | ✅ | ✅ |
| Array type | ❌ | ✅ | ❌ | ❌ |
| Upsert | `ON DUPLICATE KEY` | `ON CONFLICT` | `ON CONFLICT` | `MERGE` |

**Tip**: Select the target dialect in the formatter to catch compatibility issues early.

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

- **Zero server interaction** — Static files via CDN
- **No persistence** — Query exists only in component state
- **Dialect detection** — Auto-detects common patterns
- **Open source** — Audit on [GitHub](https://github.com/roddavinod99)

## Advanced: Formatter Integration

### VS Code Extension (Community)
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
```bash
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
The formatter highlights the error position (line/column) and shows a descriptive message. Fix the error, then re-format.

**Can I format PL/pgSQL, T-SQL stored procedures?**
Yes — the formatter handles procedural blocks, variables, loops, and control flow for supported dialects.

**Is there a file size limit?**
Browser handles ~10MB comfortably. For larger files, use the CLI version.

**Does it support BigQuery / Snowflake / Redshift?**
Yes — select "BigQuery" dialect for cloud warehouse syntax (STRUCT, ARRAY, QUALIFY, etc.).

**Can I preserve my custom formatting?**
The formatter applies consistent rules. For mixed-style files, format the whole file first, then adjust specific sections manually.

**Why are my comments moving?**
Block comments (`/* */`) attached to keywords stay with them. Standalone comments get their own line. Use `--` for inline comments you want preserved exactly.

**Is there an API?**
Not yet. The `/api` page shows planned endpoints. For now, use the CLI: `npx sql-formatter`.

## Related Tools

- [JSON Formatter](/tools/json-formatter) — Format JSON API responses
- [HTML Formatter](/tools/html-formatter) — Format HTML templates
- [CSS Formatter](/tools/css-formatter) — Format stylesheets
- [JavaScript Formatter](/tools/js-minifier) — Format/Minify JS
- [YAML Formatter](/tools/yaml-formatter) — Format YAML configs
- [XML Formatter](/tools/xml-formatter) — Format XML documents

## References

- [SQL Formatter (sql-formatter-org)](https://github.com/sql-formatter-org/sql-formatter) — Core library
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/sql-syntax.html)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [SQLite SQL Language](https://www.sqlite.org/lang.html)
- [T-SQL Reference (Microsoft)](https://learn.microsoft.com/en-us/sql/t-sql/language-reference)
- [GoogleSQL (BigQuery) Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql)
- [ANSI SQL:2016 Standard](https://www.iso.org/standard/63555.html)

---

*Format your SQL now → [Free SQL Formatter](/tools/sql-formatter) — MySQL, PostgreSQL, SQLite, T-SQL, BigQuery. Client-side, configurable, syntax validation included.*