export interface Comparison {
  slug: string;
  title: string;
  description: string;
  category: string;
  tools: string[];
  intro: string;
  sections: { title: string; body: string }[];
  faq: { question: string; answer: string }[];
  published: string;
  modified: string;
}

export const comparisons: Comparison[] = [
  {
    slug: "base64-vs-url-encoding",
    title: "Base64 vs URL Encoding: Key Differences Explained",
    description: "Base64 vs URL encoding compared: how they work, when to use each, and why you should not use the wrong one. Includes practical examples for developers.",
    category: "Encodings",
    tools: ["base64", "url-encoder"],
    intro:
      "Base64 encoding and URL (percent) encoding are two of the most common text transformations in web development, yet developers frequently confuse them. Both turn raw data into safe ASCII text, but they solve different problems. Base64 converts binary data into a compact alphanumeric representation, while URL encoding escapes individual characters so a string can travel safely inside a URL. Choosing the wrong one produces broken links, corrupt payloads, or data that simply does not round-trip.",
    sections: [
      {
        title: "What Is Base64 Encoding?",
        body: "Base64 is an encoding scheme defined in RFC 4648 that represents binary data using 64 printable ASCII characters (A-Z, a-z, 0-9, +, /) plus padding with = signs. It works by reading the input as a stream of bytes and re-grouping them into 6-bit chunks, each of which maps to one Base64 character. Because 3 bytes become 4 characters, Base64 always inflates data by roughly 33%. It is widely used to embed images in HTML or CSS, transmit binary payloads in JSON APIs, and carry the payload sections of JWT tokens.",
      },
      {
        title: "What Is URL Encoding?",
        body: "URL encoding, also called percent-encoding (RFC 3986), replaces unsafe or reserved characters in a URL with a percent sign followed by two hex digits. For example, a space becomes %20 and the ampersand becomes %26. URL encoding is not about compactness — it exists so that characters with special meaning in a URL (?, #, &, =, /) or characters outside the ASCII set can be transmitted unambiguously inside query strings and paths.",
      },
      {
        title: "Key Differences Between Base64 and URL Encoding",
        body: "The core differences are purpose, output set, and reversibility rules. Base64 encodes arbitrary binary into a fixed 64-character alphabet and is designed for data carriage, while URL encoding escapes text into %XX triplets and is designed for safe inclusion in URIs. Base64 output itself is not URL-safe because it can contain +, /, and =, which have meaning inside URLs. The standard workaround is Base64URL — the same scheme with + and / replaced by - and _, and padding stripped. URL encoding is applied to individual characters, so it does not change the length of meaningful text by a fixed ratio the way Base64 does.",
      },
      {
        title: "When to Use Which",
        body: "Use Base64 when you need to embed binary data — images, fonts, files, hashes, or token payloads — inside a text-based format such as JSON, HTML, or CSS. Use URL encoding when you are building or parsing URLs, query parameters, or form data. If you need to put Base64 data inside a URL, switch to the URL-safe Base64 variant (Base64URL) rather than guessing. A quick way to experiment with both is to run a string through a Base64 encoder and then a URL encoder to see exactly how the outputs differ.",
      },
    ],
    faq: [
      {
        question: "Is Base64 the same as URL encoding?",
        answer:
          "No. Base64 converts binary data into a 64-character alphanumeric alphabet, while URL (percent) encoding escapes individual characters as %XX triplets so they are safe inside URLs. They serve different purposes and produce different output.",
      },
      {
        question: "Can I put Base64 output directly in a URL?",
        answer:
          "Standard Base64 contains +, /, and = which have special meaning in URLs, so it can break. Use the URL-safe Base64URL variant (- and _ instead of + and /, no padding) when embedding Base64 data in URLs or JWTs.",
      },
      {
        question: "Does Base64 or URL encoding compress data?",
        answer:
          "Neither compresses. Base64 increases size by about 33% to represent binary as text, and URL encoding grows a string by one to two characters per escaped character.",
      },
      {
        question: "How do I encode Base64 in my browser?",
        answer:
          "Use the btoa() function for ASCII input or a dedicated client-side tool. Our free Base64 encoder and decoder runs entirely in your browser, so your data never leaves your device.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "json-vs-yaml-vs-xml-vs-toml",
    title: "JSON vs YAML vs XML vs TOML: Which Data Format Should You Use?",
    description: "Compare JSON, YAML, XML, and TOML for config files, APIs, and data exchange. See syntax differences, pros and cons, and when each format is the right choice.",
    category: "Data Formats",
    tools: ["json-formatter", "yaml-formatter", "xml-formatter", "toml-converter", "json-to-yaml", "json-to-xml"],
    intro:
      "JSON, YAML, XML, and TOML are the four dominant text-based data formats in modern software. Each is a serialization format, but they were designed for different jobs: JSON for APIs and web data, YAML for human-readable configuration, XML for documents and interoperable standards, and TOML for simple, unambiguous configuration files. Choosing the right format affects readability, tooling, parsing speed, and how easily mistakes are caught.",
    sections: [
      {
        title: "JSON: The API Standard",
        body: "JavaScript Object Notation (JSON) is a lightweight, language-agnostic format derived from JavaScript object literals. It supports objects, arrays, strings, numbers, booleans, and null, and every major language parses it natively. JSON is the de facto standard for REST and GraphQL APIs, NoSQL databases, and browser storage because it is compact, unambiguous, and fast to parse. Its weakness is authoring by hand: JSON forbids comments and trailing commas, and even a small syntax slip breaks the whole document.",
      },
      {
        title: "YAML: Readable by Humans",
        body: "YAML (YAML Ain't Markup Language) uses indentation instead of braces to represent nested data, which makes it far more readable than JSON for configuration files. It supports comments, anchors and aliases for reuse, and a rich type system. It powers Kubernetes manifests, GitHub Actions, Docker Compose, and Ansible playbooks. The trade-off is that whitespace-sensitive indentation and implicit typing can hide subtle bugs, and YAML parsing is slower than JSON.",
      },
      {
        title: "XML: Documents and Interoperability",
        body: "Extensible Markup Language (XML) is a markup format that stores data inside named tags with attributes, and it is the backbone of SOAP, RSS/Atom feeds, SVG, and countless enterprise standards such as XBRL and HL7. XML supports namespaces, schemas (XSD), and transformation (XSLT), which makes it extremely precise and extensible. The downsides are verbosity and parsing overhead — representing the same data in XML typically takes two to four times more bytes than JSON.",
      },
      {
        title: "TOML: Unambiguous Configuration",
        body: "Tom's Obvious Minimal Language (TOML) is a configuration-file format built around key-value pairs with table sections. It is designed to be both easy for humans to write and easy for machines to parse unambiguously, with explicit types that eliminate the implicit-typing surprises of YAML. Cargo.toml, pyproject.toml, and many Go and Rust projects use TOML. It is less flexible than JSON or YAML for deeply nested or highly dynamic data, but for configuration it is an excellent, predictable choice.",
      },
      {
        title: "How to Choose",
        body: "Pick JSON for API payloads, data exchange, and programmatic data. Pick YAML for configuration files that humans will read and edit, especially in cloud-native tooling. Pick XML when you need document structure, namespaces, schemas, or standards compliance. Pick TOML for simple, typed configuration where you want zero ambiguity. In practice many projects use more than one: a JSON API talking to a service configured with YAML that itself reads a TOML file.",
      },
    ],
    faq: [
      {
        question: "Is YAML better than JSON?",
        answer:
          "YAML is more human-readable and supports comments, but JSON is more compact, faster to parse, and unambiguous. Use YAML for configuration you will hand-edit and JSON for data interchange.",
      },
      {
        question: "Can JSON be converted to YAML or XML?",
        answer:
          "Yes. Any JSON document can be represented as YAML (which is a superset of JSON syntax) and as XML, though the XML structure is a matter of convention. Use our JSON to YAML and JSON to XML converters to transform data instantly in your browser.",
      },
      {
        question: "Why is XML still used?",
        answer:
          "XML remains dominant where interoperability and extensibility matter: SOAP web services, RSS/Atom feeds, SVG, office document formats, and regulated industries that rely on XSD schemas and XSLT.",
      },
      {
        question: "What is the difference between YAML and TOML?",
        answer:
          "Both are configuration formats, but YAML relies on indentation and implicit typing (more flexible, occasionally surprising), while TOML uses explicit brackets and types (simpler, less ambiguous). TOML cannot express everything YAML can, but it is easier to reason about.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "md5-vs-sha-256-vs-sha-512",
    title: "MD5 vs SHA-256 vs SHA-512: Hash Function Comparison",
    description: "MD5, SHA-256, and SHA-512 compared: digest sizes, collision resistance, security status, and performance. Learn which hash function is safe for your use case.",
    category: "Security",
    tools: ["hash-generator", "file-checksum", "hmac-generator"],
    intro:
      "MD5, SHA-256, and SHA-512 are cryptographic hash functions that take arbitrary input and produce a fixed-size digest. They look interchangeable, but they differ dramatically in digest length, collision resistance, and security status. Choosing MD5 today can expose your application to collision attacks, while SHA-256 and SHA-512 remain the industry defaults for integrity checking, password hashing, and digital signatures.",
    sections: [
      {
        title: "How Hash Functions Work",
        body: "A cryptographic hash function maps data of any length to a fixed-size output, called a digest. The same input always produces the same digest, changing a single bit of input changes the digest unpredictably, and the function is one-way — you cannot reconstruct the input from the digest. Because of these properties, hashes are used for file integrity checks, fingerprinting data, verifying signatures, and building data structures like Merkle trees.",
      },
      {
        title: "MD5: Legacy and Broken",
        body: "MD5 (Message-Digest algorithm 5) produces a 128-bit digest and was extremely popular for checksums and password storage in the 1990s and 2000s. Researchers demonstrated practical collision attacks in 2004 and 2008, meaning two different inputs can be crafted to produce the same MD5 hash. MD5 is also trivially fast, which makes it unsuitable for password hashing. Today MD5 should only be used for non-security checksums, such as verifying that a downloaded file was not corrupted in transit (not that it is authentic).",
      },
      {
        title: "SHA-256: The Modern Default",
        body: "SHA-256 (Secure Hash Algorithm 2) produces a 256-bit digest and is part of the SHA-2 family standardized by NIST. It is the default hash for TLS certificates, blockchain, Git commit IDs, and countless security protocols. Its 256-bit output gives strong collision resistance, and it is widely hardware-accelerated. For nearly every integrity and fingerprinting need, SHA-256 is the safe, performant default.",
      },
      {
        title: "SHA-512: More Headroom",
        body: "SHA-512 produces a 512-bit digest from the same SHA-2 family. It offers even more collision resistance than SHA-256 and is faster than SHA-256 on 64-bit hardware because it processes data in larger 64-bit words. SHA-384 is a truncated variant used in some compliance contexts. The practical benefit over SHA-256 is marginal for most applications, but SHA-512 is a solid choice when maximum security margin or 64-bit speed matters.",
      },
      {
        title: "Choosing the Right Hash",
        body: "For file integrity and data fingerprinting, use SHA-256 — it is the safest, most widely supported default. Choose SHA-512 when you want extra security margin or are optimizing for 64-bit CPUs. Never use MD5 (or SHA-1) for security-sensitive purposes such as password storage, signatures, or authenticity checks. For password hashing specifically, use a deliberately slow, salted algorithm such as bcrypt or Argon2 instead of any of these fast hashes.",
      },
    ],
    faq: [
      {
        question: "Is MD5 safe to use?",
        answer:
          "No for security. MD5 has known practical collision attacks and is too fast for password hashing. It is acceptable only for non-security checksums where accidental corruption — not malicious tampering — is the concern.",
      },
      {
        question: "What is the difference between SHA-256 and SHA-512?",
        answer:
          "SHA-256 produces a 256-bit digest; SHA-512 produces a 512-bit digest. SHA-512 offers a larger security margin and can be faster on 64-bit CPUs, while SHA-256 is more widely supported and the standard default.",
      },
      {
        question: "Can MD5 and SHA hashes be reversed?",
        answer:
          "No. Hash functions are one-way, so you cannot reverse a digest to recover the input. Weak passwords hashed with fast algorithms can still be recovered by brute force or dictionary attacks, which is why salted, slow functions are required for passwords.",
      },
      {
        question: "How do I generate MD5, SHA-256, or SHA-512 hashes online?",
        answer:
          "Use our free hash generator, which computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 from text or files entirely in your browser using the Web Crypto API — nothing is uploaded.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "uuid-v4-vs-v7-vs-v5",
    title: "UUID v4 vs v7 vs v5: Which UUID Version Should You Use?",
    description: "UUID v4, v7, and v5 compared for database primary keys, APIs, and identifiers. Learn the trade-offs between random, time-ordered, and name-based UUIDs.",
    category: "Identifiers",
    tools: ["uuid-generator", "ulid-generator"],
    intro:
      "Universally Unique Identifiers (UUIDs) come in many versions, and choosing between v4, v5, and v7 has real consequences for database performance and application correctness. UUID v4 is the most famous — fully random. UUID v7 is time-ordered and increasingly the recommended choice for database primary keys. UUID v5 is deterministic and derived from a namespace and name. Understanding the differences helps you pick the right identifier for the job.",
    sections: [
      {
        title: "UUID v4: The Random Classic",
        body: "UUID v4 generates identifiers from random bytes (122 bits of randomness plus version and variant bits). Because it is random, v4 UUIDs are globally unique with an astronomically low collision probability and reveal nothing about when or where they were created. This makes v4 the right choice for public identifiers, correlation IDs, and any ID that must not leak information. The downside is that random values are poorly ordered, so inserting them into a clustered index (like a primary key in PostgreSQL or MySQL InnoDB) causes page splits and index fragmentation under heavy writes.",
      },
      {
        title: "UUID v7: Time-Ordered for Databases",
        body: "UUID v7 embeds a Unix timestamp (millisecond precision) in the high bits and fills the rest with random data. Because the leading bits increase with time, v7 UUIDs are roughly sortable by creation time and insert sequentially into B-tree indexes, dramatically reducing fragmentation compared to v4. UUID v7 became an IETF standard in RFC 9562 and is now the recommended default for new database primary keys, event IDs, and log IDs. It is also lexicographically sortable, which makes it useful for pagination and time-based queries.",
      },
      {
        title: "UUID v5: Deterministic Name-Based",
        body: "UUID v5 derives a UUID by hashing a namespace UUID plus a name using SHA-1 (RFC 4122). The same namespace and name always produce the same UUID, so v5 is ideal when you need a stable identifier derived from existing data — for example, mapping a customer's email or a file path to a fixed UUID without storing a mapping table. It is also useful for generating identifiers in distributed systems that must be reproducible. The trade-off is determinism: given the namespace and name, anyone can recompute the UUID, so do not use it to hide or protect data.",
      },
      {
        title: "Which Version Should You Choose?",
        body: "For new database primary keys, event streams, and anything that benefits from sort order, use UUID v7. For public-facing identifiers where you want no time leakage and maximum randomness, use UUID v4. For reproducible identifiers derived from a name, use UUID v5. Avoid UUID v1 (which leaks MAC addresses and timestamps) and UUID v3 (legacy MD5-based) in new designs.",
      },
    ],
    faq: [
      {
        question: "What is the difference between UUID v4 and v7?",
        answer:
          "UUID v4 is entirely random, while UUID v7 is time-ordered — it embeds a millisecond timestamp in its leading bits. v7 is the recommended default for database primary keys because it reduces index fragmentation and sorts chronologically.",
      },
      {
        question: "Are UUID v4 collisions possible?",
        answer:
          "Theoretically yes, but practically negligible — roughly a 50% chance of one collision only after generating about 2.7 quintillion UUIDs. For almost all applications you can assume uniqueness.",
      },
      {
        question: "When should I use UUID v5?",
        answer:
          "Use UUID v5 when you need a deterministic identifier derived from a name — the same input always yields the same UUID. Common uses include mapping emails, paths, or domain names to stable IDs without extra storage.",
      },
      {
        question: "Can I generate UUID v4, v5, and v7 online?",
        answer:
          "Yes. Our free UUID generator supports v3, v4, v5, and v7 with bulk generation and one-click copy, running entirely in your browser with cryptographically secure randomness.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "bcrypt-vs-argon2-vs-pbkdf2",
    title: "bcrypt vs Argon2 vs PBKDF2: Password Hashing Compared",
    description: "bcrypt, Argon2, and PBKDF2 compared for secure password storage. Learn about memory-hardness, GPU resistance, and which password hashing algorithm to use.",
    category: "Security",
    tools: ["bcrypt-generator", "hash-generator", "password-strength"],
    intro:
      "Storing passwords as plaintext or fast hashes is a recipe for disaster. bcrypt, Argon2, and PBKDF2 are deliberately slow, salted key-derivation functions built to make offline password cracking expensive. They differ in how they resist GPUs and custom hardware, and that difference matters. Choosing the right one — and the right parameters — is one of the most important security decisions in any application that handles user credentials.",
    sections: [
      {
        title: "Why Fast Hashes Are Wrong for Passwords",
        body: "SHA-256 and MD5 are designed to be fast, which is exactly why they are terrible for password storage. An attacker who steals a password database can try billions of guesses per second against fast hashes using GPUs. Password-hashing functions solve this by being intentionally slow and resource-hungry, multiplying the cost of each guess so that brute-forcing becomes impractical. They also use a per-user salt so that identical passwords produce different hashes and precomputed rainbow tables are useless.",
      },
      {
        title: "bcrypt: The Battle-Tested Standard",
        body: "bcrypt (1999) is based on the Blowfish cipher and is the most widely deployed password-hashing function. It is salted by design, produces a 60-character string that includes the salt and cost factor, and its work factor (rounds) can be increased over time to keep pace with faster hardware. bcrypt resists GPUs well because its memory access pattern and design are not a perfect fit for massively parallel hardware. Its practical weakness is a 72-byte input limit on the password and fixed memory usage, which leaves it behind modern memory-hard functions.",
      },
      {
        title: "Argon2: The Modern Winner",
        body: "Argon2 won the Password Hashing Competition in 2015 and is the current gold standard. It is memory-hard — it requires a configurable amount of RAM, which makes GPU and ASIC attacks far more expensive — and offers three variants: Argon2d (data-dependent, maximally resistant to GPU cracking), Argon2i (data-independent, resistant to side-channel attacks), and Argon2id (a hybrid, recommended for most uses). Because its memory, iterations, and parallelism are all tunable, Argon2id is the algorithm most security experts recommend for new systems today.",
      },
      {
        title: "PBKDF2: The Conservative Option",
        body: "PBKDF2 (Password-Based Key Derivation Function 2, RFC 2898) is one of the oldest and most portable KDFs, used in WPA2, iOS, and many frameworks. It works by applying a PRF (typically HMAC-SHA256) thousands of times. PBKDF2 is easy to implement correctly and widely supported, but it is not memory-hard — it can be attacked efficiently with GPUs and custom hardware. If you must use PBKDF2, choose a very high iteration count and rely on the framework's battle-tested implementation.",
      },
      {
        title: "Making the Choice",
        body: "If you control the runtime, use Argon2id with parameters tuned to roughly 100-500 MB of memory and a few seconds of compute. If you are constrained to library defaults, bcrypt with a cost factor of 12 or higher is a safe, well-understood choice. PBKDF2 is acceptable only when interoperability or platform support forces it. In every case, hash on the server, use a fresh random salt per user, and pair the hash with rate limiting and multi-factor authentication.",
      },
    ],
    faq: [
      {
        question: "Is Argon2 better than bcrypt?",
        answer:
          "For new systems, yes. Argon2id is memory-hard, which makes GPU-based cracking dramatically more expensive, and its memory, time, and parallelism parameters are tunable. bcrypt remains a safe choice when you cannot use Argon2.",
      },
      {
        question: "Why is bcrypt not memory-hard?",
        answer:
          "bcrypt uses a fixed, relatively small amount of memory and its computational pattern is not optimized for massive parallelism, so GPUs cannot crack it as efficiently as they crack fast hashes — but it still lacks the configurable memory-hardness of Argon2.",
      },
      {
        question: "Should I use a hash generator to create password hashes?",
        answer:
          "A general hash generator computes fast hashes (MD5, SHA) for integrity checks — never use those for passwords. For secure password hashes, use a dedicated bcrypt tool or a proper password-hashing library in your backend.",
      },
      {
        question: "How can I test the strength of passwords?",
        answer:
          "Use our password strength analyzer to evaluate length, character variety, and entropy. Strong password policies combined with Argon2id or bcrypt hashing provide defense in depth.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "jwt-hs256-vs-rs256",
    title: "JWT Signing: HS256 vs RS256 Explained",
    description: "HS256 vs RS256 JWT signing algorithms compared. Learn how HMAC and RSA signing work, key management differences, and when to use each algorithm.",
    category: "Security",
    tools: ["jwt-generator", "jwt-decoder", "rsa-key-generator", "hmac-generator"],
    intro:
      "Every JSON Web Token (JWT) is signed with a cryptographic algorithm, and the two most common choices are HS256 and RS256. HS256 uses a single shared secret with HMAC-SHA256, while RS256 uses asymmetric RSA keys with a private key for signing and a public key for verification. The choice affects key distribution, token security, and how easily your API can scale. Understanding HS256 vs RS256 is essential for anyone implementing authentication.",
    sections: [
      {
        title: "HS256: Symmetric Signing with a Shared Secret",
        body: "HS256 signs a JWT using HMAC-SHA256, where the same secret key both signs and verifies the token. The algorithm is simple and fast, and it is the default in many quick-start tutorials because it requires no key generation or certificate setup. The critical requirement is that the secret must be kept private everywhere — client and server. If the secret leaks, anyone can forge tokens. Because both sides hold the same key, HS256 works best when the verifying party is a single service you fully control.",
      },
      {
        title: "RS256: Asymmetric Signing with Key Pairs",
        body: "RS256 signs a JWT using RSA-SHA256 with a private key, and any party with the corresponding public key can verify the signature without being able to create new tokens. The issuer holds the private key; API gateways, microservices, and third parties hold only the public key. This makes RS256 the standard for identity providers (like Auth0, Keycloak, and Google) because many consumers can verify tokens independently and safely. RSA verification is slower than HMAC, but the security and key-distribution benefits usually outweigh the cost.",
      },
      {
        title: "Key Differences: Security and Key Management",
        body: "The core difference is who can sign. With HS256, anyone who knows the secret can both sign and verify, so the secret must be shared with every verifier — a scaling and security risk if many services verify tokens. With RS256, only the private key holder can sign, and anyone with the public key can verify without increasing the attack surface. This makes RS256 the recommended choice for distributed systems and any situation where tokens are verified by more than one party.",
      },
      {
        title: "Which Algorithm Should You Use?",
        body: "Use RS256 whenever tokens may be verified by multiple services, third parties, or public clients, and whenever you want to guarantee that only your server can mint tokens. Use HS256 only for a single-service backend where the secret can be tightly controlled, and treat the secret with the same rigor as a database credential. Always validate the algorithm in your JWT library to prevent algorithm-confusion attacks, and use our JWT decoder to inspect the header, payload, and signature of any token.",
      },
    ],
    faq: [
      {
        question: "What is the difference between HS256 and RS256?",
        answer:
          "HS256 is symmetric — the same secret signs and verifies. RS256 is asymmetric — a private key signs and a public key verifies. RS256 is safer for distributed systems because only the issuer can create tokens.",
      },
      {
        question: "Is HS256 secure?",
        answer:
          "HS256 is secure if the shared secret is strong and kept secret on both ends. It becomes risky when multiple services must verify tokens, because every verifier must hold the signing secret.",
      },
      {
        question: "Why do identity providers use RS256?",
        answer:
          "Identity providers like Auth0 and Google use RS256 so that any client or API can verify tokens with just the public key (available from the JWKS endpoint) without ever holding the private signing key.",
      },
      {
        question: "How can I decode and inspect a JWT?",
        answer:
          "Use our free JWT decoder to view the header, payload, and signature of any token instantly in your browser, and our JWT generator to create test tokens with the algorithm you choose.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "aes-vs-rsa",
    title: "AES vs RSA Encryption: What's the Difference?",
    description: "AES vs RSA encryption compared: symmetric vs asymmetric cryptography, key sizes, speed, and use cases. Learn when to use AES and when to use RSA.",
    category: "Security",
    tools: ["encrypt-decrypt", "rsa-key-generator"],
    intro:
      "AES and RSA are the two encryption workhorses of the internet, but they belong to different families of cryptography. AES is a symmetric algorithm — the same key encrypts and decrypts. RSA is asymmetric — a public key encrypts and a private key decrypts. They are not competitors so much as complementary tools: TLS, SSH, and PGP all use RSA (or another asymmetric scheme) to securely exchange a session key, then switch to AES to encrypt the actual data.",
    sections: [
      {
        title: "Symmetric Encryption: AES",
        body: "The Advanced Encryption Standard (AES) is a symmetric block cipher standardized by NIST in 2001. It supports 128-, 192-, and 256-bit keys and operates on fixed 128-bit blocks. Because encryption and decryption use the same key, AES is extremely fast — modern CPUs have dedicated hardware instructions (AES-NI) that make it nearly free. AES is used to encrypt disk drives, database fields, files, VPN traffic, and the bulk of TLS session data. Its one challenge is key distribution: the sender and receiver must securely share the same secret key.",
      },
      {
        title: "Asymmetric Encryption: RSA",
        body: "RSA is an asymmetric algorithm invented in 1977 that uses a key pair: a public key that anyone can use to encrypt, and a private key that only the owner holds for decryption. Security comes from the difficulty of factoring large numbers; practical RSA keys are 2048 to 4096 bits. RSA makes key distribution trivial — you publish the public key and keep the private key secret — but it is slow, and it can only encrypt small amounts of data (no more than the key size minus padding overhead).",
      },
      {
        title: "Symmetric vs Asymmetric: The Core Trade-Offs",
        body: "The fundamental trade-off is speed versus key distribution. AES is fast, hardware-accelerated, and scales to any data size, but both parties must share a key in advance. RSA solves key sharing elegantly but is slow and limited in payload size. RSA also provides authenticity through signatures (private key signs, public key verifies), which AES alone cannot do. This is why real systems combine them — a scheme called hybrid encryption.",
      },
      {
        title: "How They Work Together",
        body: "In practice AES and RSA are used together. When a client connects to a server over TLS, the two parties use RSA (or ECDHE) to negotiate and exchange a shared secret, then derive an AES session key and encrypt all further traffic with AES. PGP and email encryption follow the same pattern: a random AES key encrypts the message, and RSA encrypts that AES key so it can travel safely to the recipient.",
      },
      {
        title: "Choosing the Right Tool",
        body: "Use AES for encrypting data at rest and in transit once a key is established. Use RSA (or elliptic-curve alternatives like ECDSA) for key exchange, digital signatures, and scenarios where one party must not know the other's private key. Never try to encrypt large data with RSA directly — wrap a symmetric key instead. You can experiment with both using our encrypt/decrypt tool and RSA key generator, all running in your browser.",
      },
    ],
    faq: [
      {
        question: "Is AES or RSA stronger?",
        answer:
          "They protect in different ways. AES-256 and RSA-2048 are both considered secure today. AES is symmetric and extremely fast; RSA is asymmetric and slower but enables public-key exchange and signatures. Strength also depends on correct implementation and key management.",
      },
      {
        question: "Why does TLS use both RSA and AES?",
        answer:
          "TLS uses RSA (or a key-exchange algorithm) to securely share a session secret, then AES to encrypt the data. This hybrid approach combines RSA's easy key distribution with AES's speed.",
      },
      {
        question: "Can AES keys be shared securely?",
        answer:
          "Not over an insecure channel. That is the problem AES alone cannot solve — which is why key exchange protocols (RSA, ECDHE, Diffie-Hellman) exist to establish the shared AES key securely.",
      },
      {
        question: "Where can I try AES and RSA online?",
        answer:
          "Use our encrypt/decrypt tool for AES encryption and our RSA key generator to create key pairs — both operate entirely in your browser, so your data never leaves your device.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "crc32-vs-md5",
    title: "CRC32 vs MD5: Checksum and Integrity Checking Compared",
    description: "CRC32 vs MD5 compared for checksums and file integrity. Learn about error detection, collision resistance, and when to use CRC32 versus MD5.",
    category: "Security",
    tools: ["file-checksum", "hash-generator"],
    intro:
      "CRC32 and MD5 both produce compact digests used to verify that data has not changed, but they were built for different threats. CRC32 is a checksum designed to catch accidental corruption — a flipped bit, a dropped byte, a bad disk sector. MD5 is a cryptographic hash designed to detect tampering — though, as a cryptographic hash, MD5 is now considered broken for that purpose. Choosing between them depends on whether you are defending against noise or against an adversary.",
    sections: [
      {
        title: "CRC32: Detecting Accidental Corruption",
        body: "CRC32 (Cyclic Redundancy Check, 32-bit) computes a 32-bit checksum using polynomial division over the data. It is extraordinarily fast and catches single-bit errors, bursts of errors, and many common corruption patterns — which is why it is used everywhere from Ethernet frames, ZIP archives, and PNG images to file-transfer verification. But a 32-bit space means it only has about 4 billion possible values, so different files can share the same CRC32, and it provides essentially no protection against a deliberate attacker who can engineer collisions.",
      },
      {
        title: "MD5: Cryptographic Intent, Broken Reality",
        body: "MD5 produces a 128-bit digest and was designed as a cryptographic hash. With 2^128 possible digests, random collisions are astronomically unlikely, and for decades it was used to verify file downloads and stored passwords. However, researchers demonstrated practical collision attacks in 2004, allowing attackers to craft two different files with identical MD5 hashes — the basis of the famous 2008 Flame malware's fake certificate. MD5 is therefore no longer acceptable for tamper detection or authentication.",
      },
      {
        title: "Key Differences",
        body: "The essential difference is threat model. CRC32 is an error-detection code: fast, tiny, and perfect for catching accidental corruption, but not collision-resistant. MD5 is a cryptographic hash: far larger output space and designed to resist deliberate collisions, but compromised in practice. For ordinary integrity checks of downloads over trusted channels, either works — but only CRC32 is appropriate for checksums that will never face an adversary, and only SHA-256 (not MD5) is appropriate when authenticity matters.",
      },
      {
        title: "What to Use in 2026",
        body: "Use CRC32 for quick integrity checks during file transfer, archive verification, and data-structure hashing where corruption (not attack) is the concern. Use SHA-256 — not MD5 — whenever the data could be tampered with, such as download integrity for software you actually install. For password storage or signatures, use a dedicated slow hash or asymmetric signing. You can compute CRC32, MD5, and every SHA variant instantly with our file checksum tool, which runs in your browser.",
      },
    ],
    faq: [
      {
        question: "Is CRC32 the same as a hash?",
        answer:
          "CRC32 is a checksum (error-detection code), not a cryptographic hash. It is fast and catches accidental corruption but offers no collision resistance, so it is unsuitable for security.",
      },
      {
        question: "Can CRC32 collisions happen?",
        answer:
          "Yes. CRC32 has only 2^32 possible values, so collisions between different inputs are relatively easy to find and even occur by chance with large datasets. It is designed to catch accidental errors, not adversarial tampering.",
      },
      {
        question: "Is MD5 still used for file downloads?",
        answer:
          "Less than it used to be. Many projects now publish SHA-256 hashes because MD5 collisions are practical. For security-sensitive downloads, verify against a SHA-256 digest.",
      },
      {
        question: "Where can I compute checksums for my files?",
        answer:
          "Use our free file checksum calculator to compute CRC32, MD5, SHA-1, and SHA-256 for any file directly in your browser — nothing is uploaded to a server.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "url-encoding-vs-html-encoding",
    title: "URL Encoding vs HTML Encoding: What's the Difference?",
    description: "URL encoding vs HTML entity encoding compared. Learn how percent-encoding and HTML entities work, when to use each, and how they prevent broken URLs and XSS.",
    category: "Encodings",
    tools: ["url-encoder", "html-entity", "escape-unescape"],
    intro:
      "URL encoding and HTML encoding both transform special characters into safe text, but for entirely different contexts. URL (percent) encoding protects characters so they are safe inside a URI. HTML entity encoding replaces characters like <, >, and & so browsers render them as text instead of markup. Confusing the two produces broken links, double-encoded text, or — worse — XSS vulnerabilities. Understanding which encoding belongs where is a core web-development skill.",
    sections: [
      {
        title: "URL Encoding: Making Characters URI-Safe",
        body: "URL encoding (percent-encoding, RFC 3986) replaces characters that are reserved or unsafe in a URL with a percent sign and two hex digits. A space becomes %20, an ampersand becomes %26, and a question mark becomes %3F. This is necessary because characters like ?, #, &, and = already have special meaning in URLs — embedding them raw would change the URL's structure. URL encoding is context-specific: a value destined for a query string may need different escaping than one in a path segment.",
      },
      {
        title: "HTML Encoding: Making Text Render as Text",
        body: "HTML entity encoding replaces characters that the browser would otherwise interpret as markup. The critical ones are < (&lt;), > (&gt;), & (&amp;), and &quot; (&quot;). When user input contains angle brackets and is inserted into HTML without escaping, the browser treats it as tags — the basis of stored and reflected cross-site scripting (XSS) attacks. HTML encoding neutralizes this by turning the dangerous characters into entities that render as literal text.",
      },
      {
        title: "Key Differences",
        body: "The two encodings serve different parsers and use different escape syntaxes. URL encoding uses %XX percent-escapes for use in URIs. HTML encoding uses &name; or &#nn; entities for use in markup. Applying URL encoding to HTML or HTML encoding to URLs produces garbage or double-encoding. For example, sending &lt; through a URL encoder would give %26lt%3B — the wrong result for either context. The right approach is to encode at the boundary: URL-encode values when building URLs, and HTML-encode values when inserting them into HTML.",
      },
      {
        title: "Security and Best Practices",
        body: "Correct encoding is a first line of defense. Always URL-encode user input before placing it in query strings, paths, or redirects. Always HTML-encode (or use framework auto-escaping) before placing user input in HTML to prevent XSS. Never double-encode — it is a common cause of \"Mickey Mouse\" characters in URLs and forms. Use an encoder tool to verify your output, and remember that encoding is context-sensitive: the same string may need different treatment in a URL, in HTML, in JSON, or in a JavaScript string.",
      },
    ],
    faq: [
      {
        question: "What is the difference between URL encoding and HTML encoding?",
        answer:
          "URL encoding (percent-encoding) makes characters safe inside URIs using %XX escapes, while HTML encoding replaces characters like < and > with entities so they render as text in HTML. They operate in different contexts and use different syntax.",
      },
      {
        question: "Can URL encoding prevent XSS?",
        answer:
          "No. XSS is prevented by HTML-encoding user input when it is inserted into markup. URL encoding only protects URLs and does not stop browsers from interpreting encoded characters as HTML.",
      },
      {
        question: "What is double encoding and why is it bad?",
        answer:
          "Double encoding applies the same encoding twice, such as encoding already-encoded text. It produces wrong results like %2520 instead of %20 and is a frequent source of bugs in forms and URLs.",
      },
      {
        question: "Where can I test URL and HTML encoding online?",
        answer:
          "Use our URL encoder/decoder for percent-encoding and our HTML entity encoder/decoder for entity conversion — both run entirely in your browser with no data uploaded.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
  {
    slug: "ascii-vs-unicode",
    title: "ASCII vs Unicode: Character Encoding Compared",
    description: "ASCII vs Unicode compared: character sets, UTF-8, code points, and why Unicode replaced ASCII. Learn how text encoding works and avoid mojibake.",
    category: "Encodings",
    tools: ["text-to-unicode", "binary", "hex"],
    intro:
      "ASCII and Unicode are both systems for mapping characters to numbers, but they operate at vastly different scales. ASCII defines 128 characters — enough for English text and control codes. Unicode defines over a million code points covering virtually every writing system on Earth, with UTF-8 as its dominant byte encoding. Every string you process today is, almost certainly, Unicode encoded as UTF-8. Understanding the difference explains everything from emoji to mojibake to file-size surprises.",
    sections: [
      {
        title: "ASCII: The 7-Bit Foundation",
        body: "ASCII (American Standard Code for Information Interchange) was standardized in 1963 and encodes 128 characters using 7 bits: 95 printable characters (letters, digits, punctuation) plus 33 control codes. It is the ancestor of all modern character encodings, and its first 128 code points are preserved identically in Unicode. ASCII is wonderfully simple and unambiguous — but it cannot represent accented letters, currency symbols, or any non-English script.",
      },
      {
        title: "Unicode: Every Character, Every Language",
        body: "Unicode is a computing standard that assigns every character a unique number, called a code point (U+0041 for 'A', U+1F600 for the emoji). It covers scripts from Latin and Cyrillic to Chinese, Arabic, and Devanagari, plus symbols, emoji, and historic scripts. Unicode is not itself an encoding — it is the mapping — and it is delivered to disk and wire through encodings like UTF-8, UTF-16, and UTF-32.",
      },
      {
        title: "UTF-8: The Encoding That Won",
        body: "UTF-8 encodes Unicode code points into one to four bytes. ASCII characters are a single byte (backward compatible with ASCII), common European characters take two bytes, and emoji and rare scripts take four. UTF-8 is the dominant encoding of the web — over 98% of websites use it — because it is compact for English, handles every language, and is endian-independent. Its variable length explains why \"a\" is 1 byte but the emoji in the same sentence is 4 bytes.",
      },
      {
        title: "ASCII vs Unicode: Key Differences",
        body: "The practical differences are capacity, byte size, and compatibility. ASCII is a fixed 7-bit set of 128 characters. Unicode is a mapping of 1.1 million+ code points, typically serialized as variable-length UTF-8. Every ASCII character is identical in Unicode (and in UTF-8), so ASCII text is a strict subset of UTF-8 text — which is why modern tooling can almost always read old ASCII files without conversion.",
      },
      {
        title: "Avoiding Encoding Bugs",
        body: "Most encoding bugs come from decoding bytes with the wrong encoding — the cause of mojibake (garbled text like Ã© instead of é). To stay safe, declare UTF-8 everywhere: in HTML via <meta charset=\"utf-8\">, in HTTP headers, in your database, and in file formats. When transferring text between systems, convert explicitly rather than relying on auto-detection. You can inspect how any string is encoded at the byte level using our text to Unicode converter.",
      },
    ],
    faq: [
      {
        question: "Is Unicode the same as UTF-8?",
        answer:
          "No. Unicode is the standard that assigns code points to characters, while UTF-8 is one specific encoding that serializes those code points into bytes. UTF-8 is the most common encoding of Unicode text.",
      },
      {
        question: "Does ASCII still exist in modern computing?",
        answer:
          "Yes — the first 128 Unicode code points are exactly ASCII, and ASCII text is valid UTF-8. ASCII remains useful for protocol headers, configuration, and any data that must be English-only and byte-safe.",
      },
      {
        question: "Why does the same text have different byte sizes?",
        answer:
          "Because UTF-8 uses one to four bytes per character. ASCII characters use one byte, accented characters use two, CJK characters use three, and emoji use four.",
      },
      {
        question: "What causes mojibake and how do I fix it?",
        answer:
          "Mojibake happens when bytes encoded as one character set (like UTF-8) are decoded as another (like Latin-1). Re-encoding the corrupted text with the correct original encoding usually restores it. Standardizing on UTF-8 prevents the problem.",
      },
    ],
    published: "2026-08-20",
    modified: "2026-08-20",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}