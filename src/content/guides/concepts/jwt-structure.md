# JWT Structure: Complete Guide to JSON Web Tokens

## What Is a JWT?

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, self-contained way to securely transmit information between parties as a JSON object. It has become the de facto standard for modern authentication and authorization in web applications, mobile apps, and microservices architectures. Unlike traditional server-side sessions, JWTs are stateless — the server does not need to keep a session store because all the information needed to verify a user's identity is contained within the token itself. This makes JWTs ideal for distributed systems, single sign-on (SSO), and RESTful APIs where horizontal scaling is critical. Every request carries proof of identity, and any service in the ecosystem can verify that proof without talking to a central database.

## JWT Structure: Header, Payload, and Signature

A JWT is composed of three Base64Url-encoded segments separated by dots: `header.payload.signature`. Each segment plays a distinct role.

### Header

The **Header** typically contains two fields: the signing algorithm (`alg`) and the token type (`typ`). For example: `{"alg": "HS256", "typ": "JWT"}`. The header tells the verifier which algorithm was used to generate the signature so it can reproduce and validate it.

### Payload

The **Payload** contains the claims — statements about an entity (the user) and additional metadata. Claims fall into three categories:

- **Registered claims** — Predefined, standardized keys like `iss` (issuer), `exp` (expiration time), `sub` (subject), `aud` (audience), and `iat` (issued at)
- **Public claims** — Defined at will but should be collision-resistant, typically using namespaced URIs
- **Private claims** — Custom fields agreed upon between the issuer and the consumer, such as `role`, `tenantId`, or `permissions`

The payload is **not encrypted** — anyone who intercepts a JWT can decode and read its contents. This is why you must never put sensitive data like passwords or secret keys in a JWT payload.

### Signature

The **Signature** is the piece that makes JWT tamper-evident. To create the signature, you take the encoded header, the encoded payload, a secret key (for HMAC algorithms) or a private key (for RSA/ECDSA algorithms), and hash them together. The signature proves that the token was issued by a trusted party and that nobody has altered the payload since issuance. If even a single character in the payload is changed, the signature will no longer match, and the token will be rejected.

## JWT Signing Algorithms

JWTs support several signing algorithms, broadly categorized into symmetric and asymmetric schemes.

### Symmetric Algorithms (HMAC)

HS256, HS384, and HS512 use a single shared secret for both signing and verification. The server that creates the token and the server that verifies it must both possess the same secret key. This works well for monolithic applications or single-server deployments but becomes problematic in distributed systems because the secret must be shared across all services.

### Asymmetric Algorithms (RSA and ECDSA)

RS256, RS384, RS512, ES256, ES384, and ES512 use a key pair — a private key for signing and a corresponding public key for verification. Any service can verify a token using only the public key, without ever having access to the signing key. This is the preferred approach for microservices, third-party API integrations, and any scenario where tokens are verified by multiple independent services.

### Algorithm Choice Matters

The `alg` header is determined by the token creator, and the verifier trusts it. This creates a well-known attack vector: an attacker can change the `alg` header from `RS256` to `none` or from `RS256` to `HS256` and then sign with the public key (which is often publicly available). **Always validate the algorithm server-side and reject algorithms you did not explicitly allow.**

## How JWT Authentication Works

A typical JWT-based authentication flow works as follows:

1. **Login:** The user sends credentials (username and password) to the authentication server. The server validates the credentials against the database.

2. **Token issuance:** If the credentials are valid, the server creates a JWT containing claims like the user ID, roles, and expiration time. It signs the token with its private key or shared secret and returns it to the client.

3. **Client storage:** The client stores the JWT — typically in memory or an httpOnly cookie, never in localStorage for sensitive applications — and includes it in the `Authorization` header of subsequent requests: `Authorization: Bearer <token>`.

4. **Token verification:** On each request, the server extracts the JWT from the header, verifies the signature using the public key or shared secret, checks the expiration time, and processes the request if the token is valid.

5. **Refresh flow:** When the access token expires, the client uses a refresh token (a longer-lived token) to obtain a new access token without requiring the user to re-enter credentials. Refresh tokens are stored securely server-side and can be revoked if needed.

This stateless flow eliminates the need for server-side session storage, making it easy to scale horizontally across multiple servers or containers.

## JWT Security Best Practices

JWTs are powerful but come with well-known security pitfalls. Following these best practices will keep your implementation secure.

**Always validate tokens server-side.** Never trust a JWT just because it is well-formed. Verify the signature, check the expiration (`exp`), validate the issuer (`iss`) and audience (`aud`) claims, and ensure the token was intended for your service.

**Use short-lived access tokens.** Access tokens should expire in 15 minutes or less. This limits the window of damage if a token is compromised. Pair short access tokens with longer-lived refresh tokens that can be revoked.

