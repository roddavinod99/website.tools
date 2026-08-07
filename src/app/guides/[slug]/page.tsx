import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { learningTopics, siteConfig } from "@/lib/constants";

const guideDates: Record<string, { published: string; modified: string }> = {
  "getting-started-json": { published: "2026-06-28", modified: "2026-06-28" },
  "understanding-jwt": { published: "2026-06-25", modified: "2026-06-25" },
  "image-optimization-guide": { published: "2026-06-20", modified: "2026-06-20" },
  "password-security": { published: "2026-06-15", modified: "2026-06-15" },
  "understanding-base64": { published: "2026-07-01", modified: "2026-07-01" },
  "css-minification-guide": { published: "2026-07-02", modified: "2026-07-02" },
  "regex-fundamentals": { published: "2026-07-03", modified: "2026-07-03" },
  "unix-timestamps-explained": { published: "2026-07-04", modified: "2026-07-04" },
  "html-encoding-guide": { published: "2026-07-05", modified: "2026-07-05" },
  "data-serialization-formats": { published: "2026-07-06", modified: "2026-07-06" },
};

const guideToBlog: Record<string, { slug: string; title: string }> = {
  "getting-started-json": {
    slug: "getting-started-json",
    title: "Getting Started with JSON: A Complete Guide",
  },
  "understanding-jwt": {
    slug: "understanding-jwt",
    title: "Understanding JWT Tokens: How They Work",
  },
  "image-optimization-guide": {
    slug: "image-optimization",
    title: "Image Optimization for the Web",
  },
  "password-security": {
    slug: "password-security",
    title: "Password Security: Best Practices for 2026",
  },
};

