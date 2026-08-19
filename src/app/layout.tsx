import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig, allTools, featuredTools } from "@/lib/constants";
import { Analytics } from "@/components/layout/analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FileCleanupProvider } from "@/components/layout/file-cleanup-provider";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { PreloadPopularTools } from "@/components/layout/tool-preloader";
import { AnalyticsTracker } from "@/components/layout/analytics-tracker";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";

export const revalidate = 3600;

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const HAS_GOOGLE_TAGS = !!(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID);

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: "400",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "DevStackIO Tools",
      url: siteConfig.url,
      description: "Free online developer tools from DevStackIO. Format, encode, generate, convert, and analyze data entirely in your browser with no server uploads.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: "DevStackIO",
        url: siteConfig.mainSiteUrl,
      },
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.mainSiteName,
        url: siteConfig.mainSiteUrl,
      },
    },
    {
      "@type": "Organization",
      name: "DevStackIO",
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo-light.png`,
      },
      description: "DevStackIO provides free online developer tools, learning resources, APIs, and utilities — all processing data entirely in your browser.",
      email: siteConfig.contactEmail,
      foundingDate: "2024",
      alternateName: "DevStack",
      sameAs: [
        siteConfig.mainSiteUrl,
        siteConfig.url,
        siteConfig.links.github,
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "customer service",
        },
        {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "technical support",
        },
        {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "sales",
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "DevStackIO Tools — Free Online Developer Tools",
    template: `%s | DevStackIO Tools`,
  },
  description: "Free online developer tools from DevStackIO. Format JSON, decode JWT, generate UUIDs, compress images, and more — all in your browser, no uploads.",
  keywords: [
    "developer tools",
    "online tools",
    "DevStackIO",
    "JSON formatter",
    "JWT decoder",
    "UUID generator",
    "free tools",
    "base64 encoder",
    "password generator",
    "privacy-first tools",
  ],
  authors: [{ name: "DevStackIO" }],
  creator: "DevStackIO",
  publisher: "DevStackIO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "DevStackIO Tools — Free Online Developer Tools",
    description: "Free online developer tools from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.",
    siteName: "DevStackIO Tools",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStackIO Tools — Free Online Developer Tools",
    description: "Free online developer tools from DevStackIO. Format, encode, generate, and analyze data entirely in your browser.",
    images: [siteConfig.ogImage],
    creator: "@devstackio",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSansArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
        {HAS_GOOGLE_TAGS && (
          <Script
            id="consent-init"
            src="/consent-init.js"
            strategy="beforeInteractive"
          />
        )}
        {GA_ID && (
          <Script
            id="analytics-init"
            src="/analytics-init.js"
            strategy="beforeInteractive"
          />
        )}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0070f3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="max-image-preview:large" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <FileCleanupProvider>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none">
                Skip to content
              </a>
              <Suspense>
                <Analytics />
                <AnalyticsTracker />
                <PreloadPopularTools featuredTools={featuredTools} />
              </Suspense>
              <AdSenseScript />
              <Header allTools={allTools} />
              <main id="main-content" className="flex-1">{children}</main>
              <AdBanner slot={adSlots.footer} />
              <Footer />
              <CookieConsent />
          </FileCleanupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
