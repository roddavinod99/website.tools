## Why Check File Checksums?

A checksum is a short, fixed-size digest computed from a file's contents that changes completely if even one bit of the file changes. Checking checksums is the standard way to verify that a downloaded file is complete and unmodified — whether you are installing a Linux ISO, a signed binary, a firmware image, or a software package. Distributors publish checksums (MD5, SHA-1, SHA-256, or CRC32) alongside downloads so you can compare your copy against the official one and catch corrupted transfers or tampering before you trust or execute the file.

## Understanding Checksum Algorithms

Checksums differ in strength and speed. CRC32 is a fast 32-bit checksum that catches accidental corruption (a bad download, a bad disk) but is not cryptographically secure. MD5 and SHA-1 are 128- and 160-bit hashes that were once standard but are now considered broken for security purposes because collisions can be engineered. SHA-256 is the modern default: a 256-bit cryptographic hash with no practical collision risk and broad support. SHA-512 offers an even larger margin. For verifying authenticity against a malicious actor, a checksum alone is not enough — you also need a signature — but for catching accidental corruption, SHA-256 is the right tool.

## Practical Workflow

After downloading a file, compute its checksum and compare it to the value published by the distributor. Run the computation over the file in your browser — our file checksum tool supports CRC32, MD5, SHA-1, SHA-256, and SHA-512 — and match the result case-insensitively against the published digest. If they match, the file is intact; if they differ, re-download and verify again before installing or executing. For a batch of files, compute and compare several at once.

## Common Mistakes

The most common mistakes are comparing against the wrong algorithm (publishing SHA-256 but checking MD5), pasting the checksum with extra whitespace or line breaks, and trusting checksums transmitted over the same insecure channel as the file itself. A checksum only proves integrity, not authenticity — always fetch the reference digest from a trusted, ideally separate source, and prefer signature verification for anything critical.
---

## Related Resources

## Related Guides

- [Password Security](/guides/best-practices/password-security)
- [Image Optimization](/guides/best-practices/image-optimization)
- [SQL Formatting](/guides/best-practices/sql-formatting)
- [JWT Security](/guides/best-practices/jwt-security)
- [bcrypt Hashing](/guides/best-practices/bcrypt-hashing)

## Related Tools

- [file-checksum](/tools/file-checksum)
- [hash-generator](/tools/hash-generator)

