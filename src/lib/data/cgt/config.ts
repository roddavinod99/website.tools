import type { CgtBracket } from "@/lib/tax/cgt-types";
import indiaData from "./india.json";
import usData from "./us.json";
import ukData from "./uk.json";
import canadaData from "./canada.json";
import australiaData from "./australia.json";

// Provincial/territorial bracket data (shared with the income-tax calculator).
import ab from "../tax/canada/provinces/ab.json";
import bc from "../tax/canada/provinces/bc.json";
import mb from "../tax/canada/provinces/mb.json";
import nb from "../tax/canada/provinces/nb.json";
import nl from "../tax/canada/provinces/nl.json";
import ns from "../tax/canada/provinces/ns.json";
import nt from "../tax/canada/provinces/nt.json";
import nu from "../tax/canada/provinces/nu.json";
import on from "../tax/canada/provinces/on.json";
import pe from "../tax/canada/provinces/pe.json";
import qc from "../tax/canada/provinces/qc.json";
import sk from "../tax/canada/provinces/sk.json";
import yt from "../tax/canada/provinces/yt.json";

export interface CgtTaxYearData {
  id: string;
  label: string;
  lastUpdated: string;
  sources?: { label: string; url: string }[];
  notes?: string[];
  [key: string]: unknown;
}

export interface CgtCountryData {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  defaultTaxYearId: string;
  taxYears: CgtTaxYearData[];
}

export const cgtIndia = indiaData as unknown as CgtCountryData;
export const cgtUs = usData as unknown as CgtCountryData;
export const cgtUk = ukData as unknown as CgtCountryData;
export const cgtCanada = canadaData as unknown as CgtCountryData;
export const cgtAustralia = australiaData as unknown as CgtCountryData;

const provinceFiles: Record<string, { slabs: CgtBracket[] }> = {
  ab, bc, mb, nb, nl, ns, nt, nu, on, pe, qc, sk, yt,
};

/** Lowercase code → provincial brackets (approximate; surtaxes not modelled). */
export const canadaProvinceBrackets: Record<string, CgtBracket[]> = Object.fromEntries(
  Object.entries(provinceFiles).map(([code, file]) => [code, file.slabs])
);

export const canadaProvinceCodes = Object.keys(provinceFiles);

export const allCgtCountries: CgtCountryData[] = [cgtIndia, cgtUs, cgtUk, cgtCanada, cgtAustralia];

export function getCgtCountryData(countryCode: string): CgtCountryData | undefined {
  return allCgtCountries.find((c) => c.countryCode === countryCode);
}

export function pickCgtYear(data: CgtCountryData, taxYearId?: string): CgtTaxYearData {
  const year = data.taxYears.find((y) => y.id === (taxYearId || data.defaultTaxYearId)) ?? data.taxYears[0];
  if (!year) throw new Error(`No tax years defined for ${data.countryCode}`);
  return year;
}
