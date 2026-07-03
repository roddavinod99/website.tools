import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Report Bug",
  description: "Report a bug or issue with a DevStackIO tool.",
  alternates: { canonical: `${siteConfig.url}/report-bug` },
};

export default function ReportBugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
