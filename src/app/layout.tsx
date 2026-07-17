import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/constants";
import { Analytics } from "@/components/layout/analytics";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FileCleanupProvider } from "@/components/layout/file-cleanup-provider";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { PreloadPopularTools } from "@/components/layout/tool-preloader";
import { AnalyticsTracker } from "@/components/layout/analytics-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo-light.png`,
      },
      description: siteConfig.description,
      email: siteConfig.contactEmail,
      foundingDate: "2024",
      alternateName: "DevStack",
      sameAs: [
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
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "developer tools",
    "online tools",
    "JSON formatter",
    "JWT decoder",
    "UUID generator",
    "free tools",
    "base64 encoder",
    "password generator",
  ],
  authors: [{ name: "DevStackIO" }],
  creator: "DevStackIO",
  publisher: "DevStackIO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0070f3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="max-image-preview:large" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="alternate" hrefLang="en" href={siteConfig.url} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
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
              <PreloadPopularTools />
            </Suspense>
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </FileCleanupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
