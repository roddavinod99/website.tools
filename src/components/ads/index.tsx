import type { AdPlaceholderProps } from "@/types";
import { AdUnit as AdUnitComponent } from "./ad-unit";

export { AdUnitComponent as AdUnit };

export function AdBanner(props: AdPlaceholderProps) {
  return <AdUnitComponent format="horizontal" label="Ad Banner" {...props} />;
}

export function SidebarAd(props: AdPlaceholderProps) {
  return <AdUnitComponent format="vertical" label="Sidebar Ad" {...props} />;
}

export function InContentAd(props: AdPlaceholderProps) {
  return <AdUnitComponent format="rectangle" label="In-Content Ad" {...props} />;
}

export function ResponsiveAd(props: AdPlaceholderProps) {
  return <AdUnitComponent format="auto" label="Responsive Ad" {...props} />;
}
