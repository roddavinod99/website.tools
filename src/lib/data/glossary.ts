export type GlossaryCategory =
  | "Encoding"
  | "Security"
  | "Data Format"
  | "Network"
  | "Image"
  | "PDF"
  | "Developer Tools"
  | "General";

export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTools?: string[];
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "base64",
    term: "Base64",
    definition:
      "Base64 encodes binary data as 64 ASCII characters so it can travel safely in text formats like JSON or email. Decoding reverses the process to restore the original bytes.",
    category: "Encoding",
    relatedTools: ["base64", "image-to-base64"],
    relatedTerms: ["url-encoding", "mime-type"],
  },
  {
    slug: "jwt",
    term: "JWT",
    definition:
      "JSON Web Token is a compact, URL-safe token with header, payload, and signature parts defined by RFC 7519. Servers use it to verify identity and claims without a session store.",
    category: "Security",
    relatedTools: ["jwt-decoder", "jwt-generator"],
    relatedTerms: ["json", "hmac"],
  },
  {
    slug: "json",
    term: "JSON",
    definition:
      "JavaScript Object Notation is a lightweight, text-based data format for exchange defined by RFC 8259. It uses objects and arrays with strict syntax for interoperability.",
    category: "Data Format",
    relatedTools: ["json-formatter", "json-validator"],
    relatedTerms: ["yaml", "xml"],
  },
  {
    slug: "hash",
    term: "Hash",
    definition:
      "A hash maps input of any size to a fixed-length digest that acts as a fingerprint. Cryptographic hashes like SHA-256 are one-way, deterministic, and sensitive to any tweak.",
    category: "Security",
    relatedTools: ["hash-generator", "file-checksum"],
    relatedTerms: ["hmac", "bcrypt"],
  },
  {
    slug: "cron",
    term: "Cron",
    definition:
      "Cron is a time-based scheduler on Unix-like systems that runs commands from a five-field expression for minute, hour, day, month, and weekday. It automates recurring jobs reliably.",
    category: "Developer Tools",
    relatedTools: ["cron-expression"],
    relatedTerms: ["regex"],
  },
  {
    slug: "uuid",
    term: "UUID",
    definition:
      "Universally Unique Identifier is a 128-bit value formatted as 36 hex characters used to identify resources without central coordination. Version 4 uses randomness for uniqueness.",
    category: "Developer Tools",
    relatedTools: ["uuid-generator", "ulid-generator"],
    relatedTerms: ["hash"],
  },
  {
    slug: "dns",
    term: "DNS",
    definition:
      "Domain Name System translates human-readable domain names into IP addresses through a hierarchical, distributed database. It is the phone book that makes the web browsable.",
    category: "Network",
    relatedTools: ["dns-lookup"],
    relatedTerms: ["ip", "http"],
  },
  {
    slug: "ip",
    term: "IP",
    definition:
      "Internet Protocol defines how packets are addressed and routed across networks using IPv4 or IPv6 addresses. Every device needs an IP to send and receive data on the internet.",
    category: "Network",
    relatedTools: ["ip-lookup", "ip-calculator"],
    relatedTerms: ["dns", "tcp"],
  },
  {
    slug: "url-encoding",
    term: "URL Encoding",
    definition:
      "URL encoding, or percent-encoding, replaces unsafe characters in URLs with % plus two hex digits per RFC 3986. It ensures links and query strings transmit correctly.",
    category: "Encoding",
    relatedTools: ["url-encoder", "url-parser"],
    relatedTerms: ["base64", "http"],
  },
  {
    slug: "markdown",
    term: "Markdown",
    definition:
      "Markdown is a lightweight markup language that uses plain-text symbols to define headings, lists, and emphasis. It converts cleanly to HTML and is popular for docs and READMEs.",
    category: "Data Format",
    relatedTools: ["markdown-to-html", "markdown-preview"],
    relatedTerms: ["yaml", "csv"],
  },
  {
    slug: "pdf",
    term: "PDF",
    definition:
      "Portable Document Format preserves layout, fonts, and graphics consistently across devices per ISO 32000. It is ideal for sharing documents that look identical everywhere.",
    category: "PDF",
    relatedTools: ["pdf-merger", "pdf-splitter"],
    relatedTerms: ["image-compression"],
  },
  {
    slug: "image-compression",
    term: "Image Compression",
    definition:
      "Image compression reduces file size by removing redundant or imperceptible data. Lossless keeps every pixel; lossy trades detail for much smaller files.",
    category: "Image",
    relatedTools: ["image-compressor", "image-resizer"],
    relatedTerms: ["webp", "jpeg"],
  },
  {
    slug: "webp",
    term: "WebP",
    definition:
      "WebP is a modern image format from Google offering both lossy and lossless compression with smaller files than JPEG or PNG. It supports transparency and animation in one format.",
    category: "Image",
    relatedTools: ["image-compressor"],
    relatedTerms: ["jpeg", "png"],
  },
  {
    slug: "png",
    term: "PNG",
    definition:
      "Portable Network Graphics is a lossless raster format that preserves sharp edges and supports transparency. It is ideal for icons, screenshots, and graphics needing crisp detail.",
    category: "Image",
    relatedTools: ["image-compressor"],
    relatedTerms: ["webp", "jpeg"],
  },
  {
    slug: "jpeg",
    term: "JPEG",
    definition:
      "JPEG is a lossy raster format optimized for photographs using discrete cosine transform compression. Adjustable quality lets you balance fidelity against file size efficiently.",
    category: "Image",
    relatedTools: ["image-compressor"],
    relatedTerms: ["webp", "png"],
  },
  {
    slug: "svg",
    term: "SVG",
    definition:
      "Scalable Vector Graphics is an XML-based vector format that describes shapes with mathematical paths. It scales without pixelation and can be styled or scripted with CSS and JS.",
    category: "Image",
    relatedTools: ["svg-optimizer", "svg-to-css"],
    relatedTerms: ["image-compression", "png"],
  },
  {
    slug: "exif",
    term: "EXIF",
    definition:
      "Exchangeable Image File Format stores metadata inside JPEG and TIFF images, like camera settings, GPS, and timestamps. Tools can read or strip EXIF to protect privacy.",
    category: "Image",
    relatedTools: ["exif-reader", "exif-transfer"],
    relatedTerms: ["image-compression", "jpeg"],
  },
  {
    slug: "mime-type",
    term: "MIME Type",
    definition:
      "A MIME type, like text/html or image/png, tells browsers and servers what kind of content is being transmitted. Defined by IANA, it determines how the file should be handled.",
    category: "General",
    relatedTools: ["mime-types"],
    relatedTerms: ["http", "base64"],
  },
  {
    slug: "http",
    term: "HTTP",
    definition:
      "Hypertext Transfer Protocol is the request-response protocol of the web defined by RFC 9110. A client sends a method and headers, and the server returns a status and body.",
    category: "Network",
    relatedTools: ["http-header-parser", "http-status-codes"],
    relatedTerms: ["https", "api"],
  },
  {
    slug: "https",
    term: "HTTPS",
    definition:
      "HTTPS is HTTP over TLS, encrypting requests and responses to provide confidentiality, integrity, and authentication. Browsers show a lock icon when the TLS certificate is valid.",
    category: "Network",
    relatedTools: ["ssl-decoder"],
    relatedTerms: ["http", "ssl"],
  },
  {
    slug: "cors",
    term: "CORS",
    definition:
      "Cross-Origin Resource Sharing is a browser security mechanism that controls cross-origin requests via HTTP headers. Servers must explicitly allow origins, methods, and headers.",
    category: "Security",
    relatedTools: ["http-header-parser", "csp-generator"],
    relatedTerms: ["http", "https"],
  },
  {
    slug: "api",
    term: "API",
    definition:
      "Application Programming Interface is a contract that defines how software components interact through endpoints, parameters, and data formats. It enables reuse and integration.",
    category: "Developer Tools",
    relatedTools: ["http-header-parser"],
    relatedTerms: ["rest", "http"],
  },
  {
    slug: "rest",
    term: "REST",
    definition:
      "Representational State Transfer is an architectural style for APIs using stateless HTTP methods and resource URLs. RESTful services use standard verbs and status codes predictably.",
    category: "Developer Tools",
    relatedTools: ["http-header-parser"],
    relatedTerms: ["api", "http"],
  },
  {
    slug: "websocket",
    term: "WebSocket",
    definition:
      "WebSocket is a protocol that upgrades an HTTP connection to a persistent, bidirectional channel per RFC 6455. It enables real-time messaging without repeated polling overhead.",
    category: "Network",
    relatedTools: ["http-header-parser"],
    relatedTerms: ["tcp", "http"],
  },
  {
    slug: "tcp",
    term: "TCP",
    definition:
      "Transmission Control Protocol provides reliable, ordered, error-checked delivery of byte streams over IP. It handles handshakes, retransmission, and flow control for web traffic.",
    category: "Network",
    relatedTools: ["ip-calculator"],
    relatedTerms: ["udp", "ip"],
  },
  {
    slug: "udp",
    term: "UDP",
    definition:
      "User Datagram Protocol sends datagrams without guaranteed delivery, ordering, or connection setup. Its low overhead makes it ideal for DNS, video, and real-time applications.",
    category: "Network",
    relatedTools: ["ip-calculator"],
    relatedTerms: ["tcp", "ip"],
  },
  {
    slug: "ssl",
    term: "SSL",
    definition:
      "Secure Sockets Layer, now succeeded by TLS, encrypts network traffic and authenticates servers via certificates. The term SSL is still used colloquially to mean TLS encryption.",
    category: "Security",
    relatedTools: ["ssl-decoder"],
    relatedTerms: ["https", "aes"],
  },
  {
    slug: "aes",
    term: "AES",
    definition:
      "Advanced Encryption Standard is a symmetric block cipher using 128, 192, or 256-bit keys approved by NIST. It encrypts data fast and securely in software and hardware worldwide.",
    category: "Security",
    relatedTools: ["encrypt-decrypt"],
    relatedTerms: ["rsa", "hash"],
  },
  {
    slug: "rsa",
    term: "RSA",
    definition:
      "RSA is an asymmetric cryptosystem using a public key for encryption and a private key for decryption. Its security relies on the difficulty of factoring large prime products.",
    category: "Security",
    relatedTools: ["rsa-key-generator", "encrypt-decrypt"],
    relatedTerms: ["aes", "ssl"],
  },
  {
    slug: "hmac",
    term: "HMAC",
    definition:
      "Hash-based Message Authentication Code combines a secret key with a hash function to verify both integrity and authenticity. It is widely used to sign API requests securely.",
    category: "Security",
    relatedTools: ["hmac-generator"],
    relatedTerms: ["hash", "jwt"],
  },
  {
    slug: "bcrypt",
    term: "Bcrypt",
    definition:
      "Bcrypt is a password-hashing function that incorporates a salt and adaptive cost factor to resist brute-force attacks. It is the recommended choice for storing passwords safely.",
    category: "Security",
    relatedTools: ["bcrypt-generator", "password-strength"],
    relatedTerms: ["hash", "hmac"],
  },
  {
    slug: "qr-code",
    term: "QR Code",
    definition:
      "Quick Response code is a two-dimensional barcode that stores data in a grid of black and white modules. Phones scan it to open URLs, connect to Wi-Fi, or share contact details.",
    category: "General",
    relatedTools: ["qr-generator", "wifi-qr-generator"],
    relatedTerms: ["barcode"],
  },
  {
    slug: "barcode",
    term: "Barcode",
    definition:
      "A barcode encodes data as bars or patterns that scanners read optically. Linear formats like Code128 and EAN are used for product labeling and inventory tracking.",
    category: "General",
    relatedTools: ["barcode-generator"],
    relatedTerms: ["qr-code"],
  },
  {
    slug: "regex",
    term: "Regex",
    definition:
      "Regular expression is a pattern language for matching, searching, and manipulating text via concise syntax. It powers validation, parsing, and find-replace across many tools.",
    category: "Developer Tools",
    relatedTools: ["regex-tester", "regex-memo"],
    relatedTerms: ["diff", "cron"],
  },
  {
    slug: "diff",
    term: "Diff",
    definition:
      "Diff compares two texts and highlights additions, deletions, and changes line by line. It underpins version control and helps reviewers spot what changed between versions.",
    category: "Developer Tools",
    relatedTools: ["diff-checker", "json-diff"],
    relatedTerms: ["regex"],
  },
  {
    slug: "yaml",
    term: "YAML",
    definition:
      "YAML Ain't Markup Language is a human-readable data serialization format using indentation to denote structure. It is widely used for configuration files in DevOps workflows.",
    category: "Data Format",
    relatedTools: ["yaml-formatter", "toml-converter"],
    relatedTerms: ["json", "toml"],
  },
  {
    slug: "xml",
    term: "XML",
    definition:
      "Extensible Markup Language is a strict, tag-based format for storing and transporting structured data defined by W3C. It supports schemas and namespaces for rigorous validation.",
    category: "Data Format",
    relatedTools: ["xml-formatter", "xml-to-json"],
    relatedTerms: ["json", "yaml"],
  },
  {
    slug: "toml",
    term: "TOML",
    definition:
      "Tom's Obvious Minimal Language is a configuration format designed to be unambiguous and map cleanly to hash tables. Cargo and many Rust tools use TOML for settings.",
    category: "Data Format",
    relatedTools: ["toml-converter"],
    relatedTerms: ["yaml", "json"],
  },
  {
    slug: "csv",
    term: "CSV",
    definition:
      "Comma-Separated Values is a tabular text format where each line is a row and commas separate columns. It is the simplest way to exchange spreadsheet and database data.",
    category: "Data Format",
    relatedTools: ["csv-to-json", "json-to-csv"],
    relatedTerms: ["json", "yaml"],
  },
  {
    slug: "tls",
    term: "TLS",
    definition:
      "Transport Layer Security encrypts data in transit and authenticates the peer via certificates, succeeding SSL. It secures HTTPS, email, and other protocols end-to-end.",
    category: "Security",
    relatedTools: ["ssl-decoder"],
    relatedTerms: ["ssl", "https"],
  },
];

export const glossaryBySlug = new Map<string, GlossaryTerm>(
  glossaryTerms.map((t) => [t.slug, t]),
);

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryBySlug.get(slug);
}

export const glossaryCategories: GlossaryCategory[] = [
  "Encoding",
  "Security",
  "Data Format",
  "Network",
  "Image",
  "PDF",
  "Developer Tools",
  "General",
];
