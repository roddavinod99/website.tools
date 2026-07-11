import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

const guideContent: Record<string, { sections: { title: string; body: string }[] }> = {
  "getting-started-json": {
    sections: [
      { title: "What is JSON?", body: "JSON (JavaScript Object Notation) is a lightweight data interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is based on a subset of the JavaScript Programming Language." },
      { title: "JSON Syntax", body: "JSON data is written as key-value pairs. Keys must be strings wrapped in double quotes. Values can be strings, numbers, objects, arrays, booleans, or null. Objects are enclosed in curly braces, arrays in square brackets." },
      { title: "Working with JSON in JavaScript", body: "Use JSON.parse() to convert a JSON string into a JavaScript object, and JSON.stringify() to convert a JavaScript object into a JSON string. These methods are available in all modern browsers and Node.js." },
      { title: "JSON in APIs", body: "JSON is the most common data format for REST APIs. Most API responses are JSON objects, and API requests often include JSON payloads in the body." },
    ]
  },
  "understanding-jwt": {
    sections: [
      { title: "What are JWTs?", body: "JSON Web Tokens (JWT) are an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object." },
      { title: "JWT Structure", body: "A JWT consists of three parts separated by dots: Header (contains the signing algorithm), Payload (contains the claims), and Signature (verifies the token hasn't been tampered with)." },
      { title: "How JWTs Work", body: "After a user logs in, the server creates a signed JWT. The client stores this token and sends it with every request. The server verifies the signature and extracts user information from the payload." },
      { title: "Best Practices", body: "Always use HTTPS, set short expiration times, use strong signing algorithms like RS256, and never store sensitive data in the payload as it is only Base64 encoded, not encrypted." },
    ]
  },
  "image-optimization-guide": {
    sections: [
      { title: "Why Optimize Images?", body: "Images account for over 50% of the typical webpage's total bytes. Optimizing images can dramatically improve page load times, reduce bandwidth costs, and improve user experience." },
      { title: "Image Formats", body: "WebP offers the best compression with quality, JPEG is suitable for photographs, PNG for images requiring transparency, and SVG for vector graphics. AVIF is emerging as a next-generation format." },
      { title: "Compression Techniques", body: "Lossy compression reduces file size by removing image data, while lossless preserves all original data. Tools like our Image Compressor can help you find the right balance." },
    ]
  },
  "password-security": {
    sections: [
      { title: "Creating Strong Passwords", body: "A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using dictionary words or personal information." },
      { title: "Password Managers", body: "Password managers generate and store complex, unique passwords for each of your accounts. You only need to remember one master password. They also autofill credentials and alert you to security issues." },
      { title: "Two-Factor Authentication", body: "2FA adds an extra layer of security by requiring a second form of verification beyond your password. Use authenticator apps or hardware security keys rather than SMS when possible." },
    ]
  },
  "understanding-base64": {
    sections: [
      { title: "What is Base64?", body: "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is commonly used to encode data for transmission over text-based protocols like HTTP and SMTP." },
      { title: "How Base64 Works", body: "Base64 converts every 3 bytes of binary data into 4 ASCII characters. It uses a 64-character alphabet consisting of A-Z, a-z, 0-9, +, and /. Padding characters (=) are added to ensure the output length is a multiple of 4." },
      { title: "Common Use Cases", body: "Base64 is widely used for embedding images in HTML/CSS, encoding binary attachments in emails, storing binary data in JSON, and representing cryptographic keys and certificates in text format." },
      { title: "Using DevStackIO Base64 Tool", body: "Our Base64 Encoder/Decoder lets you instantly encode text to Base64 or decode Base64 back to plain text. All processing happens in your browser, ensuring your data never leaves your device." },
    ]
  },
  "css-minification-guide": {
    sections: [
      { title: "Why Minify CSS?", body: "CSS minification removes unnecessary characters like whitespace, comments, and semicolons from your stylesheets without changing their functionality. This reduces file size, leading to faster page loads and better Core Web Vitals scores." },
      { title: "What Minification Removes", body: "Minification strips out all comments, removes extra whitespace and line breaks, shortens CSS property names where safe, and merges duplicate selectors and properties. The result is functionally identical but significantly smaller." },
      { title: "Minification vs Compression", body: "Minification reduces the number of characters in your CSS, while compression (like Gzip or Brotli) encodes the data more efficiently. Both are important for performance. Our CSS Formatter/Minifier handles the minification step." },
    ]
  },
  "regex-fundamentals": {
    sections: [
      { title: "What are Regular Expressions?", body: "Regular expressions (regex) are patterns used to match character combinations in strings. They are supported in most programming languages and text editors for search, validation, and text manipulation." },
      { title: "Basic Patterns", body: "Literal characters match themselves. The dot (.) matches any single character. The asterisk (*) matches zero or more of the preceding element. The plus (+) matches one or more. Square brackets ([abc]) match any one of the enclosed characters." },
      { title: "Anchors and Groups", body: "The caret (^) anchors to the start of a line, and the dollar sign ($) anchors to the end. Parentheses create capture groups for extracting matched portions. The pipe (|) acts as an OR operator between patterns." },
      { title: "Practical Examples", body: "Use \\d{3}-\\d{3}-\\d{4} to match US phone numbers, ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$ to validate email addresses, and https?:\\/\\/[^\\s]+ to find URLs in text." },
    ]
  },
  "unix-timestamps-explained": {
    sections: [
      { title: "What is a Unix Timestamp?", body: "A Unix timestamp is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC (the Unix epoch). It is widely used in programming and databases for storing point-in-time values." },
      { title: "Converting Timestamps", body: "In JavaScript, use Date.now() to get the current timestamp in milliseconds (divide by 1000 for seconds). Use new Date(timestamp * 1000).toISOString() to convert a Unix timestamp to a human-readable date string." },
      { title: "Common Pitfalls", body: "Always check whether the timestamp is in seconds or milliseconds. JavaScript uses milliseconds, while most APIs and databases use seconds. Be aware of timezone handling — Unix timestamps are always UTC." },
      { title: "Using DevStackIO Timestamp Converter", body: "Our Timestamp Converter instantly converts Unix timestamps to human-readable dates and vice versa. It supports multiple timezones and formats, making it easy to debug and develop with timestamps." },
    ]
  },
  "html-encoding-guide": {
    sections: [
      { title: "Why HTML Encoding Matters", body: "HTML encoding (also called HTML escaping) converts special characters into their corresponding HTML entities. This prevents browser interpretation issues and protects against XSS (Cross-Site Scripting) attacks." },
      { title: "Common HTML Entities", body: "The most common entities are &amp; (&ampersand), &lt; (<), &gt; (>), &quot; (double quote), and &#x27; (apostrophe/single quote). Any Unicode character can be represented using &#NNN; (decimal) or &#xNNN; (hexadecimal) notation." },
      { title: "When to Encode", body: "Always encode user-generated content before displaying it in HTML. Encode data when embedding it in HTML attributes. Encode special characters in XML documents. Use our HTML Entity Encoder/Decoder for quick conversions." },
    ]
  },
  "data-serialization-formats": {
    sections: [
      { title: "JSON", body: "JSON (JavaScript Object Notation) is the most widely used data serialization format. It is lightweight, human-readable, and natively supported in JavaScript. JSON supports strings, numbers, booleans, arrays, objects, and null." },
      { title: "YAML", body: "YAML (YAML Ain't Markup Language) prioritizes human readability with indentation-based structure. It is popular for configuration files (Docker, Kubernetes, CI/CD pipelines) and supports comments, multi-line strings, and complex data types." },
      { title: "TOML", body: "TOML (Tom's Obvious Minimal Language) is designed for configuration files with an emphasis on readability. It uses INI-like sections (headers in square brackets) and supports tables, arrays, and various data types. It is used by Rust's Cargo and Python's pyproject.toml." },
      { title: "XML", body: "XML (eXtensible Markup Language) is a verbose but powerful format that supports custom schemas, namespaces, and attributes. It is still widely used in enterprise systems, SOAP APIs, and document storage." },
      { title: "Choosing the Right Format", body: "Use JSON for web APIs and data interchange. Use YAML for configuration files. Use TOML for simple, human-editable configs. Use XML when schema validation or document-oriented data is required. Our Converters help you move between formats seamlessly." },
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
                url: `${siteConfig.url}/favicon.svg`,
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
        </div>
      </div>
    </>
  );
}
