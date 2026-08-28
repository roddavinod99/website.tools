## Why Generate Password Hashes?

Password hashing converts a plaintext password into a fixed-length digest that can be stored safely — if a database leaks, the hashes alone should not reveal the passwords. Unlike fast checksums, password hashes are deliberately slow and salted so that guessing is expensive. bcrypt is one of the most widely used password-hashing algorithms: it incorporates a per-password salt, is immune to rainbow tables, and has a tunable cost factor that can be increased as hardware improves. Generating a bcrypt hash is the first step in understanding how secure password storage works and in testing your login flow.

## How bcrypt Works

bcrypt takes a password and a salt (22 characters, generated randomly), and applies a costly key-derivation process based on the Blowfish cipher a configurable number of rounds. The output is a single string that contains the algorithm marker (`$2a$`, `$2b$`, or `$2y$`), the cost factor, the salt, and the hash itself. Because the salt is random per password, identical passwords produce completely different hashes. The cost factor (like 10 or 12) controls how many rounds — doubling it doubles the time to hash, which is the point: making each guess expensive for an attacker.

## Practical Workflow

When building authentication, hash the password with bcrypt before storing it, and never store plaintext or fast hashes like MD5 or SHA-256. Use a cost factor that keeps verification comfortably under about 300 ms on your hardware. To test, generate a bcrypt hash for a sample password with our bcrypt generator — it uses the Web Crypto API in your browser and even derives the PBKDF2 equivalent — then verify a matching password against it. Understand the output format so you can debug why a stored hash does not validate.

## Common Mistakes

The most common mistakes are using a low cost factor (too fast for attackers), ignoring bcrypt's 72-byte password input limit (longer passwords are truncated), mixing the `$2a$`, `$2b$`, and `$2y$` variants (subtle bug-compatibility differences between libraries), and reusing one salt for many passwords. Always generate a fresh random salt per password, store the full bcrypt string (it includes the salt), and for new systems consider Argon2id — the modern successor that is memory-hard and resists GPU cracking even better than bcrypt.
---

## Related Resources

## Related Guides

- [Password Security](/guides/best-practices/password-security)
- [Image Optimization](/guides/best-practices/image-optimization)
- [SQL Formatting](/guides/best-practices/sql-formatting)
- [JWT Security](/guides/best-practices/jwt-security)
- [HMAC Authentication](/guides/best-practices/hmac-authentication)

## Related Tools

- [bcrypt-generator](/tools/bcrypt-generator)
- [password-strength](/tools/password-strength)

