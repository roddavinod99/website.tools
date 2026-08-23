"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, ResultCard, CurrencyGrid } from "./index";

interface ConverterShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  primaryResult?: {
    label: string;
    value: ReactNode;
    sublabel?: string;
    actions?: ReactNode;
  };
  secondaryResults?: {
    baseAmount: number;
    baseCurrency: string;
    rates: Record<string, number>;
    targetCurrency: string;
    featured?: string[];
    maxVisible?: number;
    onSelect: (currency: string) => void;
  };
  swapAction?: ReactNode;
  className?: string;
}

export function ConverterShell({
  title,
  description,
  children,
  primaryResult,
  secondaryResults,
  swapAction,
  className = "",
}: ConverterShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Converters", description: description || "" }}
      className={className}
    >
      <ToolWorkspace>
        {title && (
          <header className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-dark-text">{title}</h1>
            {description && <p className="text-base text-surface-500 dark:text-dark-muted">{description}</p>}
          </header>
        )}
        <section className="space-y-4">{children}</section>
        {swapAction && (
          <div className="flex justify-center my-2">{swapAction}</div>
        )}
        {primaryResult && (
          <ResultCard
            label={primaryResult.label}
            value={primaryResult.value}
            sublabel={primaryResult.sublabel}
            actions={primaryResult.actions}
            className="mt-4"
          />
        )}
        {secondaryResults && (
          <CurrencyGrid
            baseAmount={secondaryResults.baseAmount}
            baseCurrency={secondaryResults.baseCurrency}
            rates={secondaryResults.rates}
            targetCurrency={secondaryResults.targetCurrency}
            featured={secondaryResults.featured}
            maxVisible={secondaryResults.maxVisible}
            onSelect={secondaryResults.onSelect}
            className="mt-6"
          />
        )}
        <ActionBar primary={null} secondary={[]} className="mt-4" />
      </ToolWorkspace>
    </ToolShell>
  );
}