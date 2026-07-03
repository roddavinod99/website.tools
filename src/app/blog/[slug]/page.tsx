import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

const posts = [
  {
    title: "Getting Started with JSON: A Complete Guide",
    excerpt: "Learn everything you need to know about JSON, from basic syntax to advanced use cases in modern web development.",
    date: "June 28, 2026",
    readTime: "5 min",
    slug: "getting-started-json",
    content: `
## What is JSON?

JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that is easy for humans to read and write and easy for machines to parse and generate. It has become the de facto standard for data exchange on the web, largely because it is language-independent — most programming languages have libraries to parse and generate JSON. JSON is derived from JavaScript object literal syntax but is not limited to JavaScript. It is used everywhere: from REST APIs to configuration files, from NoSQL databases to real-time messaging systems.

## Why JSON Became the Standard

Before JSON, XML was the dominant format for data interchange. XML is powerful but verbose — it requires opening and closing tags for every piece of data. JSON is far more concise. A single user record that takes 8 lines in XML might take 3 lines in JSON. JSON also maps naturally to the data structures found in most programming languages: objects (dictionaries / hashmaps) and arrays (lists). This natural mapping means less boilerplate code when serializing or deserializing data. JSON is also native to JavaScript, the language of the web browser, so it requires no special parsing library on the client side. These factors — conciseness, familiarity, and native browser support — drove JSON to become the universal wire format for web APIs.

## JSON Syntax Rules

JSON syntax is strict by design. A JSON document is either a single object wrapped in curly braces or a single array wrapped in square brackets.

- Objects are enclosed in { } curly braces.
- Object keys must be double-quoted strings.
- Key-value pairs are separated by a colon :.
- Pairs within an object are separated by commas ,.
- Arrays are enclosed in [ ] square brackets.
- Values within arrays are separated by commas.

There are no comments in JSON. There are no trailing commas. There are no single-quoted strings. These restrictions exist to keep parsers simple, fast, and unambiguous.

## JSON Data Types

JSON supports exactly six data types:

- Strings — Must be enclosed in double quotes. Supports escape sequences like \\n, \\t, \\", and \\\\. Example: "Hello, world!"
- Numbers — Integer or floating point. No leading zeros, no special values like Infinity or NaN. Example: 42, 3.14, -7, 1.5e10
- Booleans — The literal values true or false (lowercase, unquoted).
- Null — The literal value null (lowercase, unquoted), representing the intentional absence of a value.
- Arrays — An ordered list of values enclosed in [ ]. Values can be of any type, and types can be mixed. Example: [1, "two", false, null]
- Objects — An unordered collection of key-value pairs enclosed in { }. Keys must be strings; values can be any valid JSON type. Example: {"name": "Alice", "age": 30}

Objects and arrays can be nested arbitrarily deep, making JSON expressive enough to represent complex data structures like API responses with pagination metadata, deeply nested configurations, or graph-like data.

## Common Mistakes

Even experienced developers make these JSON mistakes:

- Trailing commas — {"a": 1, "b": 2,} is invalid. Every major JSON parser will reject this. Get in the habit of checking the last element in an object or array.
- Unquoted keys — {name: "Alice"} is valid JavaScript but invalid JSON. Keys must be wrapped in double quotes: {"name": "Alice"}.
- Single quotes — {'name': 'Alice'} is never valid JSON. Use double quotes for both keys and string values.
- Undefined values — JSON has no undefined type. If you are serializing JavaScript, undefined values are either omitted (in objects) or converted to null (in arrays). Relying on this behavior can lead to subtle bugs.
- Comments — Many config file formats allow comments, but JSON does not. If you need comments, consider JSONC (JSON with Comments) or a different format like YAML.

## JSON.parse() and JSON.stringify()

These two JavaScript methods are the bridge between JSON strings and JavaScript objects.

JSON.parse(jsonString) takes a valid JSON string and returns a JavaScript object, array, or primitive. If the string is not valid JSON, it throws a SyntaxError. Always wrap JSON.parse() in a try-catch when parsing untrusted data.

JSON.stringify(value) does the reverse — it takes a JavaScript value and returns a JSON string. It accepts optional parameters: a replacer function or array to filter which properties are included, and a space parameter for pretty-printing.

The replacer parameter is especially useful for serializing objects that contain circular references (which would otherwise throw an error) or for excluding sensitive fields like passwords before sending data to a client.

## Working with APIs

JSON is the lingua franca of REST and GraphQL APIs. When a client sends a POST request to create a resource, the request body is typically a JSON object. When the server responds, the response body is also JSON.

A typical API request flow:

- The client builds a JavaScript object, calls JSON.stringify() on it, and sets the Content-Type: application/json header on the HTTP request.
- The server receives the JSON string, parses it into its own data structures, processes the request (e.g., inserts into a database), and sends back a JSON response.
- The client receives the response and calls JSON.parse() to convert it back into a usable object.

Most modern fetch APIs handle JSON transparently. In JavaScript, response.json() is a built-in method that reads the stream and parses it. In Python, the requests library provides response.json(). In Java, libraries like Jackson or Gson handle the mapping.

Always validate and sanitize JSON input from external sources before using it in your application. A malformed JSON payload or one with unexpected fields can crash a parser or introduce security vulnerabilities like mass-assignment attacks.

## JSON in Configuration Files

JSON is widely used for configuration files in the JavaScript and Node.js ecosystem.

- package.json — Every Node.js project uses this file to define metadata, dependencies, scripts, and entry points. It is strict JSON (no comments). Tools like npm and yarn read it to install packages and run commands.
- tsconfig.json — The TypeScript compiler configuration file. It specifies compiler options, files to include or exclude, and module settings.
- .eslintrc.json — ESLint configuration, though many teams now prefer JSONC, YAML, or JS config files to allow comments.
- manifest.json — Used by Progressive Web Apps (PWAs) to define the app name, icons, and display settings.
- chromiun-based browser extensions — Manifest files for extensions are JSON.

The rigidity of JSON (no comments, strict syntax) can be frustrating for config files that need explanations. Many tools now support JSONC (JSON with Comments) or alternative formats like YAML specifically because JSON lacks comment support.

## JSON Schema for Validation

JSON Schema is a specification for describing and validating the structure of JSON documents. It uses JSON itself to define rules about what fields are required, what types they should be, what ranges are acceptable, and more.

A simple JSON Schema for a user object validates that the document must be an object; it may have name (string), age (non-negative integer), and email (valid email format) properties; name and email are required, age is optional.

JSON Schema is useful for:

- API request validation — Reject malformed payloads before they reach business logic.
- Documentation generation — Tools can generate human-readable API docs from the schema.
- Form generation — Some UI libraries can produce input forms automatically from a schema.
- Test data generation — Schemas can drive faker libraries that produce realistic test data.

Popular validators include Ajv for JavaScript, jsonschema for Python, and networknt/json-schema-validator for Java.

## Performance Tips for Large JSON Documents

Processing JSON can become a bottleneck when dealing with large documents (megabytes or gigabytes). Here are practical tips:

- Stream parsing — Instead of loading the entire document into memory, use a streaming parser. Node.js has JSONStream and stream-json. These emit events as tokens are read, allowing you to process millions of records with constant memory usage.
- Avoid unnecessary stringification — If you are sending JSON over the network, consider compression (gzip / brotli). JSON compresses very well because of repeated key names. Many HTTP clients and servers handle this automatically.
- Use typed arrays and binary formats — For extremely high-throughput scenarios, consider Protocol Buffers, MessagePack, or FlatBuffers. These binary formats are smaller and faster to parse than JSON, at the cost of human readability.
- Optimize stringify with replacer arrays — If you are serializing large objects but only need a subset of fields, pass a replacer array to JSON.stringify(). This avoids traversing and serializing properties you do not need.
- Cache serialized results — If the same data is requested repeatedly (e.g., an API endpoint returning configuration), cache the serialized JSON string rather than serializing from scratch each time.
- Watch for deep nesting — Deeply nested objects can cause stack overflow in recursive parsers. Keep your JSON structure relatively flat if it will be parsed in environments with limited call stack depth.

## Alternatives to JSON

JSON is not the only data format. Each alternative has trade-offs.

- YAML — YAML is a superset of JSON (every valid JSON file is also valid YAML). It supports comments, multi-line strings, and anchors/references for deduplication. It is the preferred format for Kubernetes manifests, Docker Compose files, GitHub Actions workflows, and Ansible playbooks. The downside: YAML syntax is complex, and indentation-sensitive parsing can lead to subtle bugs.
- TOML — TOML (Tom Obvious, Minimal Language) is designed for configuration files. It uses INI-like sections ([section]) and key-value pairs. It is explicit, unambiguous, and easy to read. It is used by Rust Cargo package manager (Cargo.toml) and Python pyproject.toml. TOML is less expressive than JSON for nested data structures.
- XML — XML is older and more verbose than JSON. It supports attributes, namespaces, schemas (XSD), and transformations (XSLT). It is still dominant in enterprise environments (SOAP APIs, SVG, RSS/Atom feeds, Office file formats). For most web APIs, JSON has replaced XML, but XML remains important in document-centric applications.
- MessagePack — A binary serialization format that is more compact than JSON. It is useful when bandwidth or storage is constrained, but you lose human readability.
- CSV — For tabular data, CSV is simpler and more compact than an array of JSON objects. Many data science and analytics tools work better with CSV. CSV lacks type information (everything is a string) and does not support nested structures.

When to choose which? Use JSON as your default for APIs, configuration, and data storage. Use YAML when you need comments or are working in an ecosystem that already uses it (Kubernetes, CI/CD). Use TOML for language-specific configuration tooling (Cargo, pip). Use XML only when you need its advanced features (namespaces, schemas, transformations) or when interoperability with legacy systems requires it.
    `,
  },

  {
    title: "Understanding JWT Tokens: How They Work",
    excerpt: "A deep dive into JSON Web Tokens, including structure, signing algorithms, and security best practices.",
    date: "June 25, 2026",
    readTime: "8 min",
    slug: "understanding-jwt",
    content: `
## What Is a JWT and Why Is It the Standard for Modern Authentication

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, self-contained way to securely transmit information between parties as a JSON object. It has become the de facto standard for modern authentication and authorization in web applications, mobile apps, and microservices architectures. Unlike traditional server-side sessions, JWTs are stateless — the server does not need to keep a session store because all the information needed to verify a user's identity is contained within the token itself. This makes JWTs ideal for distributed systems, single sign-on (SSO), and RESTful APIs where horizontal scaling is critical. Every request carries proof of identity, and any service in the ecosystem can verify that proof without talking to a central database.

## JWT Structure: Header, Payload, and Signature

A JWT is composed of three Base64Url-encoded segments separated by dots: \`header.payload.signature\`. Each segment plays a distinct role.

The **Header** typically contains two fields: the signing algorithm (\`alg\`) and the token type (\`typ\`). For example: \`{"alg": "HS256", "typ": "JWT"}\`. The header tells the verifier which algorithm was used to generate the signature so it can reproduce and validate it.

The **Payload** contains the claims — statements about an entity (the user) and additional metadata. Claims fall into three categories. Registered claims are predefined, standardized keys like \`iss\` (issuer), \`exp\` (expiration time), \`sub\` (subject), \`aud\` (audience), and \`iat\` (issued at). Public claims are defined at will but should be collision-resistant, typically using namespaced URIs. Private claims are custom fields agreed upon between the issuer and the consumer, such as \`role\`, \`userId\`, or \`permissions\`. While the payload is Base64Url-encoded, it is not encrypted — anyone with the token can read its contents, so sensitive data must never be placed here without additional encryption.

The **Signature** is created by taking the encoded header and payload, concatenating them with a dot, and signing the result with a secret or private key using the algorithm specified in the header. The signature ensures the token has not been tampered with: if either the header or payload is modified in transit, signature verification fails.

## How Base64Url Encoding Differs from Standard Base64

Standard Base64 encoding uses \`+\` and \`/\` as the 62nd and 63rd characters and pads with \`=\`. This is problematic in URL contexts because \`+\` and \`/\` have special meanings in URLs and query strings. Base64Url encoding solves this by replacing \`+\` with \`-\` (minus) and \`/\` with \`_\` (underscore), and stripping trailing \`=\` padding characters. This makes the encoded string safe for inclusion in HTTP headers, URLs, and cookies without additional percent-encoding. When decoding a JWT segment, the process must be reversed: padding must be restored and \`-\` and \`_\` must be mapped back to \`+\` and \`/\` before feeding the string to a standard Base64 decoder.

## Signing Algorithms: HS256 vs RS256

Choosing the right signing algorithm is critical for security and architecture. The two most common are HS256 (HMAC with SHA-256) and RS256 (RSA signature with SHA-256).

**HS256** is a symmetric algorithm — the same secret key is used for both signing and verification. This makes it fast and simple. However, the shared secret must be distributed to every service that needs to verify the token, which creates a security risk. If any verifying service is compromised, the secret is leaked and tokens can be forged arbitrarily. HS256 is best suited for single-server applications or tightly controlled internal microservices where the blast radius of a key compromise is small and manageable.

**RS256** is an asymmetric algorithm — a private key signs the token, and a separate public key verifies it. The private key stays exclusively with the issuing server, while public keys can be freely distributed to any verifying service (often via a JWKS endpoint). If a verifying service is compromised, the attacker gains the public key (useless for forging) but not the private key. RS256 is the recommended choice for distributed systems, third-party integrations, and any scenario where the issuer and verifier are separate entities. The trade-off is slightly higher computational cost and larger signature sizes.

## The Complete Authentication Flow

Understanding the full flow of JWT-based authentication clarifies how each piece fits together.

**Step 1 — Login:** The user submits credentials (username and password) to the authentication server. The server validates these against its database using a secure password hashing algorithm like bcrypt or Argon2.

**Step 2 — Token Creation:** If credentials are valid, the server constructs a JWT. It creates a header specifying the algorithm (typically RS256), builds a payload with the user's identifier and any relevant claims (role, permissions, expiration), then signs the token with the private key. The server may issue two tokens: a short-lived access token and a longer-lived refresh token.

**Step 3 — Client Storage:** The client receives the JWT(s) in the response body. The access token should be stored in memory (a JavaScript variable) or in an httpOnly, Secure, SameSite cookie. It should never be stored in localStorage due to XSS vulnerabilities. The refresh token is typically stored in an httpOnly cookie or a secure, dedicated storage mechanism.

**Step 4 — Authorization Header:** On every subsequent request to protected resources, the client includes the access token in the HTTP \`Authorization\` header using the Bearer scheme: \`Authorization: Bearer <token>\`. This header tells the server to treat the request as authenticated for the user identified in the token.

**Step 5 — Verification:** The receiving server extracts the token from the Authorization header, splits it into its three parts, Base64Url-decodes the header and payload, recomputes the signature using the appropriate key (public key for RS256, shared secret for HS256), and compares it to the provided signature. If they match and the token has not expired (\`exp\` claim), the server trusts the claims and processes the request for the identified user. If verification fails at any step, the server returns a 401 Unauthorized response.

## Access Tokens vs Refresh Tokens

Access tokens are short-lived (typically 5 to 30 minutes). They are the credential presented with every request. Their short lifespan limits the damage if one is leaked — by the time an attacker uses a stolen access token, it has likely expired. Short access tokens also mean that revoking a user's access takes effect quickly because stale tokens expire naturally.

Refresh tokens are long-lived (days to months). They are used solely to obtain new access tokens without requiring the user to re-authenticate. When an access token expires, the client presents the refresh token to a dedicated endpoint, which validates it and issues a fresh access token (and optionally a new refresh token, enabling refresh token rotation). Refresh tokens should be stored more securely than access tokens and can be revoked or blacklisted server-side if needed. This two-token architecture balances security with user experience: sessions persist across page reloads and browser restarts, but the actual authenticating credential is ephemeral.

## Security Best Practices

JWTs are only as secure as their implementation. Following established best practices prevents the majority of attacks.

**Short expiration:** Always set an \`exp\` claim with a short lifetime for access tokens (minutes, not hours). This limits the window of opportunity for token misuse.

**HTTPS only:** Transmit all tokens exclusively over TLS. Without HTTPS, tokens are transmitted in plaintext and can be intercepted by anyone on the same network. Enforce HSTS to prevent downgrade attacks.

**Proper secret management:** For HS256, use a cryptographically random secret of sufficient length (at least 256 bits). For RS256, protect the private key with restricted file permissions, a hardware security module, or a secrets vault. Never hardcode secrets in source code or configuration files committed to version control.

**Algorithm whitelisting:** Always validate that the \`alg\` field in the JWT header matches an expected value. Without this check, an attacker can change \`alg\` to \`"none"\` and bypass signature verification entirely, or downgrade RS256 to HS256 and sign tokens using the leaked public key.

**Validate all claims:** Check not only the signature but also \`exp\` (expiration), \`nbf\` (not before), \`iss\` (issuer), and \`aud\` (audience) against expected values. This prevents token reuse across different applications or environments.

## Common Attacks

**None algorithm attack:** The attacker sets \`"alg": "none"\` in the header and removes the signature entirely. If the server's JWT library processes tokens with \`alg: none\` without requiring a signature, the attacker can forge arbitrary identities. Mitigation: reject tokens with \`alg: none\` unless explicitly intended and configured.

**Token leakage via XSS:** A cross-site scripting vulnerability allows an attacker to execute JavaScript in the victim's browser and steal tokens stored in localStorage or accessible JavaScript variables. Mitigation: store access tokens in httpOnly cookies (inaccessible to JavaScript) and sanitize all user input.

**CSRF attacks:** When tokens are stored in cookies, they are automatically sent with every request. An attacker can craft a malicious page that triggers requests to the target site, leveraging the victim's authenticated session. Mitigation: use SameSite cookies, anti-CSRF tokens, or send the JWT in the Authorization header instead of a cookie.

**Replay attacks:** An attacker intercepts a valid JWT and reuses it before it expires. Since the server is stateless, it cannot distinguish the legitimate request from the replayed one. Mitigation: use short token lifetimes, implement token fingerprinting (binding the token to a specific client or session), or use nonce values.

## JWT vs Session-Based Authentication

Session-based authentication stores session data on the server and gives the client a session ID cookie. JWT-based authentication encodes all session data into the token itself and stores it on the client.

**JWT advantages:** Statelessness eliminates database lookups on every request, simplifying horizontal scaling. Tokens are portable across domains and services, enabling SSO and microservice architectures. The payload is self-contained, so any service can verify a token without accessing a shared session store.

**Session-based advantages:** Sessions can be revoked instantly by deleting the server-side record — there is no reliance on token expiration. Session data never leaves the server, eliminating the risk of payload tampering or sensitive data leakage via the client. Implementation is simpler and does not require managing key rotation, algorithm selection, or token lifecycle concerns.

The right choice depends on the use case. Microservice ecosystems, mobile APIs, and third-party integrations benefit from JWT's statelessness and portability. Traditional server-rendered web applications with server-side session stores may find session-based auth simpler and more secure out of the box. Many modern systems use a hybrid approach: session-based auth for the web frontend with a JWT-based API layer underneath.

## How to Decode and Inspect JWTs for Debugging

Debugging JWT issues — expired tokens, incorrect claims, malformed signatures — requires inspecting the decoded contents. While a JWT can be decoded manually by splitting on dots and Base64Url-decoding each segment, using a dedicated tool is faster and prevents mistakes.

Our JWT Decoder tool accepts a raw token and displays the decoded header and payload in a readable format, highlighting the algorithm, expiration status, and all claims. This is invaluable during development when you need to verify that the correct claims are being embedded, that expiration times are accurate, and that the token format is valid. The tool also surfaces common issues such as missing required claims, incorrect audience values, and mismatched algorithms. For production debugging, always combine token inspection with server-side logging to trace the full authentication chain from issuance to verification.
    `,
  },

  {
    title: "Image Optimization for the Web",
    excerpt: "Best practices for optimizing images to improve page load times without sacrificing quality.",
    date: "June 20, 2026",
    readTime: "6 min",
    slug: "image-optimization",
    content: `
## Why Image Optimization Matters

Images make the web beautiful, but they come at a cost. As of 2026, images account for over 50% of the average webpage's total weight — roughly 900 KB out of a 1.8 MB page. That makes them the single biggest contributor to page load times. When your pages are slow, users leave. Studies consistently show that a one-second delay in page load reduces conversions by 7%, and 53% of mobile users abandon a site that takes longer than three seconds to load.

Google's Core Web Vitals directly measure image performance through Largest Contentful Paint (LCP). LCP tracks when the main content of a page becomes visible. Since hero images and large photos are often the LCP element, bloated images directly hurt your LCP score. Google recommends an LCP of under 2.5 seconds. Every unoptimized kilobyte pushes that metric further into the red, which can impact search rankings.

Beyond metrics, image optimization improves user experience on slow networks, reduces bandwidth costs for both you and your visitors, and shrinks storage requirements. It is one of the highest-ROI performance improvements you can make.

## Choosing the Right Image Format

Not all images are created equal, and neither are formats. Picking the right format for each use case is the first and most impactful optimization decision.

- **JPEG** — The workhorse of the web for photographs and complex images with gradients. JPEG uses lossy compression to dramatically reduce file size while maintaining acceptable visual quality. It does not support transparency. Best for photos at quality levels between 70 and 85.

- **PNG** — Ideal when you need transparency or when rendering screenshots, diagrams, or text-heavy graphics. PNG uses lossless compression, so no detail is lost, but file sizes are significantly larger than JPEG for photographic content. Never use PNG for photos.

- **GIF** — The only format natively supporting animation on the web for decades. Severely limited by its 256-color palette and poor compression. Modern workflows should replace GIF with video formats (MP4, WebM) or animated WebP for drastically smaller file sizes.

- **WebP** — Developed by Google, WebP provides superior compression compared to both JPEG and PNG. It supports both lossy and lossless modes, transparency, and animation. Lossy WebP is typically 25–35% smaller than equivalent-quality JPEG. Browser support is now universal. It should be your default format for raster images.

- **AVIF** — The newest contender, based on the AV1 video codec. AVIF offers even better compression than WebP — often 50% smaller than JPEG at the same quality — with support for HDR, wide color gamut, and transparency. Browser support is good but not universal yet. Use it as an enhancement for supported browsers via the \`<picture>\` element.

- **SVG** — The only vector format in this list. Use SVG for icons, logos, illustrations, and any graphic that scales. SVGs are resolution-independent, infinitely scalable, and usually tiny in file size. They can also be styled and animated with CSS and JavaScript.

## Lossy vs Lossless Compression

Compression falls into two camps, and knowing when to use each is critical.

**Lossy compression** permanently removes image data that the human eye is less likely to notice — subtle color variations, high-frequency detail, and noise. The result is a much smaller file with a trade-off in quality. The key is finding the sweet spot where quality remains acceptable. For JPEG and lossy WebP, quality settings of 75–85 are typical. Lossy compression is appropriate for photographs, complex illustrations, and any image where a slight quality reduction is imperceptible.

**Lossless compression** reduces file size without discarding any pixel data. It works by finding more efficient ways to encode the same information — for example, run-length encoding of repeated pixels. PNG and lossless WebP use this approach. File size savings are modest (typically 5–20%) compared to lossy, but zero quality is sacrificed. Use lossless compression for screenshots, diagrams, logos, and any image where every pixel must be preserved.

A common strategy is: use lossy for photos and complex images, lossless for graphics with sharp edges and text. WebP and AVIF let you choose either mode per image.

## Responsive Images with srcset and sizes

Serving a 4000px-wide desktop image to a 375px-wide phone screen wastes bandwidth and slows down the mobile experience. The \`srcset\` and \`sizes\` attributes on \`<img>\` solve this by letting the browser choose the best source based on the user's viewport.

\`\`\`html
<img
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w,
    photo-2000.jpg 2000w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1200px) 80vw,
    60vw
  "
  alt="A mountain landscape at sunset"
>
\`\`\`

The \`srcset\` attribute lists image candidates with their intrinsic widths in pixels (the \`w\` descriptor). The \`sizes\` attribute tells the browser how much of the viewport the image will occupy at different breakpoints. The browser then picks the smallest candidate that fits the device's pixel ratio and viewport size. This is essential for responsive design and directly improves LCP by avoiding oversize downloads on small screens.

Always include a fallback \`src\` for browsers that do not support \`srcset\`.

## Art Direction and Format Fallback with \`<picture>\`

The \`<picture>\` element handles two scenarios \`srcset\` alone cannot: art direction and format-based fallbacks.

**Art direction** means serving visually different crops at different screen sizes. A wide landscape shot might look great on desktop but needs a tight portrait crop on mobile to keep the subject visible. The \`<picture>\` element with multiple \`<source>\` children and \`media\` attributes handles this cleanly:

\`\`\`html
<picture>
  <source media="(max-width: 600px)" srcset="photo-mobile.jpg">
  <source media="(max-width: 1200px)" srcset="photo-tablet.jpg">
  <img src="photo-desktop.jpg" alt="A mountain landscape at sunset">
</picture>
\`\`\`

**Format fallback** lets you serve cutting-edge formats like AVIF or WebP while falling back to JPEG for unsupported browsers:

\`\`\`html
<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" alt="A mountain landscape at sunset">
</picture>
\`\`\`

The browser selects the first \`<source>\` whose type and media query match. The inner \`<img>\` is always required — it provides the fallback and ensures accessibility attributes are exposed to assistive technology.

## Lazy Loading

Not every image needs to load immediately. Images below the fold — those not visible on the initial viewport — can wait until the user scrolls near them. This technique, called lazy loading, reduces initial page weight and speeds up LCP.

**Native lazy loading** is the simplest approach. Add \`loading="lazy"\` to your \`<img>\` tags:

\`\`\`html
<img src="photo.jpg" loading="lazy" alt="...">
\`\`\`

The browser handles the rest, deferring the image load until it approaches the viewport. Use \`loading="eager"\` (the default) for above-the-fold images you want loaded immediately — typically your LCP element.

For older browsers or when you need more control, the **Intersection Observer API** provides a JavaScript-based approach:

\`\`\`javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
\`\`\`

Pair lazy loading with a low-quality placeholder or a dominant-color background to fill the image area before the real image loads, preventing layout shifts.

## Image CDNs for Automatic Optimization

An Image CDN (Content Delivery Network) is the single most impactful tool for production image pipelines. Services like Cloudinary, Imgix, and Cloudflare Images provide URLs with query parameters that control format, size, quality, and cropping on the fly.

For example, a Cloudinary URL might look like:

\`\`\`
https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1/photo.jpg
\`\`\`

The \`f_auto\` parameter serves the most efficient format the browser supports (WebP or AVIF), \`q_auto\` applies optimal compression, and \`w_800\` resizes to 800 pixels wide. The CDN caches every variant at the edge, so subsequent requests are lightning fast.

Benefits include automatic format negotiation, on-the-fly resizing and cropping, compression tuning, and global CDN delivery with low latency. For any serious website, an Image CDN pays for itself in bandwidth savings alone.

## Tools of the Trade

You do not need a CDN for local development. A handful of tools handle the job just fine.

**Image Compressor and Image Resizer** — Our own in-browser tools for quick, one-off optimization. The Image Compressor applies lossy compression with visual quality preview, while the Image Resizer handles dimension scaling. Both are ideal for designers and content creators who need optimized uploads without touching the command line.

**Squoosh** — Google's open-source web app and CLI tool that compresses, resizes, and converts between formats. It provides side-by-side quality comparison and supports JPEG, PNG, WebP, and AVIF. The CLI is perfect for batch processing in build scripts.

**Sharp** — The go-to Node.js library for high-performance image processing. It is used by Next.js, Gatsby, and countless build pipelines. Sharp handles resizing, format conversion, compression, and more at native speed:

\`\`\`javascript
const sharp = require('sharp');

await sharp('input.jpg')
  .resize(1200)
  .webp({ quality: 80 })
  .toFile('output.webp');
\`\`\`

**libvips** — The underlying C library that powers Sharp. It is fast, memory-efficient, and available as a command-line tool (\`vips\`) for shell scripting.

## A Real-World Workflow

Here is how a raw 5 MB photo from a camera gets optimized for the web, step by step.

**Step 1: Compress.** Apply lossy compression with Sharp or Squoosh at quality 80. This usually cuts the file by 60–80% with no visible quality loss.

**Step 2: Resize.** Scale the image to the largest display size it will ever need — typically 2000px for full-width hero images, 800px for content images, and 400px for thumbnails. Generate multiple widths for \`srcset\`.

**Step 3: Convert to WebP (and AVIF).** Encode the resized images as WebP and optionally AVIF. Set up a \`<picture>\` element with format fallback to JPEG.

**Step 4: Serve via CDN.** Deploy the optimized images to an image CDN or a static host with CDN support. Enable caching headers with a long max-age (one year for versioned filenames).

**Step 5: Lazy load.** Add \`loading="lazy"\` to all below-fold images. Use a low-quality or blurred placeholder to reserve space and prevent layout shift.

The result: a 5 MB JPEG becomes a 60 KB WebP served at the perfect resolution for each device, cached at the edge, and loaded only when needed. That is a 98% reduction in image weight with no perceptible quality loss to the user.

## Accessibility: Alt Text and Meaningful Filenames

Optimization is not just about bytes — it is about people. Every image must have meaningful \`alt\` text that describes its content or function for screen reader users. Decorative images should have \`alt=""\` (empty) so screen readers skip them.

\`\`\`html
<!-- Informative image -->
<img src="chart-sales-2025.png" alt="Bar chart showing a 40% increase in Q4 sales">

<!-- Decorative image -->
<img src="background-texture.jpg" alt="">
\`\`\`

Good alt text is concise, descriptive, and context-dependent. Do not write "Image of" or "Picture of" — screen readers already announce it as an image.

**Meaningful filenames** matter too. A file named \`IMG_4923.JPG\` tells search engines and assistive technology nothing. Rename to \`mountain-landscape-sunset.jpg\` before uploading. Use hyphens between words. Descriptive filenames also help with SEO and content management.

Finally, ensure sufficient color contrast in any text-over-image scenarios. Avoid placing text on busy backgrounds, and use text shadows or overlay gradients to maintain readability.

## Putting It All Together

Image optimization is not a single task but a pipeline. Choose the right format, compress intelligently, serve multiple resolutions, lazy load what you can, cache aggressively, and always include descriptive alt text. Implement these practices and you will cut page weight by 50% or more, improve your Core Web Vitals scores, and deliver a faster, more accessible experience to every user.

The tools are free, the techniques are well-documented, and the payoff is immediate. Start optimizing your images today.
    `,
  },

  {
    title: "Password Security: Best Practices for 2026",
    excerpt: "A comprehensive guide to password security, including password managers, passkeys, and what to do if you're breached.",
    date: "June 15, 2026",
    readTime: "12 min",
    slug: "password-security",
    content: `
# Password Security: Best Practices for 2026

## Why Password Security Still Matters

With the rise of passkeys, biometrics, and hardware security keys, one might ask: are passwords dead? The short answer is no — not even close. In 2026, passwords remain the most common authentication method across the web, and they are still the primary attack vector for account compromise. While passwordless technologies are growing fast, the vast majority of services still rely on passwords, and the transition to a fully passwordless web will take years.

The reality is that passwords are the bedrock of digital identity. Even services that support passkeys or biometrics typically fall back to a password when a device is lost, a browser is unrecognized, or cross-platform access is needed. Moreover, many enterprise environments, legacy systems, and government portals still mandate password-based login. Ignoring password security in 2026 is like ignoring locks on your doors because you have a security camera — both are necessary layers of defense.

Credential theft remains the leading cause of data breaches, responsible for over 60% of incidents according to recent Verizon DBIR reports. Cybercriminals have not slowed down; they have automated credential stuffing, refined phishing techniques, and leveraged AI to crack weak passwords faster than ever. Password security is not obsolete — it has evolved. The stakes are higher because accounts now hold more sensitive data, from financial portfolios and medical records to smart home access and cryptocurrency wallets.

The goal of this post is to give you a comprehensive, actionable guide to password security in 2026 — covering everything from what makes a strong password to what to do when you have been breached. Whether you are a casual internet user or a security professional, these best practices will help you stay ahead of threats.

## What Makes a Password Strong

The conventional wisdom used to be: mix uppercase, lowercase, numbers, and symbols, and change it every 90 days. We now know that advice was flawed. Let us break down what actually makes a password strong in 2026.

### Length Over Complexity

The single most important factor in password strength is length — not complexity. A 12-character lowercase-only password is far stronger than an 8-character password with every special character on the keyboard. Why? Because entropy scales exponentially with length, while complexity adds only a linear boost.

Think of it this way: each additional character multiplies the number of possible combinations by the size of the character set. Adding one lowercase letter multiplies possibilities by 26. Adding one character from a set of 72 possible symbols multiplies by 72. But a 16-character password with only lowercase letters (26^16) has astronomically more combinations than an 8-character password with full complexity (72^8). In practical terms: 26^16 ≈ 4.3 × 10^22, while 72^8 ≈ 7.2 × 10^14. The longer password is about 60 million times harder to brute force.

The 2026 recommendation is simple: use passwords that are at least 16 characters long. For maximum security, aim for 20 to 30 characters. A passphrase — a string of random common words separated by spaces — is an excellent way to achieve length while remaining memorable. For example, "correct horse battery staple staple" is far more secure and easier to remember than "P@ssw0rd!".

### Entropy Explained

Entropy measures how unpredictable a password is, expressed in bits. Each bit of entropy doubles the number of attempts needed to guess the password. A password with 40 bits of entropy can be cracked in seconds by a modern GPU; one with 80 bits would take centuries.

A truly random 12-character password from a 72-character set has about 74 bits of entropy — strong enough for most purposes. A random 16-character password has about 99 bits — overkill for everything except high-value targets. A four-word random passphrase from a 7776-word dictionary has about 51 bits — decent but borderline. A five-word passphrase jumps to about 64 bits, which is solid. Use the Electronic Frontier Foundation's large word list or Diceware for generating passphrases.

### Avoiding Patterns

Attackers do not brute force randomly — they use smart algorithms that try common patterns first. Never use:
- Sequential characters (abcd, 1234, qwerty)
- Keyboard patterns (asdf, zxcv, qwertyuiop)
- Repeated characters (aaaaaa, 111111)
- Personal information (birthdays, pet names, anniversaries, ZIP codes)
- Common substitutions (P@ssw0rd, letmein, iloveyou)
- Leet speak variations (h4ck3r, s3cur3)
- Dictionary words in isolation (password, sunshine, monkey)
- Any variation of your username, email, or service name

Attack tools like Hashcat and John the Ripper come with rule sets that automatically try leet speak substitutions, common patterns, and mutations of known passwords. If your password follows a predictable pattern, it will be cracked in minutes regardless of length.

## Password Managers

### How They Work

A password manager is a software application that stores your credentials in an encrypted vault. You unlock the vault with one strong master password — the only password you need to remember. The vault contents are encrypted locally on your device using strong symmetric encryption (typically AES-256) before being synced to the cloud. Even if the password manager provider is breached, your vault data remains unreadable because the encryption key is derived from your master password, which the provider never knows.

Modern password managers generate, store, and auto-fill passwords across your devices. They integrate with browsers via extensions and with mobile devices through system-level autofill APIs. When you visit a login page, the password manager identifies the site and fills in your credentials — protecting you from phishing because it will not autofill on a lookalike domain.

### Why They Are Essential

The human brain cannot reliably remember dozens of unique, random, 16-character passwords. Without a password manager, users inevitably reuse passwords across multiple sites. Credential reuse is the single most dangerous password behavior — if one site gets breached, attackers immediately try those same credentials on banking, email, and social media accounts. Password managers eliminate this risk by making it trivial to have a unique, strong password for every single account.

Beyond generating and storing passwords, password managers also:
- Sync passwords across all your devices (phone, laptop, tablet)
- Alert you about weak, reused, or compromised passwords
- Support secure password sharing with family or team members
- Store other sensitive data securely (credit cards, secure notes, identities)
- Detect phishing sites by domain matching
- Work offline with local vault access

### Features to Look For

Not all password managers are equal. When choosing one in 2026, look for:
- Zero-knowledge encryption architecture — the provider cannot decrypt your vault
- AES-256-GCM encryption at minimum; bonus for XChaCha20 support
- Argon2id key derivation (resist GPU cracking of the master password)
- Strong multi-factor authentication support — preferably FIDO2/WebAuthn for vault access
- Cross-platform support: Windows, macOS, Linux, iOS, Android, browser extensions
- Local vault storage option or self-hosted sync (e.g., Bitwarden, KeePassXC)
- Built-in breach monitoring that checks your credentials against known breaches
- Password health reports that identify weak, reused, or old passwords
- Emergency access feature — designate a trusted contact who can request vault access
- Open-source codebase (allows independent security audits)
- Regular third-party security audits with published results

Top recommendations for 2026: Bitwarden (best balance of features, price, and security), 1Password (excellent UX and Secret Key model), and KeePassXC (best for offline/local-only use). Avoid browser-built-in password managers for critical accounts — they lack zero-knowledge architecture and advanced security features.

## Two-Factor Authentication

Passwords alone are insufficient. Even the strongest password can be phished, keylogged, or leaked in a breach. Two-factor authentication adds a second verification factor — something you have (phone, hardware key) or something you are (fingerprint, face) — making it exponentially harder for attackers to access your account.

### TOTP Apps (Time-Based One-Time Passwords)

TOTP is the most widely supported form of 2FA. It works by generating a six-digit code from a shared secret using the current time. The code changes every 30 seconds. Apps like our TOTP Generator, Authy, Google Authenticator, and Aegis implement this standard.

TOTP has several advantages: it works offline, is free, works across devices via app, and is supported by almost every service. The primary downside is phishing vulnerability — an attacker can trick you into entering your TOTP code on a fake site and immediately use it on the real site.

Our TOTP Generator implements RFC 6238 and supports SHA-1, SHA-256, and SHA-512 hashing algorithms with configurable digit lengths and time steps. For maximum security, use SHA-512 with 8-digit codes and a 30-second window.

### Hardware Keys (FIDO2/WebAuthn)

Hardware security keys — like YubiKey, Nitrokey, or Google Titan — provide the highest level of account protection. They are physical devices that authenticate you via public-key cryptography. When you register a hardware key with a service, the key generates a key pair: the private key never leaves the device, and the public key is stored with the service. To authenticate, you physically tap the key, proving possession.

WebAuthn (the web standard for FIDO2) is phishing-resistant because the key verifies the domain before signing the authentication request. Unlike TOTP codes, a hardware key's response is bound to the specific website — a phishing site cannot relay it to the real one. This makes hardware keys immune to phishing, man-in-the-middle attacks, and session hijacking.

The major drawback is cost (typically $25–$70 per key) and the need for backups — if you lose your only key without a backup, you risk account lockout. Best practice is to buy two keys and register both. Also, not all services support hardware keys yet, though adoption is growing rapidly.

### SMS — Avoid If Possible

SMS-based 2FA is better than no 2FA, but barely. SIM swapping attacks — where an attacker socially engineers your mobile carrier into transferring your phone number to their SIM card — have become alarmingly common and easy. Once an attacker controls your number, they can intercept all SMS-based 2FA codes. In 2023 alone, the FBI reported over 1,000 SIM swapping incidents per month with losses exceeding $50 million.

Avoid SMS 2FA wherever possible. If a service only offers SMS, migrate away from that service if you can. If you must use SMS, add a PIN or port-out lock to your mobile carrier account and consider using a VoIP number (like Google Voice) that is harder to SIM swap.

## Passkeys and Passwordless Authentication

Passkeys represent the most significant evolution in authentication since the password itself. Backed by Apple, Google, Microsoft, and the FIDO Alliance, passkeys are a standardized implementation of WebAuthn that allows cross-device, phishing-resistant authentication without passwords.

A passkey is a discoverable FIDO2 credential stored securely on your device — either in a platform authenticator (Apple's iCloud Keychain, Google Password Manager, Windows Hello) or on a hardware security key. When you log into a service, your device performs a cryptographic challenge using the private key stored on it. You authorize the operation with your device's biometric (Face ID, Touch ID, Windows Hello) or PIN.

The key advantages of passkeys:
- No passwords to remember, type, or manage
- Phishing-resistant by design — each passkey is bound to a specific origin
- Synced across devices via end-to-end encrypted cloud sync (iCloud Keychain, Google Password Manager)
- Works across operating systems using QR codes and Bluetooth proximity (FIDO Cross-Device Authentication)
- Resistant to server-side breaches — the private key never leaves your device

In 2026, major platforms support passkeys: Google accounts, Apple IDs, GitHub, PayPal, eBay, and many others. The FIDO Alliance reports that passkey adoption has tripled in the last year. However, passkeys are not a silver bullet. They require a compatible device ecosystem, fallback mechanisms must exist (usually a password), and enterprise management is still maturing. For the average user, passkeys are the most secure and convenient option for the services that support them.

The future is hybrid: password managers are evolving to store and sync passkeys alongside traditional passwords, creating a unified credential management system. Expect that by 2028, most new accounts will default to passkey registration, with passwords becoming the fallback rather than the primary method.

## Common Attacks

Understanding how attackers operate helps you defend against them. Here are the most common password-related attacks in 2026.

### Brute Force Attack

The attacker tries every possible combination of characters until the password is found. Modern GPUs can try billions of hashes per second. A 2019 benchmark showed an RTX 4090 can attempt over 100 billion NTLM hashes per second. Against that speed, an 8-character password with mixed case falls in under 2 hours. This is why length is critical — every additional character multiplies the search space exponentially, making brute force infeasible beyond a certain length.

### Dictionary Attack

A smarter version of brute force that tries words from a dictionary list, including common passwords, phrases, and mutations. Attackers use massive wordlists like RockYou (14 million passwords), Have I Been Pwned (over 600 million real passwords), and CrackStation (over 1.5 billion entries). If your password is a common word, name, or phrase, a dictionary attack will find it instantly.

### Credential Stuffing

Attackers take username-password pairs leaked in one breach and try them on other services. This is devastatingly effective because an estimated 65% of users reuse passwords across multiple sites. Automated tools like OpenBullet can test millions of credential pairs per hour against hundreds of services. Credential stuffing is why every account must have a unique password — a breach at a forum you used in 2012 should not compromise your current bank account.

### Phishing

The attacker sends a deceptive email, text, or website that mimics a legitimate service to trick you into entering your credentials. Modern phishing is sophisticated — phishers clone real login pages, register domains that look nearly identical (rnicrosoft.com vs microsoft.com), and use HTTPS certificates to make the page look legitimate. AI-generated phishing emails are indistinguishable from genuine ones, with perfect grammar and context-aware content. Spear phishing targets specific individuals using personal information gathered from social media and data brokers.

### Keylogging

Malware records every keystroke you type and sends them to an attacker. Keyloggers can be software (installed via trojan, exploit, or malicious download) or hardware (a physical device inserted between the keyboard and computer). Password managers defeat keyloggers because the password is not typed — it is auto-filled directly into the form field, bypassing the keyboard input entirely.

### SIM Swapping

The attacker convinces your mobile carrier to transfer your phone number to a SIM card they control. Once successful, they receive your SMS 2FA codes, password reset links, and account recovery messages. SIM swapping is the primary reason SMS 2FA is dangerous. Use TOTP apps or hardware keys instead, and add a carrier PIN or port-out lock to your mobile account.

## NIST Guidelines (Updated 2024-2026)

The National Institute of Standards and Technology (NIST) publishes authentication guidelines in their Special Publication 800-63B, which has been updated several times. The current guidance (2024-2026 revisions) represents a major shift from earlier recommendations.

### Key Changes

- Minimum 8 characters: The absolute minimum password length is 8 characters, down from earlier guidance. However, NIST recommends 12-16 characters for user-chosen passwords and 6+ random characters for machine-generated passwords.
- Check against breached password lists: Every password must be checked against a database of known breached passwords (like Have I Been Pwned) at creation time. If a password appears in a breach, it must be rejected. This is now standard in enterprise environments and many consumer services.
- Stop periodic rotation: NIST no longer recommends mandatory password expiration every 60-90 days. Studies showed that forced rotation led to weaker passwords (Password1, Password2, Password3) and did not improve security unless there was evidence of compromise. Only require a password change when there is suspicion of breach.
- No more complexity requirements: NIST no longer mandates a mix of character types. Length and unpredictability are more important. However, users should still be allowed to use any characters they choose, including spaces and Unicode characters.
- Allow paste functionality: Password fields must support pasting (to enable password manager use). No arbitrary limits on character length — allow at least 64 characters.
- Rate limiting: Services must implement rate limiting and account lockout after a small number of failed attempts.
- MFA encouragement: NIST strongly recommends phishing-resistant multi-factor authentication (FIDO2/WebAuthn) as the preferred approach.

These guidelines reflect a fundamental shift from password rules that burden users to password policies that leverage technology — checking against breach databases, encouraging password managers, and moving toward passwordless authentication.

## Enterprise Best Practices

Organizations face unique password security challenges: thousands of employees, hundreds of SaaS applications, legacy systems, and compliance requirements. Here are the enterprise best practices for 2026.

### Single Sign-On (SSO)

SSO allows employees to authenticate once and access multiple applications. This reduces the number of passwords employees need to remember (and therefore reuse). Centralized authentication also means stronger security controls can be applied at the identity provider level — MFA enforcement, risk-based conditional access, and real-time threat detection. Solutions like Okta, Azure AD/Entra ID, and Ping Identity are standard.

### Zero-Trust Architecture

Zero Trust operates on "never trust, always verify." No user or device is trusted by default, even if inside the corporate network. Every access request must be authenticated, authorized, and continuously validated. Key components:
- Identity as the primary security perimeter (not the network)
- Device health checks before granting access
- Just-in-time and just-enough-access permissions
- Micro-segmentation of network resources
- Continuous monitoring and session validation

### Conditional Access Policies

Conditional access evaluates signals at login time — user identity, device compliance, location, network, risk score — and enforces appropriate policies. For example:
- Allow access from corporate devices on the corporate network with password + hardware key
- Block access from unknown devices or high-risk countries
- Require step-up authentication (e.g., TOTP + hardware key) for sensitive admin actions
- Force password change when there is evidence of credential compromise
- Session timeout and re-authentication for prolonged sessions

Modern identity platforms (Azure AD Conditional Access, Okta ThreatInsight, Duo Beyond) make these policies configurable without custom code.

### Additional Enterprise Measures

- Deploy an enterprise password manager (1Password Business, Bitwarden Enterprise, Keeper) for team credential sharing and vault policy enforcement
- Implement automated onboarding and offboarding — revoke access immediately when employees leave
- Provide phishing awareness training with simulated phishing campaigns
- Enroll high-privilege accounts (admins, executives) in advanced protection programs (Google Advanced Protection, Apple Lockdown Mode)
- Adopt FIDO2 security keys for all privileged accounts
- Monitor dark web and breach feeds for leaked corporate credentials
- Implement session recording and audit logging for critical systems

## Creating a Personal Security Routine

Password security is not a one-time task — it is an ongoing practice. Here is a routine to establish and maintain in 2026.

### Step 1: Conduct a Password Audit

Run a password health report using your password manager. Most managers (Bitwarden, 1Password, Dashlane) include this feature. It identifies:
- Weak passwords (too short, too simple)
- Reused passwords (used on multiple sites)
- Old passwords (not changed in years)
- Compromised passwords (found in known breaches)

Prioritize fixing accounts in order of criticality: email (because password resets go there), banking/finance, primary social media, work accounts, and then everything else. Each account gets a unique, randomly generated password (20+ characters) stored in your password manager.

### Step 2: Enable 2FA Everywhere

Go through your accounts and enable two-factor authentication wherever it is supported. Prioritize:
- Email accounts (primary and secondary)
- Password manager vault
- Financial accounts (banking, investment, cryptocurrency)
- Social media (especially if you have a large following)
- Cloud storage (Google Drive, iCloud, Dropbox)
- Developer accounts (GitHub, GitLab, AWS)
- Domain registrars and DNS providers

Use TOTP apps as your primary 2FA method, with hardware keys (FIDO2) for your most critical accounts. Record backup codes and store them securely — ideally in your password manager or a offline safe. Avoid SMS 2FA whenever a better option exists.

### Step 3: Use Our Password Generator

For every new account or password change, generate a strong password. Our password generator creates cryptographically secure random passwords with configurable length (default 24 characters) and character sets. Key features:
- True entropy via Web Crypto API or system CSPRNG
- Customizable character sets (include/exclude similar characters, symbols, ambiguous characters)
- Password strength meter
- Memorable passphrase generation option
- Copy to clipboard with auto-clear timer
- No passwords ever transmitted over the network — everything happens locally

Set your password manager to use 24-character alphanumeric passwords by default. For high-value accounts, use 32+ characters. If a service has a maximum password length (some do, absurdly), use the maximum allowed.

### Step 4: Annual Security Review

Block out 30 minutes every quarter to review your security posture:
- Run password health report again
- Check Have I Been Pwned for new breaches
- Review accounts you no longer use and close them
- Update recovery information (phone number, backup email, security questions)
- Verify that 2FA is still enabled on all critical accounts
- Test your backup and recovery procedures
- Update your password manager and enable new security features
- Review app permissions and OAuth grants — revoke unused ones

## What to Do If You're Breached

Discovering your credentials have been leaked is stressful, but acting quickly and methodically minimizes the damage.

### Immediately

1. Change your password on the breached service. Do not wait — even if you think it is minor, change it now. Use a new, unique, strong password generated by your password manager.
2. If you reused that password anywhere else (and you should not have, but this is the moment of truth), change those passwords immediately too. Prioritize email, banking, and other critical accounts.
3. Check Have I Been Pwned (haveibeenpwned.com) or use your password manager's breach monitoring feature. Enter all your email addresses and phone numbers to see what breaches they appear in.
4. Enable 2FA on the breached account if it was not already enabled. If 2FA was enabled, the breach was likely from the service side (not your account specifically), but take no chances.

### Within 24 Hours

5. Log out of all active sessions on the breached account. Most services have an "log out everywhere" or "revoke all sessions" option. This forces any attacker with an active session to re-authenticate.
6. Check account activity logs. Look for suspicious logins, password changes, profile edits, or messages sent from your account. Document anything unusual — you may need this for a report.
7. Check connected services and OAuth applications. Revoke any that look unfamiliar or suspicious. An attacker may have used your session to grant themselves API access.
8. If financial information (credit card, bank account) was stored on the service, notify your financial institution. Request new cards if needed. Monitor statements for fraudulent transactions.
9. If the breach involved personal information (address, SSN, date of birth), consider placing a credit freeze or fraud alert with the major credit bureaus (Equifax, Experian, TransUnion).

### Ongoing

10. Change your email password as a precaution — even if it was not directly involved in the breach. Email is the linchpin of account recovery.
11. Set up monitoring alerts. Many password managers and credit monitoring services offer free breach alerts. Enable them.
12. Be extra vigilant for phishing attempts in the weeks following a breach. Attackers often follow up a breach with targeted phishing emails, pretending to be the breached service's "security team."
13. If the breach involved sensitive personal data, freeze your credit permanently (you can temporarily unfreeze it when applying for credit — it is free and does not affect your credit score).
14. Consider using identity theft protection services if sensitive data like SSN was compromised. Some breaches offer free credit monitoring — take it, but do not assume it is comprehensive.

### Mistakes to Avoid

- Do not panic. Most breaches leak hashed passwords, not plaintext. Even if passwords are leaked, if you used a strong, unique password, the damage is limited.
- Do not fall for "breach notification" emails that ask you to click a link — verify by going directly to the service's website. Attackers often use breach announcements as phishing opportunities.
- Do not reuse the same new password across services. This is Your Second Chance to get password hygiene right.
- Do not ignore the breach. Even small services can lead to big problems if you reuse passwords or store sensitive data there.

## Conclusion

Password security in 2026 is not about memorizing complex strings of characters — it is about using the right tools and following smart practices. Use a password manager to generate and store unique, long passwords for every account. Enable two-factor authentication everywhere, preferring TOTP apps and hardware keys over SMS. Where available, adopt passkeys for their phishing resistance and convenience. Stay informed about breaches that affect your accounts, and have a plan for when (not if) one of them occurs.

The digital threat landscape will only grow more sophisticated. AI-generated phishing, automated credential stuffing, and advanced SIM swapping will continue to evolve. But the fundamentals of defense remain the same: unique credentials for every service, strong encryption, multi-factor authentication, and vigilance.

The best time to improve your password security was yesterday. The second best time is right now. Start with one account — your email — and work through the steps above. In an hour, you will be dramatically more secure than 99% of users. In a weekend, you will be virtually unhackable through credential-based attacks.

Remember: security is a journey, not a destination. Stay curious, stay cautious, and stay updated.
    `,
  },

  {
    title: "The Ultimate Guide to UUIDs",
    excerpt: "Everything developers need to know about UUIDs, including v4 vs v7, use cases, and best practices.",
    date: "June 10, 2026",
    readTime: "7 min",
    slug: "guide-to-uuids",
    content: `
## What Is a UUID?

A Universally Unique Identifier (UUID) is a 128-bit label used to uniquely identify information in computer systems. The standard format, defined by RFC 4122 and recently updated by RFC 9562, displays as 32 hexadecimal digits split into five groups separated by hyphens: 8-4-4-4-12. A typical UUID looks like this: \`f47ac10b-58cc-4372-a567-0e02b2c3d479\`. With 128 bits of entropy, the total number of possible UUIDs is roughly 5.3 x 10^36 — a number so vast that if you generated one billion UUIDs every second for a century, you'd still only have used a tiny fraction of the available space. This astronomical namespace is what makes UUIDs the go-to choice for systems where unique identifiers must be generated independently across distributed nodes without central coordination.

## UUID Versions at a Glance

Not all UUIDs are created equal. The specification defines multiple versions, each designed for different use cases and tradeoffs:

- **UUID v1 (Time-Based + MAC):** Generated from the current timestamp (100-nanosecond intervals since October 15, 1582) combined with the host machine's MAC address. It's deterministic and traceable, which makes it useful for debugging but a privacy concern since the MAC address can identify the generating machine.
- **UUID v3 (MD5 Hash):** Derives the UUID by hashing a namespace identifier and a name using MD5. Two identical inputs always produce the same UUID, making v3 suitable for generating deterministic IDs from known strings.
- **UUID v4 (Random):** The most widely used version. Almost all 128 bits are randomly generated (122 random bits + 6 fixed variant/version bits). It has no inherent ordering and offers maximum unpredictability.
- **UUID v5 (SHA-1 Hash):** Same concept as v3 but uses the stronger SHA-1 hash algorithm. Prefer v5 over v3 for new deterministic UUID schemes.
- **UUID v7 (Time-Ordered Random):** The newest standard. Encodes a Unix timestamp in milliseconds as the leading bits, followed by random bits. This gives v7 the uniqueness of random UUIDs but with a monotonic time-sorted prefix.

## UUID v4 Deep Dive

UUID v4 is the workhorse of modern application development. Its structure breaks down as: 6 fixed bits for the version (0100) and variant (10), leaving 122 bits of pure randomness. This produces 2^122 — approximately 5.3 x 10^36 — distinct values. The collision probability is the classic birthday problem: with 2^122 random UUIDs, you'd need to generate about 2^61 (roughly 2.3 quintillion) before reaching a 50% chance of collision. To put that in perspective, if you generated 1 billion UUIDs per second, it would take about 73,000 years to hit that threshold. For any practical system, the chance of a UUID v4 collision is essentially zero. You can safely generate UUIDs on any node, at any time, and treat them as globally unique without checking against a central registry.

## UUID v7: The Modern Choice

UUID v7 addresses the one significant weakness of v4: database index performance. A v7 UUID encodes a 48-bit Unix timestamp (milliseconds since epoch) as the most significant bits, followed by 74 random bits (with the usual 6 fixed variant/version bits). The result is monotonically increasing over time (within the same millisecond, ordering is random). This time-prefixed structure is a game-changer for B-tree indexes — the default index structure in nearly every relational database. B-trees perform optimally when new insertions have keys that are strictly increasing or nearly so. Random v4 UUIDs cause index page splits, cache churn, and fragmentation because each new insertion lands at a random position in the tree. With v7, new rows always append near the end of the index, dramatically reducing page splits and improving write throughput. For any new system using UUIDs as primary keys in a database, v7 is almost always the right choice.

## When to Use UUIDs

UUIDs shine in distributed and decentralized architectures. Use them when:

- **Distributed Systems:** Multiple services, microservices, or edge nodes generate identifiers independently without a central ID server. UUIDs eliminate coordination overhead and single points of failure.
- **Public API Identifiers:** Exposing sequential integer IDs in URLs is a common security anti-pattern — it lets anyone enumerate your resources. UUIDs are opaque and unguessable, preventing information leakage.
- **Offline-First Applications:** Mobile and desktop apps that generate data while offline need to synchronize later. UUIDs guarantee no conflicts when merging data, since each client generates IDs that are globally unique.
- **Event Sourcing and CQRS:** Event streams require immutable, globally unique event IDs. UUIDs, particularly v7 with their time component, provide both uniqueness and chronological ordering of events.

## When NOT to Use UUIDs

UUIDs are not a universal hammer. Avoid them when:

- **Short URLs:** Services like YouTube, Bitly, or Twitter use compact encoded identifiers (often 7-11 characters) because they're shared in constrained contexts. A 36-character UUID is far too long.
- **Sequential Display IDs:** Invoices numbered \`INV-0001\` through \`INV-9999\` communicate order and scale to customers. A UUID like \`550e8400-e29b-41d4-a716-446655440000\` is user-hostile for human-facing sequences.
- **Human-Readable Identifiers:** If humans need to read, type, or communicate identifiers verbally (order numbers, ticket IDs, booking references), use shorter, character-set-constrained formats like \`ABC-XYZ-123\` rather than raw UUIDs.

## Database Performance: UUID v4 vs. BIGSERIAL vs. UUID v7

The choice of primary key type has profound performance implications in relational databases:

**BIGSERIAL:** A monotonically increasing 64-bit integer. Ideal for B-tree performance — new rows always insert at the rightmost leaf. It is the fastest option for write-heavy workloads. The tradeoff: it requires a central sequence generator, it's predictable, and it leaks information about data volume and growth rate.

**UUID v4 (Random):** Each insertion lands at a random position in the B-tree. This causes frequent page splits (a page fills up and the database must split it into two, rebalancing the tree), wasted space (pages end up partially filled — as low as 50-60% fill factor), and increased cache pressure (random access pattern evicts hot pages). Write throughput can degrade by 30-50% compared to sequential keys.

**UUID v7 (Time-Ordered):** Combines the distributed uniqueness of UUIDs with near-sequential insertion behavior. The timestamp prefix ensures new keys are monotonically increasing most of the time. Page splits are rare, fill factor stays high, and cache efficiency approaches that of BIGSERIAL. Benchmarks consistently show v7 performing within 5-10% of sequential integers while offering global uniqueness without coordination.

If your workload is read-dominated and cache-friendly, the performance difference between v4 and v7 may not matter. If you're writing millions of rows, the difference is dramatic.

## UUID Alternatives

The identifier landscape has expanded well beyond the original UUID standard:

- **ULID (Universally Unique Lexicographically Sortable Identifier):** A 128-bit identifier with a 48-bit Unix timestamp (second precision) and 80 bits of randomness, encoded as a 26-character Crockford Base32 string. ULIDs are case-insensitive, URL-safe, and lexicographically sortable. Unlike UUID v7, ULID is not an official standard, but it predates and inspired v7.
- **Snowflake ID (Twitter/X):** A 64-bit integer composed of a timestamp, datacenter ID, worker ID, and sequence number. Extremely compact and sortable, but it requires a centralized service or configuration to assign unique worker IDs. At 64 bits, the collision space is much smaller — designed for a single organization's internal use.
- **NanoID:** A URL-safe, configurable-length ID generator. Default NanoID (21 characters) offers ~126 bits of entropy from a 64-character alphabet. Its main advantage is compactness — you can trade collision probability for length (e.g., 8-character IDs for short-lived identifiers). NanoID is a library, not a standard, and has no built-in time-ordered component.
- **KSUID (K-Sortable Unique Identifier):** A 128-bit ID with a 32-bit timestamp (second precision) and 96 bits of random payload, encoded in Base62 (27 characters). KSUIDs are sortable by time within the same second and offer a larger random space than ULID.

Each trades off between compactness, sortability, decentralized generation, and collision resistance. Choose based on your specific constraints: Snowflake for ultra-compact internal IDs at scale, ULID/KSUID for sortable human-readable IDs, NanoID for short tokens, and UUID v7 for standards-compliant interoperable identifiers.

## Implementation Guide

Generating UUIDs in practice is straightforward across modern platforms:

- **Our UUID Generator Tool:** The companion tool at \`/uuid\` provides instant generation of all UUID versions with bulk export and format options.
- **Browser (JavaScript):** \`crypto.randomUUID()\` is now supported in all modern browsers and generates UUID v4 natively. For v7 support, use the \`uuid\` package or the new \`crypto.randomUUID({ version: 7 })\` API available in recent Chromium builds.
- **Node.js:** The \`uuid\` package (npm install uuid) provides \`uuid.v4()\` and \`uuid.v7()\` out of the box. Use \`uuid.v7()\` for new projects. It's well-tested, maintained, and handles edge cases like clock regression.
- **Python:** The standard library \`uuid\` module offers \`uuid.uuid4()\` and \`uuid.uuid7()\` (Python 3.14+). For earlier versions, the \`uuid7\` package provides v7 generation.
- **Java:** \`java.util.UUID.randomUUID()\` gives v4. For v7, use the \`uuid-creator\` library or the new \`java.util.UUID.randomUUID(7)\` in JDK 21+.
- **Go:** The \`github.com/google/uuid\` package supports both v4 (\`uuid.New()\`) and v7 (\`uuid.Must(uuid.NewV7())\`).
- **Rust:** The \`uuid\` crate with the \`v7\` feature provides \`Uuid::now_v7()\`.

## Best Practices

Follow these guidelines to get the most out of UUIDs in production:

- **Store as BINARY(16) in MySQL:** Never store UUIDs as CHAR(36) — 16 bytes vs 36 bytes is a 2.25x storage saving, plus binary comparison is faster than string comparison. Use \`UUID_TO_BIN()\` and \`BIN_TO_UUID()\` functions. In MySQL 8.0+, consider \`UUID v7\` with \`BINARY(16)\` for optimal index performance.
- **Use the UUID Type in PostgreSQL:** PostgreSQL has a native \`uuid\` data type that stores the 128-bit value efficiently. For v7, store the timestamp and random parts separately or use an extension. PostgreSQL's B-tree handling of UUIDs benefits significantly from v7 ordering.
- **Index UUID Columns Judiciously:** If you query by UUID frequently, index it — but prefer clustered indexes on a sequential surrogate key with a UUID as a secondary indexed column for write-heavy tables. Some databases (SQL Server, MySQL with InnoDB) cluster the table by the primary key; a random clustered key causes severe fragmentation.
- **Never Truncate UUIDs:** It is tempting to take the first 8 or 16 characters of a UUID for a "short ID." This is dangerous. Truncating a UUID drastically reduces entropy and geometrically increases collision probability. Eight hex characters is only 32 bits — you'll likely see collisions after just 77,000 generated IDs (birthday problem). If you need short IDs, use a purpose-built scheme like NanoID or base-62 encoding of a larger random value.
- **Make UUID v7 the Default:** For all new projects that need distributed unique identifiers, start with UUID v7. It provides the interoperability and standardization of UUIDs with the database performance characteristics of sequential keys. The only reason to choose v4 over v7 is if you absolutely must avoid encoding any timestamp information — a valid privacy or security concern in some contexts.
    `,
  }
];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteConfig.url}/blog/${slug}` },
  };
}

function renderContent(text: string) {
  return text.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return <h2 key={i} className="mt-8 text-xl font-bold text-surface-900 dark:text-dark-text">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").map((line) => line.replace(/^- /, ""));
      return (
        <ul key={i} className="mt-2 space-y-1 list-disc pl-5 text-surface-600 dark:text-dark-muted">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      );
    }
    return <p key={i} className="mt-4 text-surface-600 dark:text-dark-muted leading-relaxed">{trimmed}</p>;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-surface-900 dark:hover:text-dark-text">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{post.title}</span>
          </nav>
        </div>
      </section>
      <article className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 text-sm text-surface-400 dark:text-dark-muted">
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime} read</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-surface-500 dark:text-dark-muted">
            {post.excerpt}
          </p>
          <div className="mt-8 prose prose-surface dark:prose-invert max-w-none">
            {renderContent(post.content)}
          </div>
        </div>
      </article>
    </>
  );
}
