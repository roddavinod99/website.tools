## Why HTML Encoding Matters

HTML encoding, also called HTML escaping, converts characters that have special meaning in HTML into their corresponding named or numeric entities. This prevents the browser from misinterpreting user input as markup, which both preserves the intended text and protects against Cross-Site Scripting (XSS) attacks. Any text that originates from user input, databases, third-party APIs, or content management systems should be encoded before it is rendered. Applying encoding consistently is one of the simplest and most effective security controls a web application can adopt.

## Common HTML Entities

The most common entities are `&amp;` for the ampersand, `&lt;` for the less-than sign, `&gt;` for the greater-than sign, `&quot;` for the double quote, and `&#x27;` for the apostrophe. Any Unicode character can be represented with numeric references: `&#NNN;` in decimal or `&#xNNN;` in hexadecimal, for example `&#x1F600;` for the smiley emoji. Named entities exist for many symbols, such as `&nbsp;` for a non-breaking space and `&copy;` for the copyright sign. Using the correct entity ensures the character renders as intended in every browser.

## When to Encode

Always encode user-generated content before displaying it in HTML, and encode data when embedding it inside HTML attributes, since attribute values are a common injection vector. Encode dynamic text that appears in XML documents as well, following the same escaping rules. Encoding should happen at the point where content is rendered, not when it is stored, so the original text is preserved for other contexts such as search indexes and APIs. Use our HTML Entity Encoder/Decoder to quickly convert text to entities and back, and verify the result in the final document.
---

## Related Resources

## Related Guides

- [JSON Basics](/guides/concepts/json-basics)
- [JWT Structure](/guides/concepts/jwt-structure)
- [Base64 Encoding](/guides/concepts/base64-encoding)
- [Cron Syntax](/guides/concepts/cron-syntax)
- [IP Subnetting](/guides/concepts/ip-subnetting)

## Related Tools

- [html-entity](/tools/html-entity)
- [html-formatter](/tools/html-formatter)

