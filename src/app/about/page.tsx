import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about DevStackIO - our mission to provide free, privacy-first developer tools for everyone. Discover our story, principles, and roadmap.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About DevStackIO",
    description: "Learn about our mission to provide free, privacy-first developer tools for everyone.",
    url: `${siteConfig.url}/about`,
  },
  other: {
    "article:modified_time": "2024-01-01",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "About" },
        ],
      },
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/logo.png`,
        },
        description: siteConfig.description,
        email: siteConfig.contactEmail,
        foundingDate: "2024",
        alternateName: "DevStack",
        sameAs: [siteConfig.links.github],
        contactPoint: {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "customer service",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          About DevStackIO
        </h1>

        <div className="mt-8 space-y-8 text-surface-600 dark:text-dark-muted">
          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Our Mission</h2>
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
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Our Vision</h2>
            <p className="mt-2">
              We envision a world where every developer, regardless of location or resources, has
              access to professional-grade tools. By combining utilities, educational content, and
              best practices, we create a platform where every page is not just a tool but a
              learning resource.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Why DevStackIO Exists</h2>
            <p className="mt-2">
              Developers frequently need quick, reliable tools for tasks like JSON formatting, JWT
              decoding, image optimization, and more. Existing solutions often require uploads to
              third-party servers, creating privacy concerns. DevStackIO solves this by running
              everything client-side, in your browser. No data transmission, no privacy risks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Our Principles</h2>
            <ul className="mt-2 space-y-3">
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">01</span>
                <div><strong>Privacy First</strong> &mdash; We never store or share your data. All processing happens in your browser.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">02</span>
                <div><strong>Free Forever</strong> &mdash; Core tools will always be free. No hidden charges, no credit card needed.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">03</span>
                <div><strong>Quality Over Quantity</strong> &mdash; Every tool is thoughtfully designed, thoroughly tested, and continuously improved.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">04</span>
                <div><strong>Developer Experience</strong> &mdash; Fast, keyboard-friendly, accessible, and a joy to use.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">05</span>
                <div><strong>Open-Source Philosophy</strong> &mdash; We believe in transparency and community-driven development where possible.</div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Our Roadmap</h2>
            <p className="mt-2">
              We are continuously expanding our tool collection and platform capabilities. Upcoming
              developments include:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Expanding to 100+ developer tools across new categories</li>
              <li>Premium API for enterprise integration</li>
              <li>Advanced offline support with service workers</li>
              <li>Collaborative tools for team workflows</li>
              <li>Enhanced accessibility features</li>
              <li>Mobile applications for iOS and Android</li>
              <li>Community-contributed tools and plugins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Open Source</h2>
            <p className="mt-2">
              We believe in the power of open source. Our tools are built with transparency and
              community input. We welcome contributions, bug reports, and feature suggestions from
              the developer community. Visit our{" "}
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline">
                GitHub repository
              </a>{" "}
              to contribute.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Contact Us</h2>
            <p className="mt-2">
              Have questions, suggestions, or feedback? We&apos;d love to hear from you.{" "}
              <a href="/contact" className="text-brand-500 hover:text-brand-600 underline">Get in touch</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
    </>
  );
}
