import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Feature Request",
  description: "Suggest a new feature for DevStackIO tools.",
  alternates: { canonical: `${siteConfig.url}/feature-request` },
};

export default function FeatureRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
