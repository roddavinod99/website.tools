"use client";

import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface FeatureBadgeProps {
  feature: string;
  variant?: "brand" | "outline" | "subtle";
  size?: "sm" | "md";
  withIcon?: boolean;
  description?: string;
}

const featureDescriptions: Record<string, string> = {
  "Syntax highlighting": "Color-coded syntax for easier reading",
  "Error detection with line numbers": "Shows exact line/column of JSON errors",
  "Minify/pretty-print toggle": "Switch between compact and formatted output",
  "Copy to clipboard": "One-click copy of results",
  "Download formatted file": "Save output as a file",
  "Line-level syntax errors with position hints": "Precise error locations in your code",
  "Optional sorting": "Sort keys alphabetically",
  "Search in output with navigation": "Find and jump between matches",
  "Input statistics (lines, chars, depth)": "Shows document metrics at a glance",
  "Auto-format on paste": "Instantly beautifies pasted content",
  "Live results from real DNS servers": "Queries actual DNS infrastructure",
  "RDAP/WHOIS registration summary": "Shows registrar, dates, and status",
  "Multiple record types (A, AAAA, MX, NS, TXT, etc.)": "Comprehensive DNS record support",
  "Geolocate an IP address": "Find geographic location of any IP",
  "ISP, ASN, and country details": "Network provider and routing info",
  "Live results from public databases": "Real-time geolocation data",
  "Convert between 160+ currencies": "Global currency coverage",
  "Live exchange rates cached for 10 minutes": "Fresh rates without hammering APIs",
  "Shows exchange rate and timestamp": "Full transparency on rate used",
  "8 categories and 29 field types": "People, Companies, Finance, Internet, IDs, Dates, Text, Numbers",
  "Names, emails, companies, addresses, phone numbers, UUIDs, and more": "Comprehensive test data types",
  "Locale-aware data for realistic results": "Regional names, addresses, phone formats",
  "Seed-based reproducible generation": "Same seed = identical output",
  "JSON, CSV, and more export formats": "Multiple output formats for different needs",
  "Beautify, minify, and validate JSON": "Complete JSON toolkit",
  "Generate secure random passwords": "Cryptographically strong passwords",
  "Customizable length, characters, and complexity": "Full control over password policy",
  "Strength meter with entropy calculation": "Real-time security assessment",
  "Pronounceable and PIN modes": "Alternative password styles",
  "History with restore": "Access previously generated passwords",
  "Multiple QR code types (URL, Email, Phone, WiFi, vCard, Location)": "All common QR formats",
  "Customizable colors, gradients, and dot shapes": "Branded QR codes",
  "Logo embedding with error correction": "Add your logo to QR codes",
  "PNG, SVG, JPEG output formats": "Multiple export formats",
  "High/medium/low error correction levels": "Balance size vs durability",
};

export function FeatureBadge({
  feature,
  variant = "brand",
  size = "sm",
  withIcon = true,
  description,
}: FeatureBadgeProps) {
  const desc = description || featureDescriptions[feature];
  const Icon = withIcon ? Check : null;

  const baseClasses = "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors";
  const variantClasses = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
    outline: "border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border",
    subtle: "bg-surface-100 text-surface-600 dark:bg-dark-surface dark:text-dark-muted",
  };
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  };

  const badge = (
    <span className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}>
      {Icon && <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />}
      {feature}
    </span>
  );

  if (desc) {
    return (
      <Tooltip content={desc} side="top" align="center" delay={300}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}

interface FeatureBadgesGroupProps {
  features: string[];
  variant?: "brand" | "outline" | "subtle";
  size?: "sm" | "md";
  maxVisible?: number;
  showMoreLabel?: string;
  onShowMore?: () => void;
}

export function FeatureBadgesGroup({
  features,
  variant = "brand",
  size = "sm",
  maxVisible = 4,
  showMoreLabel = "Show more",
  onShowMore,
}: FeatureBadgesGroupProps) {
  if (!features.length) return null;

  const visible = features.slice(0, maxVisible);
  const hiddenCount = features.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Key features">
      {visible.map((feature, i) => (
        <div key={i} role="listitem">
          <FeatureBadge feature={feature} variant={variant} size={size} withIcon />
        </div>
      ))}
      {hiddenCount > 0 && onShowMore && (
        <div role="listitem">
          <button
            type="button"
            onClick={onShowMore}
            className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-white px-2.5 py-1 text-[11px] font-medium text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
            aria-label={`${showMoreLabel} (${hiddenCount} more features)`}
          >
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            +{hiddenCount}
          </button>
        </div>
      )}
    </div>
  );
}