const guideContent: Record<string, { sections: { title: string; body: string }[] }> = {
  "getting-started-json": {
    sections: [
      { title: "What is JSON?", body: "JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that is easy for humans to read and write and easy for machines to parse and generate. It was originally derived from a subset of the JavaScript Programming Language, but it is now language-agnostic and supported natively by almost every programming language and platform. Because it represents data as plain text, JSON is ideal for transmitting structured information between a server and a web application over HTTP. You will encounter JSON everywhere: REST API responses, configuration files, NoSQL databases, browser storage, and tool-to-tool integrations." },
      { title: "JSON Syntax", body: "JSON data is always written as a collection of key-value pairs. Keys must be strings wrapped in double quotes, while values can be a string, number, boolean, null, object, or array. Objects are enclosed in curly braces and arrays in square brackets, which allows you to model arbitrarily complex, nested data structures. Numbers may be integers or floating point, but leading zeros and special JavaScript values like Infinity or NaN are not valid JSON. A common mistake is using single quotes or trailing commas; both are valid in JavaScript object literals but will cause a JSON parser to throw an error. Whitespace between tokens is allowed and often used for pretty-printing." },
      { title: "Working with JSON in JavaScript", body: "In JavaScript, use JSON.parse() to convert a JSON string into a live JavaScript object, and JSON.stringify() to serialize a JavaScript object back into a JSON string. Both methods are available in every modern browser and in Node.js, and they accept optional parameters for revivers, replacers, and pretty-print indentation. JSON.parse() throws a SyntaxError on malformed input, so production code should wrap calls in try/catch or validate first. For large payloads, prefer a streaming parser to avoid blocking the main thread, which is why tools like our JSON formatter run in a Web Worker." },
      { title: "JSON in APIs", body: "JSON is the de facto standard for REST and GraphQL APIs because it is compact, readable, and universally supported. Most API responses are JSON objects, and API requests frequently include JSON payloads in the request body with the Content-Type header set to application/json. When designing an API, keep payloads flat where possible, use consistent naming conventions, and version your schemas so that changes do not break existing clients. Tools like our JSON Formatter and JSON to CSV converter make it easy to inspect, validate, and transform the data you receive from APIs before using it." },
    ]
  },
  "understanding-jwt": {
    sections: [
      { title: "What are JWTs?", body: "JSON Web Tokens (JWT) are an open standard defined in RFC 7519 that provides a compact, URL-safe way to securely transmit information between parties as a JSON object. Because the token is self-contained, it can carry claims such as user identity, roles, and expiration directly in the payload without requiring a server-side session lookup. JWTs are used extensively in authentication and authorization flows, single sign-on, and API access control. They are signed with a secret or a public/private key pair, so the receiver can verify that the token was issued by a trusted party and has not been tampered with." },
      { title: "JWT Structure", body: "A JWT consists of three parts separated by dots: the Header, the Payload, and the Signature. The Header typically specifies the signing algorithm, such as HS256 or RS256, and the token type. The Payload contains the claims, which are name-value pairs describing the user or session, such as sub, exp, iat, and custom application data. The Signature is computed by encoding the header and payload and signing the result with the chosen algorithm and key. Each of the three parts is Base64Url-encoded, meaning a JWT is readable text but not encrypted — never place secrets or sensitive personal data in the payload. Use a tool like our JWT Decoder to inspect each part of a token and verify its signature." },
      { title: "How JWTs Work", body: "After a user successfully logs in, the server creates a signed JWT and returns it to the client. The client stores the token, typically in memory or in an httpOnly cookie, and includes it in the Authorization header of every subsequent request. When the server receives a request, it verifies the token's signature, checks the expiration claim, and extracts the user information from the payload without needing to query a session store. This stateless design makes JWTs ideal for horizontally scaled microservices and serverless architectures. The trade-off is that you cannot easily revoke a token before it expires, which is why short expiration times and refresh tokens are strongly recommended." },
      { title: "Best Practices", body: "Always transmit JWTs over HTTPS to prevent interception, and set short expiration times measured in minutes rather than hours. Prefer asymmetric algorithms like RS256 or ES256 so clients can verify tokens with a public key while only the issuer holds the private key. Never store sensitive data in the payload, since it is only Base64Url-encoded, not encrypted. Validate the issuer, audience, and expiration claims on every request, and treat unknown or unexpected claims with caution. Use our JWT Decoder to experiment with token structures and verify that the tokens your application issues are correctly formed and signed." },
    ]
  },
  "image-optimization-guide": {
    sections: [
      { title: "Why Optimize Images?", body: "Images account for over 50% of the typical webpage's total byte weight, making them the single biggest contributor to slow load times. Optimizing images improves Core Web Vitals scores such as LCP and CLS, reduces bandwidth costs, and dramatically improves the experience for users on slow or mobile connections. Even small savings per image compound quickly on pages with many visuals, galleries, or product catalogs. Search engines also reward faster pages with better rankings, so image optimization is both a performance and an SEO concern." },
      { title: "Image Formats", body: "WebP offers excellent compression with high quality and broad browser support, making it the default choice for photographs and complex graphics. AVIF is emerging as a next-generation format with even better compression, though encoding can be slower. JPEG remains ideal for photographic content when maximum compatibility is needed, PNG is best for images that require transparency or lossless quality, and SVG is the right format for vector graphics such as logos and icons. The best practice is to serve responsive images using the srcset attribute so each device receives an appropriately sized file." },
      { title: "Compression Techniques", body: "Lossy compression reduces file size by discarding fine image data that the human eye is unlikely to notice, while lossless compression preserves every original pixel. Tools like our Image Compressor let you tune the quality slider to find the ideal balance between file size and visual fidelity for a given format. You can also reduce dimensions, strip unnecessary metadata such as EXIF data, and remove unused color profiles to shrink files further. Aim for images under 100 KB wherever possible, and always test compressed output visually before shipping it to production." },
      { title: "Practical Workflow", body: "A reliable optimization workflow starts with choosing the correct format, then resizing to the largest dimension the layout will actually use, followed by applying lossy compression at a quality setting that is visually indistinguishable from the original. Modern bundlers and image pipelines can automate much of this work with build-time plugins. Use our Image Resizer to batch-resize assets and our Image Compressor to reduce their weight before deployment, then verify the results with a performance audit to confirm your LCP and CLS targets are met." },
    ]
  },
  "password-security": {
    sections: [
      { title: "Creating Strong Passwords", body: "A strong password should be at least 12 characters long, ideally 16 or more, and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Length matters far more than complexity, so favor long passphrases made of random, unrelated words over short passwords with a single symbol substitution. Avoid dictionary words, common phrases, birthdays, and personal information, since attackers use wordlists and personal data to crack passwords quickly. The most reliable way to create strong passwords is to generate them randomly with a tool such as our Password Generator." },
      { title: "Password Managers", body: "Password managers generate and store a unique, complex password for every account, so you only need to remember one master password. They also autofill credentials on the correct sites, flag reused or weak passwords, and alert you when a credential appears in a known breach. Using a password manager eliminates the two biggest threats to account security: password reuse and guessable passwords. Most managers also offer encrypted cloud sync, so your vault is available across devices while remaining protected by the master password and, ideally, a hardware security key." },
      { title: "Two-Factor Authentication", body: "Two-factor authentication (2FA) adds a second layer of verification beyond the password, so a stolen password alone is not enough to compromise an account. Prefer authenticator apps (TOTP) or hardware security keys (WebAuthn) over SMS, because SMS codes can be intercepted through SIM-swapping attacks. Wherever an organization offers FIDO2 or passkey support, it provides the strongest protection because it uses public-key cryptography and resists phishing. Enable 2FA on your email account first, since it is the recovery path for most of your other accounts." },
      { title: "Company and Team Practices", body: "Organizations should enforce minimum password length, block common passwords and breached passwords, and encourage passphrases rather than frequent forced resets. Roll out hardware keys or passkeys to employees with access to sensitive systems, and use password managers to share credentials securely instead of sending them over chat or email. Use a password strength checker to evaluate proposed passwords before rollout. Regular security training and incident response drills help turn policy into practice, and our Password Strength tool is a useful way to demonstrate the impact of length and entropy." },
    ]
  },
  "understanding-base64": {
    sections: [
      { title: "What is Base64?", body: "Base64 is a binary-to-text encoding scheme that represents binary data as an ASCII string, making it safe to transmit over text-based protocols such as HTTP, SMTP, and JSON. It works by mapping every 3 bytes of binary data to 4 characters drawn from a 64-character alphabet of A-Z, a-z, 0-9, plus, and slash. This means the encoded output is roughly 33% larger than the original binary data, a cost that is acceptable for text-safe transport. Base64 is not encryption; it is encoding, so anyone who sees the string can decode it." },
      { title: "How Base64 Works", body: "The encoder splits the input into groups of three bytes (24 bits) and then divides those 24 bits into four 6-bit chunks, each of which maps to one character in the Base64 alphabet. When the input length is not a multiple of three, one or two padding characters, represented by the equals sign, are appended so the output length is always a multiple of four. Different variants, such as Base64Url, replace the plus and slash characters with minus and underscore to make the output safe for use in URLs and file names without percent-encoding." },
      { title: "Common Use Cases", body: "Base64 is widely used to embed images directly inside HTML, CSS, and SVG documents using data URIs, avoiding extra network requests. It is also used to encode binary attachments in email (MIME), to store binary blobs inside JSON payloads, and to represent cryptographic keys, certificates, and signatures as portable text. Many configuration files and environment variables carry small Base64-encoded secrets. For large images, however, embedding as Base64 usually hurts performance because of the 33% size overhead, so it is best reserved for small assets such as icons." },
      { title: "Using DevStackIO Base64 Tool", body: "Our Base64 Encoder/Decoder lets you instantly convert text to Base64 or decode Base64 back to plain text, with optional URL-safe output and line-wrapping controls. It also includes an Image to Base64 converter for creating data URIs from image files. All processing happens entirely in your browser, ensuring your data never leaves your device. Whether you are debugging an encoded JWT, building a data URI, or inspecting an email attachment, the tool gives you immediate, accurate results without uploading anything to a server." },
    ]
  },
  "css-minification-guide": {
    sections: [
      { title: "Why Minify CSS?", body: "CSS minification removes unnecessary characters — whitespace, comments, newlines, and optional semicolons — from your stylesheets without changing their functionality. A typical stylesheet shrinks by 30% to 60% after minification, which directly reduces download size and improves First Contentful Paint and LCP. Smaller CSS also means fewer bytes for the parser to process, which is especially important on mobile networks. Because minified CSS is functionally identical, it is a safe, high-impact optimization you can apply with a single tool." },
      { title: "What Minification Removes", body: "Minifiers strip all comments, collapse runs of whitespace, remove unnecessary semicolons and line breaks, and shorten colors where safe, such as converting #ffffff to #fff. Advanced minifiers also merge duplicate selectors and properties, remove unused rules when used with purge tooling, and compress shorthand properties. The result is a compact file that produces the exact same layout and styling as the original. It is best practice to keep your human-readable source in your repository and only deploy the minified artifact." },
      { title: "Minification vs Compression", body: "Minification and compression are complementary techniques. Minification reduces the number of characters in your CSS, while HTTP compression such as Gzip or Brotli encodes the data more efficiently at the transport layer. A minified file also compresses more effectively because repeated patterns are shorter, so the two techniques multiply rather than replace each other. Always enable Brotli or Gzip at the web server level and verify that your CSS is served with the correct Content-Encoding header. Use our CSS Minifier to handle the minification step and inspect the size reduction in real time." },
    ]
  },
  "regex-fundamentals": {
    sections: [
      { title: "What are Regular Expressions?", body: "Regular expressions (regex) are patterns used to match character combinations within strings. They are supported in virtually every programming language, in command-line tools such as grep and sed, and in text editors and IDEs for search, validation, and manipulation. A regex describes a search pattern that can range from a simple literal string to a complex rule involving groups, alternation, quantifiers, and lookarounds. Understanding regex fundamentals lets you write one powerful expression that replaces dozens of lines of manual string-processing code." },
      { title: "Basic Patterns", body: "Literal characters match themselves, so the pattern cat matches the string cat. The dot (.) matches any single character except a line break, the asterisk (*) matches zero or more of the preceding element, and the plus (+) matches one or more. Square brackets define character classes such as [abc] to match any one of a, b, or c, or ranges like [a-z] and [0-9]. Curly braces specify exact or ranged repetition, for example \\d{3} matches exactly three digits, while \\d{3,5} matches between three and five. Escaping a metacharacter with a backslash, as in \\. or \\*, makes it match literally." },
      { title: "Anchors and Groups", body: "The caret (^) anchors a match to the start of a line or string, and the dollar sign ($) anchors to the end, so ^foo$ matches only the exact string foo. Parentheses create capture groups that extract matched portions for later use, and groups can be made non-capturing with (?:...). The pipe (|) acts as an OR operator between alternatives, so cat|dog matches either cat or dog. Lookarounds such as (?=...) and (?!...) let you assert conditions without consuming characters, which is useful for password validation rules." },
      { title: "Practical Examples", body: "Use \\d{3}-\\d{3}-\\d{4} to match US phone numbers, and ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$ to validate email addresses. To find URLs in text, use https?:\\/\\/[^\\s]+. For log analysis, patterns like \\d{4}-\\d{2}-\\d{2} can extract dates from arbitrary text. Because regex engines and flavors differ subtly, always test your expressions with a dedicated tool such as our Regex Tester, which provides real-time matching, capture-group inspection, and flag support before you deploy the pattern." },
    ]
  },
  "unix-timestamps-explained": {
    sections: [
      { title: "What is a Unix Timestamp?", body: "A Unix timestamp is the number of seconds that have elapsed since January 1, 1970 at 00:00:00 UTC, a moment known as the Unix epoch. It is a simple integer that is easy to compare, sort, and store, which is why it is used pervasively in programming languages, databases, logs, and APIs. Because the value is timezone-independent, it avoids the confusion that often accompanies human-readable date strings. The current Unix timestamp is now well over a billion and continues to grow by one every second." },
      { title: "Converting Timestamps", body: "In JavaScript, use Date.now() to get the current timestamp in milliseconds and divide by 1000 for seconds. Convert a Unix timestamp to a human-readable date with new Date(timestamp * 1000).toISOString(), which always returns UTC, or pass a timezone offset for local display. Many languages provide dedicated helpers: in Python, time.time() returns the current seconds-based timestamp, and datetime.fromtimestamp() converts one to a datetime object. Our Timestamp Converter handles both directions across multiple formats and timezones instantly." },
      { title: "Common Pitfalls", body: "The most frequent bug is mixing seconds and milliseconds: JavaScript and several databases use milliseconds, while most APIs and system tools use seconds, so a value can appear off by roughly a thousand times. Always confirm the unit before parsing an external timestamp. Remember that Unix timestamps are always UTC, so converting to a local timezone without an explicit offset produces incorrect wall-clock times. Also beware of out-of-range values, integer overflow on 32-bit systems for dates after 2038, and timestamps that include a fractional component or are stored as strings with trailing zeros." },
      { title: "Using DevStackIO Timestamp Converter", body: "Our Timestamp Converter instantly converts Unix timestamps to human-readable dates and back, supporting seconds and milliseconds, multiple timezone offsets, and several output formats such as ISO 8601 and RFC 3339. It is ideal for debugging logs, verifying database rows, and generating expiration times for tokens and cookies. The tool runs entirely in your browser, so you can convert as many values as you need without any data leaving your device. Paste a timestamp, choose your unit and timezone, and the human-readable equivalent appears immediately." },
    ]
  },
  "html-encoding-guide": {
    sections: [
      { title: "Why HTML Encoding Matters", body: "HTML encoding, also called HTML escaping, converts characters that have special meaning in HTML into their corresponding named or numeric entities. This prevents the browser from misinterpreting user input as markup, which both preserves the intended text and protects against Cross-Site Scripting (XSS) attacks. Any text that originates from user input, databases, third-party APIs, or content management systems should be encoded before it is rendered. Applying encoding consistently is one of the simplest and most effective security controls a web application can adopt." },
      { title: "Common HTML Entities", body: "The most common entities are &amp; for the ampersand, &lt; for the less-than sign, &gt; for the greater-than sign, &quot; for the double quote, and &#x27; for the apostrophe. Any Unicode character can be represented with numeric references: &#NNN; in decimal or &#xNNN; in hexadecimal, for example &#x1F600; for the smiley emoji. Named entities exist for many symbols, such as &nbsp; for a non-breaking space and &copy; for the copyright sign. Using the correct entity ensures the character renders as intended in every browser." },
      { title: "When to Encode", body: "Always encode user-generated content before displaying it in HTML, and encode data when embedding it inside HTML attributes, since attribute values are a common injection vector. Encode dynamic text that appears in XML documents as well, following the same escaping rules. Encoding should happen at the point where content is rendered, not when it is stored, so the original text is preserved for other contexts such as search indexes and APIs. Use our HTML Entity Encoder/Decoder to quickly convert text to entities and back, and verify the result in the final document." },
    ]
  },
  "data-serialization-formats": {
    sections: [
      { title: "JSON", body: "JSON (JavaScript Object Notation) is the most widely used data serialization format on the web. It is lightweight, human-readable, and natively supported in JavaScript, with mature parsers in every other language. JSON supports strings, numbers, booleans, arrays, objects, and null, and is the default interchange format for REST and GraphQL APIs. Because it is so widely supported, JSON is the safest default when you need to exchange data between different systems or store structured documents in a database." },
      { title: "YAML", body: "YAML (YAML Ain't Markup Language) prioritizes human readability, using indentation-based structure instead of braces and brackets. It is the standard for configuration files in Docker, Kubernetes, CI/CD pipelines, and most modern tooling, and it supports comments, multi-line strings, anchors, and complex nested data types. Its readability is its greatest strength, but it also introduces subtle pitfalls such as significant whitespace, ambiguity around strings that look like booleans or numbers, and inconsistent support for some features across parsers. Validate YAML carefully before it is consumed by critical infrastructure." },
      { title: "TOML", body: "TOML (Tom's Obvious Minimal Language) is designed specifically for configuration files, with an emphasis on clarity and unambiguity. It uses INI-like section headers in square brackets, supports tables, arrays of tables, and standard data types, and its parsing rules are precise enough to avoid the ambiguity found in YAML. It is the configuration format used by Rust's Cargo, Python's pyproject.toml, and many Go projects. For simple, human-editable configuration where predictability matters, TOML is often the best choice." },
      { title: "XML", body: "XML (eXtensible Markup Language) is a verbose but powerful format that supports custom schemas, namespaces, attributes, and mixed content. It is still widely used in enterprise systems, SOAP APIs, document storage, and interchange standards such as RSS and SVG. XML's strictness and rich validation options make it valuable when data correctness and schema enforcement are critical. However, its verbosity makes it cumbersome for everyday API use, which is why most modern services prefer JSON or YAML." },
      { title: "Choosing the Right Format", body: "Use JSON for web APIs, data interchange, and most storage. Use YAML for human-maintained configuration and orchestration files. Use TOML for simple, predictable configuration that must parse unambiguously. Use XML when you need schema validation, namespaces, or document-oriented data with attributes. Our Converters make it easy to move data between these formats, so you can migrate configuration or API payloads without manual transcription. All conversions happen in your browser, keeping your data private and secure." },
    ]
  }
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return learningTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = learningTopics.find((t) => t.slug === slug);
  if (!topic) return {};
  const canonical = `${siteConfig.url}/guides/${slug}`;
  return {
    title: `${topic.title} - Guide`,
    description: topic.description,
    alternates: { canonical },
    openGraph: {
      title: `${topic.title} - Guide`,
      description: topic.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${topic.title} - DevStackIO Guide` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.title} - Guide`,
      description: topic.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const topic = learningTopics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const content = guideContent[slug];
  const dates = guideDates[slug] || { published: "2026-07-01", modified: "2026-07-01" };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides` },
              { "@type": "ListItem", position: 3, name: topic.title },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: topic.title,
            description: topic.description,
            url: `${siteConfig.url}/guides/${topic.slug}`,
            datePublished: `${dates.published}T00:00:00Z`,
            dateModified: `${dates.modified}T00:00:00Z`,
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/guides/${topic.slug}` },
            author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
              logo: {
                "@type": "ImageObject",
                url: `${siteConfig.url}/logo-light.png`,
              },
            },
          }),
        }}
      />
      <section className="border-b border-surface-200 dark:border-dark-border">
        <div className="container py-8">
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <Link href="/" className="hover:text-surface-900 dark:hover:text-dark-text">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/guides" className="hover:text-surface-900 dark:hover:text-dark-text">Guides</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-dark-text">{topic.title}</span>
          </nav>
        </div>
      </section>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
            {topic.description}
          </p>
          {content ? (
            <div className="mt-8 space-y-8">
              {content.sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-surface-600 dark:text-dark-muted leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-surface-200 bg-surface-50 p-8 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-surface-500 dark:text-dark-muted">Content for this guide is being written. Check back soon.</p>
            </div>
          )}

          {guideToBlog[slug] && (
            <div className="mt-10 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-surface-500 dark:text-dark-muted">
                Read the full guide
              </h3>
              <Link
                href={`/blog/${guideToBlog[slug].slug}`}
                className="group mt-2 flex items-center gap-2 text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                <span className="font-medium">{guideToBlog[slug].title}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
