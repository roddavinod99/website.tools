import { Hero } from "@/components/home/hero";
import { TOOL_COUNT } from "@/lib/constants";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedTools } from "@/components/home/featured-tools";
import { BenefitsSection } from "@/components/home/benefits-section";
import { LearningSection } from "@/components/home/learning-section";
import { CommunitySection } from "@/components/home/community-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { FAQSection } from "@/components/home/faq-section";

export default function Home() {
  return (
    <>
      <Hero
        badgeText={`${TOOL_COUNT} free tools. No login required.`}
        searchPlaceholder={`Search ${TOOL_COUNT} tools...`}
      />
      <CategoriesSection />
      <FeaturedTools />
      <BenefitsSection />
      <LearningSection />
      <CommunitySection />
      <NewsletterSection />
      <FAQSection />
    </>
  );
}
