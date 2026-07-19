import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TOOL_COUNT, siteConfig } from "@/lib/constants";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedTools } from "@/components/home/featured-tools";
import { BenefitsSection } from "@/components/home/benefits-section";
import { LearningSection } from "@/components/home/learning-section";
import { CommunitySection } from "@/components/home/community-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { FAQSection } from "@/components/home/faq-section";
import { AdBanner } from "@/components/ads";

export const metadata: Metadata = {
  description:
    "Free online developer tools from DevStackIO. Format JSON, decode JWT, generate UUIDs, convert data, compress images, and more — all in your browser, zero server uploads.",
  alternates: {
    canonical: siteConfig.url,
    languages: { en: siteConfig.url, "x-default": siteConfig.url },
  },
  openGraph: {
    title: "DevStackIO — 128 Free Online Developer Tools",
    description:
      "128 free online developer tools for coding, debugging, and productivity. Format JSON, decode JWT, generate UUIDs, convert data, and more — all client-side, zero uploads.",
    url: siteConfig.url,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "DevStackIO Free Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStackIO — 128 Free Online Developer Tools",
    description:
      "128 free online developer tools for coding, debugging, and productivity. Format JSON, decode JWT, generate UUIDs, convert data, and more — all client-side, zero uploads.",
    images: [siteConfig.ogImage],
  },
};

export default function Home() {
  return (
    <>
      <Hero
        badgeText={`${TOOL_COUNT} free tools. No login required.`}
        searchPlaceholder={`Search ${TOOL_COUNT} tools...`}
      />
      <AdBanner className="my-12" slot="1234567890" />
      <CategoriesSection />
      <FeaturedTools />
      <AdBanner className="my-12" slot="2345678901" />
      <BenefitsSection />
      <LearningSection />
      <AdBanner className="my-12" slot="3456789012" />
      <CommunitySection />
      <NewsletterSection />
      <FAQSection />
    </>
  );
}
