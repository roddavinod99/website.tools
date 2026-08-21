## What is a UUID?

A Universally Unique Identifier (UUID) is a 128-bit value that identifies something with an astronomically low chance of collision, conventionally written as 32 hexadecimal digits in five groups: `550e8400-e29b-41d4-a716-446655440000`. UUIDs let distributed systems generate identifiers without a central authority — no shared database, no coordination, no sequential counter to race on. They are used everywhere: database primary keys, API resource IDs, correlation IDs, filenames, and event IDs. Understanding which version to use and how to generate them properly avoids performance pitfalls and security leaks.

## UUID Versions

UUIDs come in several versions, set by the 13th hex digit. UUID v4 is fully random (122 bits of entropy) — great for public-facing IDs that must not leak information, but poorly ordered for database indexes. UUID v7 is time-ordered: its leading bits embed a millisecond timestamp, so values sort chronologically and insert into B-tree indexes without fragmentation. UUID v5 is deterministic — derived by hashing a namespace and name with SHA-1, so the same name always yields the same UUID. UUID v1 embeds a MAC address and timestamp, which leaks hardware identity, and v3 is its legacy MD5-based counterpart; both are best avoided in new designs. The IETF standardized v7 in RFC 9562 and recommends it for new database keys.

## Generating UUIDs Correctly

A UUID generator needs a cryptographically secure random source. Browsers expose one through `crypto.getRandomValues`, and the modern Web Crypto API supports random UUID generation directly via `crypto.randomUUID()`. For v7, the generator embeds the current time plus random bits. When generating in bulk, be aware that some tools produce sequential-looking v4 values from a weak generator — always use a proper CSPRNG. Our UUID generator produces v3, v4, v5, and v7 values with cryptographic randomness, in your browser, with options for uppercase, braces, and bulk generation.

## Common Mistakes

The most common mistakes are using v4 for high-write database tables (index fragmentation slows inserts), treating UUIDs as secrets (v1 leaks time and MAC; v4 is random but still should not hold sensitive data), and using UUIDs where a shorter ID — like a ULID, nanoid, or sequential integer — is a better fit for your read patterns. Choose the version for the job: v7 for ordered keys, v4 for public random IDs, v5 for deterministic derivation, and a compact alternative when 128 bits is overkill.