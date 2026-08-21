## Why Format SQL?

SQL is written by humans but optimized for parsers. Long queries written inline quickly become unreadable walls of text where a missing comma or a misplaced clause is nearly impossible to spot. Formatting SQL into a consistent, indented structure — keywords on their own lines, aligned clauses, and capitalized keywords — makes queries readable at a glance, easier to debug, and simpler to review in code reviews and pull requests. A formatted query also makes it easier to spot missing joins, unbalanced parentheses, and duplicated conditions before they reach production.

## Understanding Query Structure

A SQL statement is built from clauses: `SELECT`, `FROM`, `JOIN`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, and `LIMIT`. A good formatter understands these clauses and indents subqueries and `CASE` expressions consistently. It capitalizes reserved keywords while leaving identifiers and string literals untouched, and it aligns commas so columns and conditions line up. It also handles tricky constructs like `IN` lists, `BETWEEN`, `UNION`/`UNION ALL`, window functions, and `ON DUPLICATE KEY UPDATE` without breaking the syntax. Our SQL formatter applies these rules automatically in your browser.

## Practical Workflow

Paste a raw query, choose your preferred dialect (MySQL, PostgreSQL, SQL Server, or Oracle), and pick your indentation style — spaces or tabs, two or four spaces. The formatter instantly rewrites the query with consistent structure while preserving the exact semantics. Use the compact mode to collapse the query to a single line for logs or debugging, and the expand mode for maximum readability. Always re-run the formatted query against a test database to confirm behavior is unchanged, especially for complex JOINs and subqueries.

## Common Mistakes

A formatter cannot fix an invalid query — it only arranges syntax, so always validate logic first. Beware of formatters that mangle string literals containing SQL-like text or that break on vendor-specific syntax such as `::` casts, `->` JSON operators, or PostgreSQL dollar-quoted strings. Choose a dialect-aware tool and spot-check edge cases. For sensitive queries, prefer a browser-based formatter like ours so the SQL never leaves your machine.