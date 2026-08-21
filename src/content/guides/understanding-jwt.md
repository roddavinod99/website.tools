## What are JWTs?

JSON Web Tokens (JWT) are an open standard defined in RFC 7519 that provides a compact, URL-safe way to securely transmit information between parties as a JSON object. Because the token is self-contained, it can carry claims such as user identity, roles, and expiration directly in the payload without requiring a server-side session lookup. JWTs are used extensively in authentication and authorization flows, single sign-on, and API access control. They are signed with a secret or a public/private key pair, so the receiver can verify that the token was issued by a trusted party and has not been tampered with.

## JWT Structure

A JWT consists of three parts separated by dots: the Header, the Payload, and the Signature. The Header typically specifies the signing algorithm, such as HS256 or RS256, and the token type. The Payload contains the claims, which are name-value pairs describing the user or session, such as `sub`, `exp`, `iat`, and custom application data. The Signature is computed by encoding the header and payload and signing the result with the chosen algorithm and key. Each of the three parts is Base64Url-encoded, meaning a JWT is readable text but not encrypted — never place secrets or sensitive personal data in the payload. Use a tool like our JWT Decoder to inspect each part of a token and verify its signature.

## How JWTs Work

After a user successfully logs in, the server creates a signed JWT and returns it to the client. The client stores the token, typically in memory or in an httpOnly cookie, and includes it in the Authorization header of every subsequent request. When the server receives a request, it verifies the token's signature, checks the expiration claim, and extracts the user information from the payload without needing to query a session store. This stateless design makes JWTs ideal for horizontally scaled microservices and serverless architectures. The trade-off is that you cannot easily revoke a token before it expires, which is why short expiration times and refresh tokens are strongly recommended.

## Best Practices

Always transmit JWTs over HTTPS to prevent interception, and set short expiration times measured in minutes rather than hours. Prefer asymmetric algorithms like RS256 or ES256 so clients can verify tokens with a public key while only the issuer holds the private key. Never store sensitive data in the payload, since it is only Base64Url-encoded, not encrypted. Validate the issuer, audience, and expiration claims on every request, and treat unknown or unexpected claims with caution. Use our JWT Decoder to experiment with token structures and verify that the tokens your application issues are correctly formed and signed.