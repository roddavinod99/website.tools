## What are Regular Expressions?

Regular expressions (regex) are patterns used to match character combinations within strings. They are supported in virtually every programming language, in command-line tools such as grep and sed, and in text editors and IDEs for search, validation, and manipulation. A regex describes a search pattern that can range from a simple literal string to a complex rule involving groups, alternation, quantifiers, and lookarounds. Understanding regex fundamentals lets you write one powerful expression that replaces dozens of lines of manual string-processing code.

## Basic Patterns

Literal characters match themselves, so the pattern `cat` matches the string `cat`. The dot (`.`) matches any single character except a line break, the asterisk (`*`) matches zero or more of the preceding element, and the plus (`+`) matches one or more. Square brackets define character classes such as `[abc]` to match any one of a, b, or c, or ranges like `[a-z]` and `[0-9]`. Curly braces specify exact or ranged repetition, for example `\d{3}` matches exactly three digits, while `\d{3,5}` matches between three and five. Escaping a metacharacter with a backslash, as in `\.` or `\*`, makes it match literally.

## Anchors and Groups

The caret (`^`) anchors a match to the start of a line or string, and the dollar sign (`$`) anchors to the end, so `^foo$` matches only the exact string `foo`. Parentheses create capture groups that extract matched portions for later use, and groups can be made non-capturing with `(?:...)`. The pipe (`|`) acts as an OR operator between alternatives, so `cat|dog` matches either cat or dog. Lookarounds such as `(?=...)` and `(?!...)` let you assert conditions without consuming characters, which is useful for password validation rules.

## Practical Examples

Use `\d{3}-\d{3}-\d{4}` to match US phone numbers, and `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` to validate email addresses. To find URLs in text, use `https?:\/\/[^\s]+`. For log analysis, patterns like `\d{4}-\d{2}-\d{2}` can extract dates from arbitrary text. Because regex engines and flavors differ subtly, always test your expressions with a dedicated tool such as our Regex Tester, which provides real-time matching, capture-group inspection, and flag support before you deploy the pattern.