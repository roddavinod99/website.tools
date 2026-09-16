import { ShieldCheck, EyeOff, Lock } from "lucide-react";

const PILLS = [
  { label: "100% Client-Side", Icon: ShieldCheck },
  { label: "Your Data Stays Local", Icon: EyeOff },
  { label: "No Account Required", Icon: Lock },
] as const;

/**
 * Privacy promise as a single text row below the H1 (spec §4.2).
 * Text only — no card, no border, no background. Icons are decorative.
 */
export function TrustPills() {
  return (
    <ul aria-label="Privacy guarantees" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
      {PILLS.map(({ label, Icon }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