**Never store JWTs in localStorage.** localStorage is accessible to any JavaScript running on the page, making it vulnerable to XSS attacks. Use httpOnly cookies or in-memory storage instead. If you must store tokens client-side, ensure your Content Security Policy strictly limits script sources.

**Reject tokens with unexpected algorithms.** Configure your JWT library to only accept the specific algorithms you use. Never allow the token's `alg` header to dictate which algorithm the verifier uses — this is the core of the `alg:none` attack.

**Use asymmetric algorithms for distributed systems.** RSA or ECDSA keys allow any service to verify tokens without possessing the signing key, reducing the blast radius of a key compromise.

**Include an expiration claim.** Every JWT should have an `exp` claim. Tokens without expiration remain valid indefinitely, which is a significant security risk if they are leaked.

**Rotate signing keys periodically.** Use key rotation to limit the impact of a compromised key. Many JWT libraries and cloud providers support automatic key rotation using JSON Web Key Sets (JWKS).

**Implement token revocation for sensitive operations.** While JWTs are inherently stateless, you may need to revoke tokens immediately (e.g., after a password change or account compromise). Maintain a short-lived blocklist for revoked tokens or use very short expiration times combined with refresh tokens.

## Common JWT Pitfalls

**Token bloat.** JWTs are encoded, not compressed. Putting large amounts of data in the payload increases request size and latency. Keep payloads minimal — store references (like user IDs) rather than full user profiles.

**Clock skew.** In distributed systems, servers may have slightly different system clocks. A token that appears expired on one server might still be valid on another. Account for a small clock tolerance (30-60 seconds) when validating the `exp` and `nbf` (not before) claims.

**Confusing authentication with authorization.** A valid JWT proves the user is who they claim to be (authentication), but it does not automatically grant them access to every resource (authorization). Always implement role-based or attribute-based access control alongside JWT validation.

**Storing sensitive data in the payload.** Remember that JWT payloads are base64-encoded, not encrypted. Anyone with the token can decode and read the claims. Never include passwords, credit card numbers, or other sensitive data in a JWT.

**Neglecting the refresh token flow.** Without refresh tokens, you face an uncomfortable trade-off: either access tokens live long enough to be convenient but risky if stolen, or they expire quickly but force users to re-login constantly. The refresh token pattern gives you both security and usability.

## When to Use JWTs

JWTs are an excellent choice for:

- **RESTful APIs** — Stateless authentication that scales horizontally without shared session stores
- **Single sign-on (SSO)** — Cross-domain authentication where a single token is trusted by multiple services
- **Microservices** — Asymmetric signing allows independent services to verify tokens without sharing secrets
- **Mobile apps** — Compact token format works well over constrained networks, and the client can decode claims without additional server calls
- **Third-party integrations** — APIs that issue tokens to external developers for scoped access (OAuth 2.0 uses JWTs extensively)

JWTs may not be the best choice for:

- **Real-time applications** that require immediate token revocation (use server-side sessions instead)
- **Applications with very large user profiles** that need to be attached to every request (use session references)
- **Scenarios where token size matters** — a JWT with many claims can add significant overhead to every HTTP request

## Quick Reference: Registered Claims

| Claim | Name | Description |
|-------|------|-------------|
| `iss` | Issuer | Identifies the principal that issued the JWT |
| `sub` | Subject | Identifies the principal that is the subject of the JWT |
| `aud` | Audience | Identifies the recipients that the JWT is intended for |
| `exp` | Expiration Time | Identifies the expiration time on or after which the JWT MUST NOT be accepted |
| `nbf` | Not Before | Identifies the time before which the JWT MUST NOT be accepted |
| `iat` | Issued At | Identifies the time at which the JWT was issued |
| `jti` | JWT ID | Provides a unique identifier for the JWT |

## Related Guides

- [JWT Security Best Practices](/guides/best-practices/jwt-security) — Deep dive on security
- [JWT Decoding & Troubleshooting](/guides/troubleshooting/jwt-decoding) — Debug token issues
- [HMAC Authentication](/guides/best-practices/hmac-authentication) — Sign API requests
- [bcrypt Password Hashing](/guides/best-practices/bcrypt-hashing) — Secure password storage

## Tools

- [JWT Decoder](/tools/jwt-decoder) — Decode and inspect JWT headers, payloads, signatures
- [JWT Generator](/tools/jwt-generator) — Create test tokens with custom claims
---

## Related Resources

## Related Guides

- [JSON Basics](/guides/concepts/json-basics)
- [Base64 Encoding](/guides/concepts/base64-encoding)
- [Cron Syntax](/guides/concepts/cron-syntax)
- [IP Subnetting](/guides/concepts/ip-subnetting)
- [Regex Fundamentals](/guides/concepts/regex-fundamentals)

## Related Tools

- [jwt-decoder](/tools/jwt-decoder)
- [jwt-generator](/tools/jwt-generator)

