## What is an HMAC?

A Hash-based Message Authentication Code (HMAC) is a keyed hash used to verify both the integrity and the authenticity of a message. It combines a secret key with a cryptographic hash function (SHA-256 is the common choice) so that any party holding the key can compute and verify the code, but no one without the key can forge one. HMACs underpin some of the most important security features on the web: API request signing, webhook signature verification, JWT signing (HS256), and OAuth. If an attacker could modify a request or forge a webhook, HMAC verification stops them cold.

## How HMAC Works

HMAC processes the message with a hash function in a specific construction: it pads the key, computes an inner hash over the key and message, then an outer hash over the key and the inner result. The result is a fixed-size code — 256 bits for HMAC-SHA256 — that changes completely if the message or the key changes. Because the key is required to compute a valid code, a correct HMAC proves the message came from someone who knows the secret and was not altered in transit. This is why services sign webhooks and API requests with HMACs and verify on receipt.

## Practical Workflow

To verify a webhook or signed API request, recompute the HMAC over the raw request body with your shared secret and compare it to the signature in the header (using a constant-time comparison to avoid timing attacks). Use our HMAC generator to compute HMAC-MD5, HMAC-SHA1, HMAC-SHA256, or HMAC-SHA512 for any message and key, in your browser — ideal for testing signatures during development. Generate the same code with the same message, key, and algorithm to confirm your implementation matches.

## Common Mistakes

The most common mistakes are hashing the JSON-serialized body differently from how it was sent (whitespace and key order matter — sign the exact raw bytes), comparing signatures with `==` instead of a constant-time function (timing side channel), reusing the same key across algorithms or scopes, and using weak or predictable keys. Always sign the raw, unmodified body, use a cryptographically random secret of at least 32 bytes, and document the exact signing algorithm, key format, and header name so producers and consumers cannot drift.