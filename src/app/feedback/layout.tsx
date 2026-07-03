import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Send feedback about DevStackIO tools and platform.",
  alternates: { canonical: `${siteConfig.url}/feedback` },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
