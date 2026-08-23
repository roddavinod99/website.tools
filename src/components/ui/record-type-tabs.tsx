"use client";

import { TabSet, TabList, Tab, TabPanel } from "./tabs";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "PTR", "CAA", "ANY"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

interface RecordTypeTabsProps {
  data: Record<RecordType, { answers: unknown[]; loading: boolean; error?: string }> | null;
  activeType: RecordType;
  onTypeChange: (type: RecordType) => void;
  className?: string;
}

export function RecordTypeTabs({ data, activeType, onTypeChange, className = "" }: RecordTypeTabsProps) {
  if (!data) return null;

  return (
    <TabSet defaultActive={activeType} onChange={onTypeChange as (tabId: string) => void} className={className}>
      <TabList ariaLabel="DNS Record Types">
        {RECORD_TYPES.map((type) => {
          const typeData = data[type];
          const count = typeData?.answers?.length || 0;
          const hasError = !!typeData?.error;

          return (
            <Tab key={type} id={type} disabled={typeData?.loading} badge={count || undefined}>
              {type}
              {hasError && <span className="text-error ml-1">!</span>}
            </Tab>
          );
        })}
      </TabList>
      {RECORD_TYPES.map((type) => (
        <TabPanel key={type} id={type}>
          {type === activeType && (
            <div className="mt-4">
              {/* Content rendered by parent based on active type */}
            </div>
          )}
        </TabPanel>
      ))}
    </TabSet>
  );
}