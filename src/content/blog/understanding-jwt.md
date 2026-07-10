## What Is a JWT and Why Is It the Standard for Modern Authentication

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, self-contained way to securely transmit information between parties as a JSON object. It has become the de facto standard for modern authentication and authorization in web applications, mobile apps, and microservices architectures. Unlike traditional server-side sessions, JWTs are stateless — the server does not need to keep a session store because all the information needed to verify a user's identity is contained within the token itself. This makes JWTs ideal for distributed systems, single sign-on (SSO), and RESTful APIs where horizontal scaling is critical. Every request carries proof of identity, and any service in the ecosystem can verify that proof without talking to a central database.

## JWT Structure: Header, Payload, and Signature

A JWT is composed of three Base64Url-encoded segments separated by dots: `header.payload.signature`. Each segment plays a distinct role.

The **Header** typically contains two fields: the signing algorithm (`alg`) and the token type (`typ`). For example: `{"alg": "HS256", "typ": "JWT"}`. The header tells the verifier which algorithm was used to generate the signature so it can reproduce and validate it.

The **Payload** contains the claims — statements about an entity (the user) and additional metadata. Claims fall into three categories. Registered claims are predefined, standardized keys like `iss` (issuer), `exp` (expiration time), `sub` (subject), `aud` (audience), and `iat` (issued at). Public claims are defined at will but should be collision-resistant, typically using namespaced URIs. Private claims are custom fields agreed upon between the issuer and the consumer, such as `role\
