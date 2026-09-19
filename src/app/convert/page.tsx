import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Calculator, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { landingPageCountsByCategory, listIndexableLandingPages } from "@/lib/seo/landing-pages";
import { breadcrumbList, collectionPage, jsonLdScriptBody } from "@/lib/seo/json-ld";

/**
 * /convert — hub for all long-tail conversion / compute pages.
 *
 * Per https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * and https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
 * Google discovers URLs via sitemaps (suggestion) and internal links (priority signal).
 * Pages that exist only in a sitemap with 0 internal links are deprioritized as
 * "Discovered – currently not indexed" (GSC). This hub + per-category hubs
 * provide ≤2-click paths from homepage to every /convert/* landing page, directly
 * addressing the 710-discovered issue (2026-09-18 Coverage).
 *
 * CollectionPage + BreadcrumbList JSON-LD per schema.org/CollectionPage and
 * developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */

export const metadata: Metadata = {
  title: "All Conversion & Calculation Pages",
  description:
    "Browse every unit conversion, health, finance, math and wire-gauge calculation on DevStackIO — 580+ pre-filled tools for the most-searched queries. 100% browser-based, privacy-first.",
  alternates: { canonical: `${siteConfig.url}/convert` },
  openGraph: {
    title: "All Conversion & Calculation Pages — DevStackIO",
    description:
      "580+ pre-filled calculation pages: length, temperature, BMI, mortgage, scientific, wire gauge and more.",
    url: `${siteConfig.url}/convert`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "All Conversion & Calculation Pages — DevStackIO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Conversion & Calculation Pages — DevStackIO",
    description: "Browse 580+ pre-filled tools.",
    images: [siteConfig.ogImage],
  },
};

const categoryDescriptions: Record<string, string> = {
  length: "Length & distance conversions (cm, ft, km, miles).",
  mass: "Weight & mass conversions (kg, lb, oz, grams).",
  temperature: "Temperature conversions (Celsius, Fahrenheit, Kelvin).",
  area: "Area conversions (sqm, sqft, acres, hectares).",
  volume: "Volume conversions (liters, gallons, cups).",
  speed: "Speed conversions (mph, km/h, knots).",
  pressure: "Pressure conversions (psi, bar, kPa).",
  energy: "Energy conversions (kWh, BTU, joules).",
  data: "Data storage conversions (KB, MB, GB, TB).",
  frequency: "Frequency conversions (Hz, kHz, GHz).",
  "fuel-economy": "Fuel economy (mpg, L/100km).",
  time: "Time conversions (seconds, minutes, hours, days).",
  power: "Power conversions (watts, horsepower).",
  health: "BMI calculator pre-fills for height/weight combos.",
  age: "Age calculator – age if born on any date.",
  date: "Date calculator – days between & add/subtract.",
  finance: "Mortgage, compound interest & loan EMI presets.",
  calc: "Scientific calculator presets (trig, log).",
  stats: "Statistics presets (mean, variance, stddev).",
  tip: "Tip calculator presets (15%, 18%, 20% on common bills).",
  discount: "Discount presets (20% off, 30% off, stacked).",
  inflation: "Inflation: future cost of money at 2-10% over 10-50y.",
  vat: "VAT/GST presets for 10 countries (UK, DE, FR, IN…).",
  wire: "Wire gauge AWG ↔ mm² conversions and diameters.",
  "voltage-drop": "Voltage drop for 12V/24V/120V/240V + AWG combos.",
};

function formatLabel(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ConvertHubPage() {
  const counts = landingPageCountsByCategory();
  const totalPages = listIndexableLandingPages().length;
  const hubUrl = `${siteConfig.url}/convert`;

  const breadcrumb = breadcrumbList([
    { name: "Home", url: siteConfig.url },
    { name: "Tools", url: `${siteConfig.url}/tools` },
    { name: "Convert", url: hubUrl },
  ]);

  const collection = collectionPage({
    name: "All Conversion & Calculation Pages",
    description:
      "Browse every pre-filled calculation page on DevStackIO. Each page wraps a privacy-first browser tool with a formula, example, and FAQ.",
    url: hubUrl,
    items: counts.map(({ category, count }) => ({
      name: formatLabel(category),
      url: `${siteConfig.url}/convert/${category}`,
      description: categoryDescriptions[category] ?? `${count} pages`,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(collection) }} />

      <section className="border-b border-[var(--color-border)]">
        <div className="container py-6">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/tools" className="hover:text-[var(--color-text)]">Tools</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-[var(--color-text)]">Convert</span>
          </nav>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            Long-tail library
          </div>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">Conversion & calculation library</h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            Every pre-filled value variant of our tools — {totalPages} pages — grouped by category. Each page pre-fills the
            browser-first calculator so the answer is visible immediately, with a formula and FAQ.
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            These pages are linked from here and from each per-category hub so Google can crawl them efficiently (no orphan
            sitemap-only URLs). See also:{" "}
            <Link href="/tools" className="font-medium text-blue-700 dark:text-blue-400 underline">
              All tools
            </Link>
            {" · "}
            <Link href="/categories" className="font-medium text-blue-700 dark:text-blue-400 underline">
              Categories
            </Link>
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map(({ category, count }) => (
            <Link
              key={category}
              href={`/convert/${category}`}
              className="group flex flex-col justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    {formatLabel(category)}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-blue-700" aria-hidden="true" />
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{categoryDescriptions[category] ?? ""}</p>
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">{count} pages</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
