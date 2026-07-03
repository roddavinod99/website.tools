import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Suggest a Tool",
  description: "Suggest a new developer tool for DevStackIO.",
  alternates: { canonical: `${siteConfig.url}/suggest` },
};

export default function SuggestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
