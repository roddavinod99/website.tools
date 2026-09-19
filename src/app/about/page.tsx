import type { Metadata } from "next";
import { siteConfig, TOOL_COUNT } from "@/lib/data";

export const metadata: Metadata = {
  title: "About DevStackIO — Free Developer Tools Platform",
  description: "Learn about DevStackIO — the parent platform behind tools.devstackio.com. Our mission is to provide free, privacy-first developer tools for everyone.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About DevStackIO — Free Developer Tools Platform",
    description: "DevStackIO provides free online developer tools at tools.devstackio.com. Learn about our mission, principles, and roadmap.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "About DevStackIO — DevStackIO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About DevStackIO — Free Developer Tools Platform",
    description: "DevStackIO provides free online developer tools at tools.devstackio.com. Learn about our mission, principles, and roadmap.",
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  const orgId = `${siteConfig.url}/#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "About", item: `${siteConfig.url}/about` },
        ],
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: "DevStackIO",
        url: siteConfig.url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="container py-12 md:py-16">
      <article className="prose mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          About DevStackIO
        </h1>

        <div className="mt-8 space-y-8 text-[var(--color-text-muted)]">
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">The DevStackIO Platform</h2>
            <p className="mt-2">
              DevStackIO is the parent platform behind{" "}
              <a href={siteConfig.url} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 underline">tools.devstackio.com</a>
              {" — "}the official collection of free online developer tools. Both websites are maintained
              by the same team and share the same commitment to privacy, quality, and accessibility.
            </p>
            <p className="mt-2">
              <a href={siteConfig.mainSiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 underline">
                DevStackIO
              </a>{" "}
              is the parent organization that provides the developer tools platform, learning resources,
              APIs, and utilities for the developer community.
            </p>
            <p className="mt-2">
              <a href={siteConfig.url} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 underline">
                Tools.DevStackIO
              </a>{" "}
              is our dedicated tools website featuring {TOOL_COUNT}+ free online developer utilities —
              all processing data entirely in your browser with zero server uploads.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Our Mission</h2>
            <p className="mt-2">
              DevStackIO is building the internet&apos;s best collection of free online tools for
              developers. We believe that high-quality developer tools should be accessible to
              everyone, everywhere, without barriers.
            </p>
            <p className="mt-2">
              Every tool on DevStackIO is free, works entirely in your browser, and requires no
              account or login. Your data never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Our Vision</h2>
            <p className="mt-2">
              We envision a world where every developer, regardless of location or resources, has
              access to professional-grade tools. By combining utilities, educational content, and
              best practices, we create a platform where every page is not just a tool but a
              learning resource.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Why DevStackIO Exists</h2>
            <p className="mt-2">
              Developers frequently need quick, reliable tools for tasks like JSON formatting, JWT
              decoding, image optimization, and more. Existing solutions often require uploads to
              third-party servers, creating privacy concerns. DevStackIO solves this by running
              everything client-side, in your browser. No data transmission, no privacy risks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Our Principles</h2>
            <ul className="mt-2 space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">01</span>
                <div><strong>Privacy First</strong> &mdash; We never store or share your data. All processing happens in your browser.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">02</span>
                <div><strong>Free Forever</strong> &mdash; Core tools will always be free. No hidden charges, no credit card needed.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">03</span>
                <div><strong>Quality Over Quantity</strong> &mdash; Every tool is thoughtfully designed, thoroughly tested, and continuously improved.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">04</span>
                <div><strong>Developer Experience</strong> &mdash; Fast, keyboard-friendly, accessible, and a joy to use.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">05</span>
                <div><strong>Open-Source Philosophy</strong> &mdash; We believe in transparency and community-driven development where possible.</div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Our Roadmap</h2>
            <p className="mt-2">
              We are continuously expanding our tool collection and platform capabilities. Upcoming
              developments include:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Expanding beyond {TOOL_COUNT} developer tools across new categories</li>
              <li>Premium API for enterprise integration</li>
              <li>Advanced offline support with service workers</li>
              <li>Collaborative tools for team workflows</li>
              <li>Enhanced accessibility features</li>
              <li>Mobile applications for iOS and Android</li>
              <li>Community-contributed tools and plugins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Open Source</h2>
            <p className="mt-2">
              We believe in the power of open source. Our tools are built with transparency and
              community input. We welcome contributions, bug reports, and feature suggestions from
              the developer community. Visit our{" "}
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 underline">
                GitHub repository
              </a>{" "}
              to contribute.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Contact Us</h2>
            <p className="mt-2">
              Have questions, suggestions, or feedback? We&apos;d love to hear from you.{" "}
              <a href="/contact" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 underline">Get in touch</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
    </>
  );
}
